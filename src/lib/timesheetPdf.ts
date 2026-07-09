// Professional Timesheet PDF generator (Schmidt Construction letterhead + logo)
// Location: src/lib/timesheetPdf.ts
// Uses jsPDF directly for crisp vector text. Embeds the site logo and matches
// the website palette (slate-900 header, amber-600 accent).
//
// Layout: for each employee, a daily-row breakdown (one row per day —
// multiple shifts in a day are combined, hours + breaks summed, comments joined
// and shown in the Break/Notes column), followed by that employee's subtotal.
// Ends with grand totals + signature lines.

'use client';

import { TimesheetSummary, TimeEntryWithHours } from './types';
import { formatCurrency } from './timeclock';

export interface TimesheetPdfMeta {
  periodFrom: string; // YYYY-MM-DD
  periodTo: string;   // YYYY-MM-DD
  generatedBy?: string;
}

const SLATE = '#0f172a';   // slate-900 (header, primary text)
const AMBER = '#d97706';   // amber-600 (accent)
const GRAY = '#64748b';    // slate-500 (muted)

function fmtLong(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// A day's aggregated data for one employee.
interface DayRow {
  dateKey: string;    // YYYY-MM-DD
  dateLabel: string;  // e.g. "Mon 7/6"
  firstIn: Date | null;
  lastOut: Date | null;
  breakMinutes: number;
  hours: number;
  hasOpen: boolean;
  notes: string[];
}

// Group an employee's entries into one row per calendar day.
function groupByDay(entries: TimeEntryWithHours[]): DayRow[] {
  const map = new Map<string, DayRow>();
  const sorted = [...entries].sort((a, b) => new Date(a.clock_in).getTime() - new Date(b.clock_in).getTime());
  for (const e of sorted) {
    const ci = new Date(e.clock_in);
    const p = (n: number) => String(n).padStart(2, '0');
    const key = `${ci.getFullYear()}-${p(ci.getMonth() + 1)}-${p(ci.getDate())}`;
    const label = ci.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
    let row = map.get(key);
    if (!row) {
      row = { dateKey: key, dateLabel: label, firstIn: null, lastOut: null, breakMinutes: 0, hours: 0, hasOpen: false, notes: [] };
      map.set(key, row);
    }
    if (!row.firstIn || ci < row.firstIn) row.firstIn = ci;
    const co = e.clock_out ? new Date(e.clock_out) : null;
    if (co && (!row.lastOut || co > row.lastOut)) row.lastOut = co;
    row.breakMinutes += e.break_minutes || 0;
    row.hours += e.worked_hours || 0;
    if (e.is_open) row.hasOpen = true;
    if (e.notes && e.notes.trim()) row.notes.push(e.notes.trim());
  }
  return Array.from(map.values());
}

const hhmm = (d: Date | null) => d ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

// Fetch the site logo (/logo.png) and return it as a PNG data URL for jsPDF.
async function loadLogoDataUrl(): Promise<{ dataUrl: string; w: number; h: number } | null> {
  try {
    const res = await fetch('/logo.png');
    const blob = await res.blob();
    const dataUrl: string = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onloadend = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
    const dims = await new Promise<{ w: number; h: number }>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => resolve({ w: 0, h: 0 });
      img.src = dataUrl;
    });
    return { dataUrl, w: dims.w, h: dims.h };
  } catch {
    return null;
  }
}

