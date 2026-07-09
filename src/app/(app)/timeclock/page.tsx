// Employee Self-Service Time Clock
// Location: src/app/(app)/timeclock/page.tsx

'use client';

import { useEffect, useState, useCallback } from 'react';
import { db } from '@/lib/db';
import { auth, getAuthUserId } from '@/lib/auth';
import { Employee, TimeEntry } from '@/lib/types';
import {
  summarizeTimesheet,
  liveElapsedHours,
  formatHoursMinutes,
  formatCurrency,
} from '@/lib/timeclock';
import { Clock, Play, Square, Coffee, Briefcase, TrendingUp, AlertCircle } from 'lucide-react';

export default function TimeClockPage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [openEntry, setOpenEntry] = useState<TimeEntry | null>(null);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [breakMinutes, setBreakMinutes] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [now, setNow] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [busy, setBusy] = useState(false);

  // Resolve the signed-in user to an employee profile.
  const resolveEmployee = useCallback(async (): Promise<Employee | null> => {
    const employees = await db.getEmployees();
    if (employees.length === 0) return null;

    // Supabase mode: match by auth user_id.
    const uid = await getAuthUserId();
    if (uid) {
      const byUser = await db.getEmployeeByUserId(uid);
      if (byUser) return byUser;
    }
    // Fallback (demo mode): match by session email, else first non-admin employee.
    const session = auth.getSessionUser();
    if (session?.email) {
      const byEmail = employees.find((e) => e.email.toLowerCase() === session.email.toLowerCase());
      if (byEmail) return byEmail;
    }
    return employees.find((e) => e.role === 'employee') || employees[0];
  }, []);

  const load = useCallback(async () => {
    try {
      const emp = await resolveEmployee();
      setEmployee(emp);
      if (emp) {
        const [open, list] = await Promise.all([
          db.getOpenTimeEntry(emp.id),
          db.getTimeEntries(emp.id),
        ]);
        setOpenEntry(open);
        setEntries(list);
      }
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Failed to load time clock.');
    } finally {
      setLoading(false);
    }
  }, [resolveEmployee]);

  useEffect(() => {
    load();
  }, [load]);

  // Live ticking clock for the in-progress shift.
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleClockIn = async () => {
    if (!employee) return;
    setBusy(true);
    setError('');
    try {
      await db.clockIn(employee.id, null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not clock in.');
    } finally {
      setBusy(false);
    }
  };

  const handleClockOut = async () => {
    if (!employee) return;
    setBusy(true);
    setError('');
    try {
      await db.clockOut(employee.id, breakMinutes, notes);
      setBreakMinutes(0);
      setNotes('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not clock out.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="max-w-lg mx-auto mt-12 bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
        <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-slate-800">No employee profile found</h2>
        <p className="text-sm text-slate-600 mt-2">
          Ask an admin to add you as an employee on the Timesheets screen before clocking in.
        </p>
      </div>
    );
  }

  // This week's summary (for the mini stat cards).
  const summary = summarizeTimesheet(employee, entries);
  const liveHours = openEntry ? liveElapsedHours(openEntry, now) : 0;
  const clockInTime = openEntry ? new Date(openEntry.clock_in) : null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-slate-900 rounded-lg">
          <Clock className="h-6 w-6 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Time Clock</h1>
          <p className="text-sm text-slate-500">Welcome, {employee.name}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center space-x-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main clock card */}
      <div className="bg-white border border-slate-200 rounded-2xl premium-shadow p-8 text-center">
        <div className="inline-flex items-center space-x-2 mb-4">
          <span className={`h-2.5 w-2.5 rounded-full ${openEntry ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
          <span className="text-sm font-medium text-slate-600">
            {openEntry ? 'Currently clocked in' : 'Not clocked in'}
          </span>
        </div>

        <div className="text-6xl font-bold tabular-nums text-slate-900 tracking-tight">
          {openEntry ? formatHoursMinutes(liveHours) : '0h 00m'}
        </div>
        {clockInTime && (
          <p className="text-sm text-slate-500 mt-2">
            Since {clockInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}

        <div className="mt-8">
          {!openEntry ? (
            <div className="space-y-4">
              <button
                onClick={handleClockIn}
                disabled={busy}
                className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors cursor-pointer"
              >
                <Play className="h-5 w-5" />
                <span>Clock In</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto text-left">
                <div>
                  <label className="flex items-center text-xs font-semibold text-slate-500 mb-1">
                    <Coffee className="h-3.5 w-3.5 mr-1" /> Break (minutes)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={breakMinutes}
                    onChange={(e) => setBreakMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Notes</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={handleClockOut}
                disabled={busy}
                className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors cursor-pointer"
              >
                <Square className="h-5 w-5" />
                <span>Clock Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* This week stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center text-slate-500 text-xs font-semibold mb-1">
            <Clock className="h-3.5 w-3.5 mr-1" /> TOTAL HOURS
          </div>
          <div className="text-2xl font-bold text-slate-900">{summary.total_hours.toFixed(2)}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center text-slate-500 text-xs font-semibold mb-1">
            <TrendingUp className="h-3.5 w-3.5 mr-1" /> OVERTIME
          </div>
          <div className="text-2xl font-bold text-amber-600">{summary.overtime_hours.toFixed(2)}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center text-slate-500 text-xs font-semibold mb-1">
            <Briefcase className="h-3.5 w-3.5 mr-1" /> EST. PAY
          </div>
          <div className="text-2xl font-bold text-green-700">{formatCurrency(summary.total_pay)}</div>
        </div>
      </div>

      {/* Recent entries */}
      <div className="mt-6 bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 font-semibold text-slate-700 text-sm">
          Recent Shifts
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2 font-semibold">Date</th>
              <th className="text-left px-4 py-2 font-semibold">In</th>
              <th className="text-left px-4 py-2 font-semibold">Out</th>
              <th className="text-right px-4 py-2 font-semibold">Break</th>
              <th className="text-right px-4 py-2 font-semibold">Hours</th>
            </tr>
          </thead>
          <tbody>
            {summary.entries.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">No shifts yet.</td></tr>
            )}
            {summary.entries.map((e) => {
              const ci = new Date(e.clock_in);
              const co = e.clock_out ? new Date(e.clock_out) : null;
              return (
                <tr key={e.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 text-slate-700">{ci.toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-slate-600">{ci.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-4 py-2 text-slate-600">
                    {co ? co.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : <span className="text-green-600 font-medium">In progress</span>}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-500">{e.break_minutes}m</td>
                  <td className="px-4 py-2 text-right font-medium text-slate-800">{e.is_open ? '—' : e.worked_hours.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
