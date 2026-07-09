// Professional Timesheet PDF generator (Schmidt Construction letterhead)
// Location: src/lib/timesheetPdf.ts
// Uses jsPDF directly for crisp vector text (not a DOM screenshot).

'use client';

import { TimesheetSummary } from './types';
import { formatCurrency } from './timeclock';

export interface TimesheetPdfMeta {
  periodFrom: string; // YYYY-MM-DD
  periodTo: string;   // YYYY-MM-DD
  generatedBy?: string;
}

const SLATE = '#0f172a';
const AMBER = '#d97706';
const GRAY = '#64748b';
const LIGHT = '#f1f5f9';

function fmtDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Build the timesheet PDF and return it as a Blob (for download or email attachment).
export async function buildTimesheetPdf(
  summaries: TimesheetSummary[],
  meta: TimesheetPdfMeta
): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageW = 210;
  const margin = 14;
  let y = margin;

  // ---- Letterhead ----
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageW, 30, 'F');
  doc.setTextColor('#ffffff');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('SCHMIDT CONSTRUCTION', margin, 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize?.(0); // no-op guard for older typings
  doc.setFontSize(9);
  doc.setTextColor('#cbd5e1');
  doc.text('50+ Years of Family-Owned Excellence  ·  Omaha, NE', margin, 20);
  doc.text('(402) 320-2600  ·  Mike@walls2.com', margin, 25);

  // Amber accent bar
  doc.setFillColor(217, 119, 6);
  doc.rect(0, 30, pageW, 1.5, 'F');

  y = 42;

  // ---- Title ----
  doc.setTextColor(SLATE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Employee Timesheet', margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(GRAY);
  doc.text(`Pay Period:  ${fmtDate(meta.periodFrom)}  –  ${fmtDate(meta.periodTo)}`, margin, y);
  y += 5;
  doc.text(`Generated:  ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}${meta.generatedBy ? `  by ${meta.generatedBy}` : ''}`, margin, y);
  y += 9;

  // ---- Table header ----
  const cols = [
    { label: 'Employee', x: margin, w: 46, align: 'left' as const },
    { label: 'Rate', x: margin + 46, w: 20, align: 'right' as const },
    { label: 'Reg', x: margin + 66, w: 18, align: 'right' as const },
    { label: 'OT', x: margin + 84, w: 16, align: 'right' as const },
    { label: 'Total', x: margin + 100, w: 18, align: 'right' as const },
    { label: 'Reg Pay', x: margin + 118, w: 26, align: 'right' as const },
    { label: 'OT Pay', x: margin + 144, w: 20, align: 'right' as const },
    { label: 'Total Pay', x: margin + 164, w: 18, align: 'right' as const },
  ];

  const drawHeader = () => {
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y - 4, pageW - margin * 2, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(SLATE);
    cols.forEach((c) => {
      const tx = c.align === 'right' ? c.x + c.w : c.x;
      doc.text(c.label, tx, y, { align: c.align });
    });
    y += 6;
  };
  drawHeader();

  // ---- Rows ----
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  let totHours = 0, totOt = 0, totPay = 0;

  summaries.forEach((s) => {
    if (y > 270) { doc.addPage(); y = margin + 4; drawHeader(); doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); }
    totHours += s.total_hours; totOt += s.overtime_hours; totPay += s.total_pay;
    const cells = [
      s.employee_name,
      formatCurrency(s.hourly_rate),
      s.regular_hours.toFixed(2),
      s.overtime_hours.toFixed(2),
      s.total_hours.toFixed(2),
      formatCurrency(s.regular_pay),
      formatCurrency(s.overtime_pay),
      formatCurrency(s.total_pay),
    ];
    doc.setTextColor(SLATE);
    cells.forEach((val, i) => {
      const c = cols[i];
      const tx = c.align === 'right' ? c.x + c.w : c.x;
      if (i === 3 && s.overtime_hours > 0) doc.setTextColor(AMBER);
      doc.text(String(val), tx, y, { align: c.align });
      if (i === 3) doc.setTextColor(SLATE);
    });
    y += 5.5;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y - 2, pageW - margin, y - 2);
  });

  // ---- Totals row ----
  y += 2;
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y - 4, pageW - margin * 2, 8, 'F');
  doc.setTextColor('#ffffff');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TOTALS', margin + 2, y + 1);
  doc.text(totHours.toFixed(2), cols[4].x + cols[4].w, y + 1, { align: 'right' });
  doc.text(totOt.toFixed(2), cols[3].x + cols[3].w, y + 1, { align: 'right' });
  doc.text(formatCurrency(totPay), cols[7].x + cols[7].w, y + 1, { align: 'right' });
  y += 14;

  // ---- Signature lines ----
  doc.setTextColor(GRAY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setDrawColor(148, 163, 184);
  doc.line(margin, y, margin + 70, y);
  doc.line(pageW - margin - 70, y, pageW - margin, y);
  y += 5;
  doc.text('Approved by', margin, y);
  doc.text('Date', pageW - margin - 70, y);

  // ---- Footer ----
  doc.setFontSize(7.5);
  doc.setTextColor(GRAY);
  doc.text(
    'Schmidt Construction Inc.  ·  Licensed & Insured  ·  Overtime calculated per week (>40 hrs at 1.5×)',
    pageW / 2, 290, { align: 'center' }
  );

  return doc.output('blob');
}

// Build a CSV string for the same summaries (payroll import friendly).
export function buildTimesheetCsv(summaries: TimesheetSummary[], meta: TimesheetPdfMeta): string {
  const rows = [
    [`Schmidt Construction Timesheet`],
    [`Pay Period`, `${meta.periodFrom} to ${meta.periodTo}`],
    [],
    ['Employee', 'Hourly Rate', 'Regular Hours', 'Overtime Hours', 'Total Hours', 'Regular Pay', 'Overtime Pay', 'Total Pay'],
    ...summaries.map((s) => [
      s.employee_name,
      s.hourly_rate.toFixed(2),
      s.regular_hours.toFixed(2),
      s.overtime_hours.toFixed(2),
      s.total_hours.toFixed(2),
      s.regular_pay.toFixed(2),
      s.overtime_pay.toFixed(2),
      s.total_pay.toFixed(2),
    ]),
  ];
  return rows.map((r) => r.map((c) => `"${c ?? ''}"`).join(',')).join('\n');
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