// Build the timesheet PDF and return it as a Blob (for download or email attachment).
export async function buildTimesheetPdf(
  summaries: TimesheetSummary[],
  meta: TimesheetPdfMeta
): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageW = 210;
  const pageH = 297;
  const margin = 14;
  let y = 0;

  const logo = await loadLogoDataUrl();

  // ---- Letterhead (drawn on every page) ----
  const drawHeader = () => {
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageW, 30, 'F');
    // Logo on the left (white area), scaled to fit ~40mm wide within the bar.
    if (logo && logo.w > 0) {
      const maxW = 46, maxH = 16;
      const ratio = logo.w / logo.h;
      let w = maxW, h = maxW / ratio;
      if (h > maxH) { h = maxH; w = maxH * ratio; }
      // White rounded plate behind the logo for contrast on the dark bar.
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin - 2, 7, w + 4, h + 4, 1.5, 1.5, 'F');
      try { doc.addImage(logo.dataUrl, 'PNG', margin, 9, w, h); } catch { /* ignore */ }
    }
    // Company text on the right.
    doc.setTextColor('#ffffff');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.text('SCHMIDT CONSTRUCTION', pageW - margin, 14, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor('#cbd5e1');
    doc.text('50+ Years of Family-Owned Excellence · Omaha, NE', pageW - margin, 20, { align: 'right' });
    doc.text('(402) 320-2600 · Mike@walls2.com', pageW - margin, 24.5, { align: 'right' });
    // Amber accent bar.
    doc.setFillColor(217, 119, 6);
    doc.rect(0, 30, pageW, 1.5, 'F');
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > pageH - margin) {
      doc.addPage();
      drawHeader();
      y = 40;
    }
  };

  drawHeader();
  y = 40;

  // ---- Title block ----
  doc.setTextColor(SLATE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Employee Timesheet', margin, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(GRAY);
  doc.text(`Pay Period:  ${fmtLong(meta.periodFrom)}  –  ${fmtLong(meta.periodTo)}`, margin, y);
  y += 5;
  doc.text(`Generated:  ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}${meta.generatedBy ? `  by ${meta.generatedBy}` : ''}`, margin, y);
  y += 10;

  let grandHours = 0, grandOt = 0, grandPay = 0;

  // ---- Per-employee daily sections ----
  for (const s of summaries) {
    grandHours += s.total_hours; grandOt += s.overtime_hours; grandPay += s.total_pay;
    const days = groupByDay(s.entries);

    ensureSpace(30);

    // Employee band.
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(margin, y - 4, pageW - margin * 2, 8, 'F');
    doc.setTextColor('#ffffff');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(s.employee_name, margin + 2, y + 1.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor('#cbd5e1');
    doc.text(`${formatCurrency(s.hourly_rate)}/hr`, pageW - margin - 2, y + 1.5, { align: 'right' });
    y += 9;

    // Daily table header.
    const cols = [
      { label: 'Date', x: margin, align: 'left' as const },
      { label: 'In', x: margin + 34, align: 'left' as const },
      { label: 'Out', x: margin + 54, align: 'left' as const },
      { label: 'Break / Notes', x: margin + 76, align: 'left' as const },
      { label: 'Hours', x: pageW - margin, align: 'right' as const },
    ];
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(margin, y - 4, pageW - margin * 2, 6.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(SLATE);
    cols.forEach((c) => doc.text(c.label, c.x, y, { align: c.align }));
    y += 5.5;

    // Daily rows.
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    if (days.length === 0) {
      doc.setTextColor(GRAY);
      doc.text('No shifts in this period.', margin + 2, y);
      y += 5;
    }
    for (const d of days) {
      const breakStr = d.breakMinutes > 0 ? `${d.breakMinutes}m break` : 'No break';
      const noteStr = d.notes.length ? `  ·  ${d.notes.join('; ')}` : '';
      const breakNotes = `${breakStr}${noteStr}`;
      // Wrap the break/notes text to fit its column width.
      const notesMaxW = (pageW - margin) - (margin + 76) - 18;
      const wrapped = doc.splitTextToSize(breakNotes, notesMaxW) as string[];
      const rowH = Math.max(5, wrapped.length * 4);
      ensureSpace(rowH + 2);

      doc.setTextColor(SLATE);
      doc.text(d.dateLabel, margin, y);
      doc.setTextColor(GRAY);
      doc.text(hhmm(d.firstIn), margin + 34, y);
      doc.text(d.hasOpen && !d.lastOut ? 'In progress' : hhmm(d.lastOut), margin + 54, y);
      doc.text(wrapped, margin + 76, y);
      doc.setTextColor(SLATE);
      doc.setFont('helvetica', 'bold');
      doc.text(d.hasOpen && d.hours === 0 ? '—' : d.hours.toFixed(2), pageW - margin, y, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      y += rowH;
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y - 1.5, pageW - margin, y - 1.5);
    }

    // Employee subtotal.
    ensureSpace(8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(SLATE);
    const sub = `Reg ${s.regular_hours.toFixed(2)}   OT ${s.overtime_hours.toFixed(2)}   Total ${s.total_hours.toFixed(2)} hrs`;
    doc.text(sub, margin + 2, y + 2);
    doc.setTextColor(AMBER);
    doc.text(`${formatCurrency(s.total_pay)}`, pageW - margin, y + 2, { align: 'right' });
    y += 10;
    doc.setFont('helvetica', 'normal');
  }

  // ---- Grand totals ----
  ensureSpace(16);
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y - 4, pageW - margin * 2, 9, 'F');
  doc.setTextColor('#ffffff');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('GRAND TOTALS', margin + 2, y + 1.5);
  doc.text(`OT ${grandOt.toFixed(2)}`, pageW - margin - 60, y + 1.5, { align: 'right' });
  doc.text(`${grandHours.toFixed(2)} hrs`, pageW - margin - 32, y + 1.5, { align: 'right' });
  doc.setTextColor('#4ade80');
  doc.text(formatCurrency(grandPay), pageW - margin - 2, y + 1.5, { align: 'right' });
  y += 18;

  // ---- Signature lines ----
  ensureSpace(16);
  doc.setDrawColor(148, 163, 184);
  doc.line(margin, y, margin + 70, y);
  doc.line(pageW - margin - 70, y, pageW - margin, y);
  y += 5;
  doc.setTextColor(GRAY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Approved by', margin, y);
  doc.text('Date', pageW - margin - 70, y);

  // ---- Footer on every page ----
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(GRAY);
    doc.text(
      'Schmidt Construction Inc. · Licensed & Insured · Overtime calculated per week (>40 hrs at 1.5×)',
      pageW / 2, pageH - 8, { align: 'center' }
    );
    doc.text(`Page ${i} of ${pages}`, pageW - margin, pageH - 8, { align: 'right' });
  }

  return doc.output('blob');
}

// Build a CSV string for the same summaries (payroll import friendly).
export function buildTimesheetCsv(summaries: TimesheetSummary[], meta: TimesheetPdfMeta): string {
  const rows: string[][] = [
    [`Schmidt Construction Timesheet`],
    [`Pay Period`, `${meta.periodFrom} to ${meta.periodTo}`],
    [],
    ['Employee', 'Date', 'Clock In', 'Clock Out', 'Break (min)', 'Notes', 'Hours'],
  ];
  for (const s of summaries) {
    for (const d of groupByDay(s.entries)) {
      rows.push([
        s.employee_name,
        d.dateKey,
        hhmm(d.firstIn),
        d.hasOpen && !d.lastOut ? 'In progress' : hhmm(d.lastOut),
        String(d.breakMinutes),
        d.notes.join('; '),
        d.hours.toFixed(2),
      ]);
    }
    rows.push([`${s.employee_name} — TOTAL`, '', '', '', '', `Reg ${s.regular_hours.toFixed(2)} / OT ${s.overtime_hours.toFixed(2)}`, s.total_hours.toFixed(2)]);
    rows.push([]);
  }
  return rows.map((r) => r.map((c) => `"${c ?? ''}"`).join(',')).join('\n');
}

// Filename based on the pay period, e.g. Schmidt-Timesheet-2026-07-06_to_2026-07-12
export function timesheetFilename(meta: TimesheetPdfMeta, ext: string): string {
  return `Schmidt-Timesheet-${meta.periodFrom}_to_${meta.periodTo}.${ext}`;
}

// Trigger a browser download of a Blob.
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
