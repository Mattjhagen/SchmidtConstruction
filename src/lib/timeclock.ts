// Time Clock Hours & Payroll Engine (pure functions, no I/O)
// Location: src/lib/timeclock.ts
//
// Rules implemented:
//   - Worked hours = (clock_out - clock_in) - break_minutes
//   - Overtime = hours beyond 40 in any ISO week (Mon-Sun), paid at 1.5x
//   - Payroll cost = regular_hours * rate + overtime_hours * rate * 1.5

import { Employee, TimeEntry, TimeEntryWithHours, TimesheetSummary } from './types';

export const OVERTIME_THRESHOLD_HOURS = 40;
export const OVERTIME_MULTIPLIER = 1.5;

/** Midnight (00:00) at the END of the given date's day — i.e. start of next day. */
function endOfDay(d: Date): Date {
  const m = new Date(d);
  m.setHours(24, 0, 0, 0); // rolls to 00:00 next day
  return m;
}

/**
 * Effective end time for a shift:
 *  - closed shift               -> clock_out
 *  - open, started today        -> now (still running)
 *  - open, started on a past day -> midnight of that start day (auto-cap)
 */
export function effectiveEnd(entry: TimeEntry, now: Date = new Date()): { end: Date; capped: boolean } {
  if (entry.clock_out) return { end: new Date(entry.clock_out), capped: false };
  const start = new Date(entry.clock_in);
  const midnight = endOfDay(start);
  if (now.getTime() >= midnight.getTime()) return { end: midnight, capped: true };
  return { end: now, capped: false };
}

/** Total break minutes including an in-progress lunch (break_start). */
export function effectiveBreakMinutes(entry: TimeEntry, now: Date = new Date()): number {
  let mins = entry.break_minutes || 0;
  if (entry.break_start) {
    const bs = new Date(entry.break_start).getTime();
    if (!isNaN(bs) && now.getTime() > bs) mins += (now.getTime() - bs) / (1000 * 60);
  }
  return mins;
}

/**
 * Net worked hours for an entry (break deducted). Open shifts count up to their
 * effective end (now, or midnight cap if left open overnight).
 */
export function computeWorkedHours(entry: TimeEntry, now: Date = new Date()): number {
  const start = new Date(entry.clock_in).getTime();
  const { end: endDate } = effectiveEnd(entry, now);
  const end = endDate.getTime();
  if (isNaN(start) || isNaN(end) || end <= start) return 0;
  const grossHours = (end - start) / (1000 * 60 * 60);
  const netHours = grossHours - effectiveBreakMinutes(entry, now) / 60;
  return Math.max(0, Math.round(netHours * 100) / 100);
}

/** Attach computed worked hours + open flag to an entry. */
export function withHours(entry: TimeEntry, now: Date = new Date()): TimeEntryWithHours {
  const { capped } = effectiveEnd(entry, now);
  return {
    ...entry,
    worked_hours: computeWorkedHours(entry, now),
    is_open: !entry.clock_out,
    is_capped: !entry.clock_out && capped,
  };
}

/** Live elapsed hours for an in-progress shift (break deducted, midnight-capped). */
export function liveElapsedHours(entry: TimeEntry, now: Date = new Date()): number {
  return computeWorkedHours(entry, now);
}

/**
 * ISO week key (e.g. "2026-W28") for a timestamp. Weeks start Monday.
 * Overtime is computed per ISO week so a range spanning multiple weeks
 * applies the 40-hour threshold to each week independently.
 */
export function isoWeekKey(iso: string): string {
  const d = new Date(iso);
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7; // Sun=0 -> 7
  date.setUTCDate(date.getUTCDate() + 4 - day); // shift to Thursday of the week
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Roll up a set of entries for one employee into a payroll summary.
 * Overtime is applied per ISO week (>40 net hours => excess billed at 1.5x).
 */
export function summarizeTimesheet(
  employee: Pick<Employee, 'id' | 'name' | 'hourly_rate'>,
  entries: TimeEntry[]
): TimesheetSummary {
  // NOTE: wrap in an arrow so Array.map's index isn't passed as `now`.
  const nowTs = new Date();
  const withHrs = entries.map((e) => withHours(e, nowTs));

  // Group closed hours by ISO week to apply the weekly OT threshold.
  // Open shifts are included at their effective (live or midnight-capped) hours
  // so a forgotten clock-out still reaches payroll instead of being dropped.
  const weekTotals: Record<string, number> = {};
  for (const e of withHrs) {
    const key = isoWeekKey(e.clock_in);
    weekTotals[key] = (weekTotals[key] || 0) + e.worked_hours;
  }

  let regularHours = 0;
  let overtimeHours = 0;
  for (const hours of Object.values(weekTotals)) {
    const reg = Math.min(hours, OVERTIME_THRESHOLD_HOURS);
    const ot = Math.max(0, hours - OVERTIME_THRESHOLD_HOURS);
    regularHours += reg;
    overtimeHours += ot;
  }

  const rate = employee.hourly_rate || 0;
  const regularPay = round2(regularHours * rate);
  const overtimePay = round2(overtimeHours * rate * OVERTIME_MULTIPLIER);

  return {
    employee_id: employee.id,
    employee_name: employee.name,
    hourly_rate: rate,
    total_hours: round2(regularHours + overtimeHours),
    regular_hours: round2(regularHours),
    overtime_hours: round2(overtimeHours),
    regular_pay: regularPay,
    overtime_pay: overtimePay,
    total_pay: round2(regularPay + overtimePay),
    entries: withHrs,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Format decimal hours as "Hh Mm" (e.g. 7.5 -> "7h 30m"). */
export function formatHoursMinutes(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

/** Format a currency amount as USD. */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}
