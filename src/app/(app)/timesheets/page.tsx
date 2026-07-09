// Admin Timesheets & Payroll View
// Location: src/app/(app)/timesheets/page.tsx

'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { db } from '@/lib/db';
import { Employee, TimeEntry } from '@/lib/types';
import { summarizeTimesheet, formatCurrency } from '@/lib/timeclock';
import { CalendarRange, Download, Users, Clock, TrendingUp, DollarSign, UserPlus, X } from 'lucide-react';

// Default the range to the current ISO week (Mon–Sun).
function currentWeekRange(): { from: string; to: string } {
  const now = new Date();
  const day = now.getDay() || 7; // Sun=0 -> 7
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  return { from: fmt(monday), to: fmt(sunday) };
}

export default function TimesheetsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [range, setRange] = useState(currentWeekRange());
  const [loading, setLoading] = useState(true);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [empForm, setEmpForm] = useState({ name: '', email: '', hourly_rate: 0, role: 'employee' as 'employee' | 'admin' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [emps, allEntries] = await Promise.all([db.getEmployees(), db.getTimeEntries()]);
      setEmployees(emps);
      setEntries(allEntries);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Filter entries to the selected date range (by clock_in date, inclusive).
  const entriesInRange = useMemo(() => {
    const from = new Date(range.from + 'T00:00:00').getTime();
    const to = new Date(range.to + 'T23:59:59').getTime();
    return entries.filter((e) => {
      const t = new Date(e.clock_in).getTime();
      return t >= from && t <= to;
    });
  }, [entries, range]);

  // Build a payroll summary per employee.
  const summaries = useMemo(() => {
    return employees
      .filter((e) => e.role !== 'admin' || entriesInRange.some((t) => t.employee_id === e.id))
      .map((emp) => summarizeTimesheet(emp, entriesInRange.filter((t) => t.employee_id === emp.id)));
  }, [employees, entriesInRange]);

  const totals = useMemo(() => summaries.reduce(
    (acc, s) => ({
      hours: acc.hours + s.total_hours,
      ot: acc.ot + s.overtime_hours,
      pay: acc.pay + s.total_pay,
    }),
    { hours: 0, ot: 0, pay: 0 }
  ), [summaries]);

  const exportCsv = () => {
    const rows = [
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
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timesheet_${range.from}_to_${range.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddEmployee = async () => {
    if (!empForm.name.trim()) return;
    await db.createEmployee({
      user_id: null,
      name: empForm.name.trim(),
      email: empForm.email.trim(),
      role: empForm.role,
      hourly_rate: empForm.hourly_rate,
      active: true,
    });
    setEmpForm({ name: '', email: '', hourly_rate: 0, role: 'employee' });
    setShowAddEmployee(false);
    await load();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-slate-900 rounded-lg">
            <Users className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Timesheets & Payroll</h1>
            <p className="text-sm text-slate-500">Overtime is calculated per week (&gt;40 hrs at 1.5&times;)</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddEmployee(true)}
            className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Employee</span>
          </button>
          <button
            onClick={exportCsv}
            className="inline-flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Date range */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 flex flex-wrap items-end gap-4">
        <div className="flex items-center text-slate-500 text-sm font-semibold">
          <CalendarRange className="h-4 w-4 mr-2" /> Pay Period
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">From</label>
          <input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 block mb-1">To</label>
          <input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm" />
        </div>
        <button onClick={() => setRange(currentWeekRange())}
          className="text-sm text-blue-700 hover:text-blue-900 font-medium cursor-pointer">This week</button>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center text-slate-500 text-xs font-semibold mb-1"><Clock className="h-3.5 w-3.5 mr-1" /> TOTAL HOURS</div>
          <div className="text-2xl font-bold text-slate-900">{totals.hours.toFixed(2)}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center text-slate-500 text-xs font-semibold mb-1"><TrendingUp className="h-3.5 w-3.5 mr-1" /> OVERTIME HOURS</div>
          <div className="text-2xl font-bold text-amber-600">{totals.ot.toFixed(2)}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center text-slate-500 text-xs font-semibold mb-1"><DollarSign className="h-3.5 w-3.5 mr-1" /> TOTAL PAYROLL</div>
          <div className="text-2xl font-bold text-green-700">{formatCurrency(totals.pay)}</div>
        </div>
      </div>

      {/* Per-employee table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Employee</th>
              <th className="text-right px-4 py-3 font-semibold">Rate</th>
              <th className="text-right px-4 py-3 font-semibold">Regular</th>
              <th className="text-right px-4 py-3 font-semibold">OT</th>
              <th className="text-right px-4 py-3 font-semibold">Total Hrs</th>
              <th className="text-right px-4 py-3 font-semibold">Reg. Pay</th>
              <th className="text-right px-4 py-3 font-semibold">OT Pay</th>
              <th className="text-right px-4 py-3 font-semibold">Total Pay</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">Loading…</td></tr>
            )}
            {!loading && summaries.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">No hours in this period.</td></tr>
            )}
            {summaries.map((s) => (
              <tr key={s.employee_id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{s.employee_name}</td>
                <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(s.hourly_rate)}</td>
                <td className="px-4 py-3 text-right text-slate-700">{s.regular_hours.toFixed(2)}</td>
                <td className={`px-4 py-3 text-right font-medium ${s.overtime_hours > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                  {s.overtime_hours.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-900">{s.total_hours.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-slate-600">{formatCurrency(s.regular_pay)}</td>
                <td className="px-4 py-3 text-right text-amber-700">{formatCurrency(s.overtime_pay)}</td>
                <td className="px-4 py-3 text-right font-bold text-green-700">{formatCurrency(s.total_pay)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add employee modal */}
      {showAddEmployee && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 relative">
            <button onClick={() => setShowAddEmployee(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Add Employee</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Name</label>
                <input value={empForm.name} onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Email</label>
                <input value={empForm.email} onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Hourly Rate ($)</label>
                  <input type="number" min={0} step={0.5} value={empForm.hourly_rate}
                    onChange={(e) => setEmpForm({ ...empForm, hourly_rate: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Role</label>
                  <select value={empForm.role} onChange={(e) => setEmpForm({ ...empForm, role: e.target.value as 'employee' | 'admin' })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button onClick={() => setShowAddEmployee(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 cursor-pointer">Cancel</button>
              <button onClick={handleAddEmployee}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
