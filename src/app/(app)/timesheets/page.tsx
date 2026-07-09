// Admin Timesheets & Payroll View
// Location: src/app/(app)/timesheets/page.tsx

'use client';

import { useEffect, useMemo, useState, useCallback, Fragment } from 'react';
import { db } from '@/lib/db';
import { Employee, TimeEntry } from '@/lib/types';
import { summarizeTimesheet, formatCurrency } from '@/lib/timeclock';
import { buildTimesheetPdf, buildTimesheetCsv, downloadBlob } from '@/lib/timesheetPdf';
import { getSupabaseBrowser } from '@/lib/supabaseClient';
import { isDemoMode } from '@/lib/db';
import { CalendarRange, Download, Users, Clock, TrendingUp, DollarSign, UserPlus, X, CheckCircle2, Link2, Copy, Ban, FileText, Mail, Plus, Pencil, User, ChevronDown, ChevronRight, Trash2, Check } from 'lucide-react';

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
  // Who is viewing: their employee row + whether they're an admin.
  const [me, setMe] = useState<Employee | null>(null);
  const isAdmin = me?.role === 'admin';
  // Admin toggle: show only my own timesheet.
  const [myOnly, setMyOnly] = useState(false);
  // Inline roster edit state.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; hourly_rate: number; role: 'employee' | 'admin' }>({ name: '', hourly_rate: 0, role: 'employee' });
  // Per-shift edit/delete state (expand an employee to see individual shifts).
  const [expandedEmp, setExpandedEmp] = useState<string | null>(null);
  const [editingShift, setEditingShift] = useState<string | null>(null);
  const [shiftForm, setShiftForm] = useState<{ date: string; clock_in: string; clock_out: string; break_minutes: number }>({ date: '', clock_in: '', clock_out: '', break_minutes: 0 });
  const [shiftBusy, setShiftBusy] = useState(false);
  const [range, setRange] = useState(currentWeekRange());
  const [loading, setLoading] = useState(true);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Manual add-hours modal state.
  const [showAddHours, setShowAddHours] = useState(false);
  const [hoursForm, setHoursForm] = useState({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    clock_in: '07:00',
    clock_out: '15:30',
    break_minutes: 30,
    notes: '',
  });
  const [savingHours, setSavingHours] = useState(false);

  // Email modal state.
  const [showEmail, setShowEmail] = useState(false);
  const [emailTo, setEmailTo] = useState('mike@walls2.com');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [empForm, setEmpForm] = useState({ name: '', email: '', hourly_rate: 0, role: 'employee' as 'employee' | 'admin' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Resolve the current viewer first.
      let current: Employee | null = null;
      if (!isDemoMode) {
        const { data: { user } } = await getSupabaseBrowser().auth.getUser();
        if (user) {
          const emps0 = await db.getEmployees();
          // Match by auth user_id first; fall back to email (covers rows that
          // were linked by email but never got user_id backfilled).
          current = emps0.find((e) => e.user_id === user.id)
            ?? emps0.find((e) => e.email && user.email && e.email.toLowerCase() === user.email.toLowerCase())
            ?? null;
        }
      }
      setMe(current);

      const admin = current?.role === 'admin';
      const [emps, allEntries] = await Promise.all([db.getEmployees(), db.getTimeEntries()]);
      // Non-admins only ever see themselves (belt-and-suspenders on top of RLS).
      if (admin) {
        setEmployees(emps);
        setEntries(allEntries);
      } else if (current) {
        setEmployees(emps.filter((e) => e.id === current!.id));
        setEntries(allEntries.filter((t) => t.employee_id === current!.id));
      } else {
        setEmployees(emps);
        setEntries(allEntries);
      }
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
      // Admin "My timesheet only" toggle narrows to the viewer's own row.
      .filter((e) => !(isAdmin && myOnly) || e.id === me?.id)
      .filter((e) => e.role !== 'admin' || entriesInRange.some((t) => t.employee_id === e.id))
      .map((emp) => summarizeTimesheet(emp, entriesInRange.filter((t) => t.employee_id === emp.id)));
  }, [employees, entriesInRange, isAdmin, myOnly, me]);

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

  // Save a manually-entered shift (admin correction for un-clocked time).
  const handleSaveHours = async () => {
    if (!hoursForm.employee_id) { setSendResult(null); return; }
    setSavingHours(true);
    try {
      const clockIn = new Date(`${hoursForm.date}T${hoursForm.clock_in}:00`);
      const clockOut = new Date(`${hoursForm.date}T${hoursForm.clock_out}:00`);
      await db.createTimeEntry({
        employee_id: hoursForm.employee_id,
        clock_in: clockIn.toISOString(),
        clock_out: clockOut.toISOString(),
        break_minutes: hoursForm.break_minutes,
        notes: hoursForm.notes,
      });
      setShowAddHours(false);
      setHoursForm({ ...hoursForm, notes: '' });
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setSavingHours(false);
    }
  };

  const pdfMeta = () => ({ periodFrom: range.from, periodTo: range.to });

  // Human-readable date range for the email modal.
  const fmtRange = () => {
    const f = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${f(range.from)} – ${f(range.to)}`;
  };

  // Download the professional PDF.
  const handleDownloadPdf = async () => {
    setPdfBusy(true);
    try {
      const blob = await buildTimesheetPdf(summaries, pdfMeta());
      downloadBlob(blob, `Schmidt-Timesheet_${range.from}_to_${range.to}.pdf`);
    } catch (e) {
      console.error('PDF generation failed:', e);
    } finally {
      setPdfBusy(false);
    }
  };

  // Base64-encode a Blob for email attachment.
  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result).split(',')[1] ?? '');
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  // Email the timesheet (PDF + CSV attachments + summary body) via the app mailer.
  const handleSendEmail = async () => {
    setSending(true);
    setSendResult(null);
    try {
      if (isDemoMode) {
        setSendResult({ ok: false, msg: 'Email requires Supabase + Resend — not available in demo mode. Deploy with env vars to enable delivery.' });
        return;
      }
      const pdfBlob = await buildTimesheetPdf(summaries, pdfMeta());
      const pdfB64 = await blobToBase64(pdfBlob);
      const csv = buildTimesheetCsv(summaries, pdfMeta());
      const csvB64 = btoa(unescape(encodeURIComponent(csv)));

      const { data: { session } } = await getSupabaseBrowser().auth.getSession();
      const token = session?.access_token;
      if (!token) { setSendResult({ ok: false, msg: 'Your session expired — please sign in again.' }); return; }

      const res = await fetch('/api/timesheets/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          to: emailTo,
          periodFrom: range.from,
          periodTo: range.to,
          rows: summaries.map((s) => ({
            employee_name: s.employee_name,
            regular_hours: s.regular_hours,
            overtime_hours: s.overtime_hours,
            total_hours: s.total_hours,
            total_pay: s.total_pay,
          })),
          totals: { hours: totals.hours, overtime: totals.ot, pay: totals.pay },
          attachments: [
            { filename: `Schmidt-Timesheet_${range.from}_to_${range.to}.pdf`, content: pdfB64 },
            { filename: `Schmidt-Timesheet_${range.from}_to_${range.to}.csv`, content: csvB64 },
          ],
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Send failed');
      setSendResult({ ok: true, msg: `Timesheet sent to ${json.sentTo}.` });
    } catch (e) {
      setSendResult({ ok: false, msg: e instanceof Error ? e.message : 'Failed to send.' });
    } finally {
      setSending(false);
    }
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

  // Inline roster editing (admin only): rename, set rate, change role.
  const startEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setEditForm({ name: emp.name, hourly_rate: emp.hourly_rate, role: emp.role });
  };
  const cancelEdit = () => setEditingId(null);
  const saveEdit = async (id: string) => {
    await db.updateEmployee(id, {
      name: editForm.name.trim(),
      hourly_rate: editForm.hourly_rate,
      role: editForm.role,
    });
    setEditingId(null);
    await load();
  };

  // ---- Per-shift edit / delete (admin) ----
  // Local date (YYYY-MM-DD) and time (HH:MM) from an ISO timestamp.
  const isoToDate = (iso: string) => {
    const d = new Date(iso);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };
  const isoToTime = (iso: string) => {
    const d = new Date(iso);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${p(d.getHours())}:${p(d.getMinutes())}`;
  };

  const startShiftEdit = (entry: { id: string; clock_in: string; clock_out: string | null; break_minutes: number }) => {
    setEditingShift(entry.id);
    setShiftForm({
      date: isoToDate(entry.clock_in),
      clock_in: isoToTime(entry.clock_in),
      clock_out: entry.clock_out ? isoToTime(entry.clock_out) : '',
      break_minutes: entry.break_minutes,
    });
  };
  const cancelShiftEdit = () => setEditingShift(null);

  const saveShiftEdit = async (id: string) => {
    setShiftBusy(true);
    try {
      const clockIn = new Date(`${shiftForm.date}T${shiftForm.clock_in}:00`);
      const updates: Record<string, unknown> = {
        clock_in: clockIn.toISOString(),
        break_minutes: shiftForm.break_minutes,
      };
      // Only set clock_out if a time was provided (blank keeps the shift open).
      updates.clock_out = shiftForm.clock_out
        ? new Date(`${shiftForm.date}T${shiftForm.clock_out}:00`).toISOString()
        : null;
      await db.updateTimeEntry(id, updates);
      setEditingShift(null);
      await load();
    } catch (e) {
      console.error('Failed to save shift:', e);
    } finally {
      setShiftBusy(false);
    }
  };

  const deleteShift = async (id: string) => {
    if (!confirm('Delete this shift? This cannot be undone.')) return;
    await db.deleteTimeEntry(id);
    await load();
  };

  // Build the full invite URL for a token (uses the login subdomain in prod).
  const inviteUrl = (token: string) => {
    if (typeof window !== 'undefined') {
      const host = window.location.host;
      // On localhost keep the current host; in prod force the login subdomain.
      const base = host.includes('localhost')
        ? `${window.location.protocol}//${host}`
        : 'https://login.schmidt-construction.com';
      return `${base}/invite/${token}`;
    }
    return `https://login.schmidt-construction.com/invite/${token}`;
  };

  const handleGenerateInvite = async (employeeId: string) => {
    const token = await db.generateEmployeeInvite(employeeId);
    await load();
    try {
      await navigator.clipboard.writeText(inviteUrl(token));
      setCopiedId(employeeId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch { /* clipboard may be blocked; link still visible via Copy */ }
  };

  const handleCopyInvite = async (employeeId: string, token: string) => {
    try {
      await navigator.clipboard.writeText(inviteUrl(token));
      setCopiedId(employeeId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch { /* no-op */ }
  };

  const handleRevokeInvite = async (employeeId: string) => {
    await db.revokeEmployeeInvite(employeeId);
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
            <h1 className="text-2xl font-bold text-slate-900">{isAdmin ? 'Timesheets & Payroll' : 'My Timesheet'}</h1>
            <p className="text-sm text-slate-500">{isAdmin ? 'Overtime is calculated per week (>40 hrs at 1.5×)' : 'Your hours and pay. Overtime is calculated per week (>40 hrs at 1.5×).'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isAdmin && (
          <button
            onClick={() => setShowAddEmployee(true)}
            className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Employee</span>
          </button>
          )}
          <button
            onClick={exportCsv}
            className="inline-flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          {isAdmin && (
          <button
            onClick={() => setShowAddHours(true)}
            className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Hours</span>
          </button>
          )}
          <button
            onClick={handleDownloadPdf}
            disabled={pdfBusy}
            className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <FileText className="h-4 w-4" />
            <span>{pdfBusy ? 'Building…' : 'Download PDF'}</span>
          </button>
          {isAdmin && (
          <button
            onClick={() => { setSendResult(null); setShowEmail(true); }}
            className="inline-flex items-center space-x-2 bg-green-700 hover:bg-green-800 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
          >
            <Mail className="h-4 w-4" />
            <span>Email Timesheet</span>
          </button>
          )}
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
        {isAdmin && (
          <label className="ml-auto inline-flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={myOnly}
              onChange={(e) => setMyOnly(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
            />
            <User className="h-4 w-4" />
            My timesheet only
          </label>
        )}
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

      {/* Employee roster & account link status (admins only) */}
      {isAdmin && (
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="font-semibold text-slate-700 text-sm">Employee Roster</span>
          <span className="text-xs text-slate-400">{employees.length} total</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2 font-semibold">Name</th>
              <th className="text-left px-4 py-2 font-semibold">Email</th>
              <th className="text-left px-4 py-2 font-semibold">Role</th>
              <th className="text-right px-4 py-2 font-semibold">Rate</th>
              <th className="text-center px-4 py-2 font-semibold">Login Account</th>
              {isAdmin && <th className="text-center px-4 py-2 font-semibold">Edit</th>}
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 && (
              <tr><td colSpan={isAdmin ? 6 : 5} className="px-4 py-6 text-center text-slate-400">No employees yet — add one to get started.</td></tr>
            )}
            {employees.map((e) => editingId === e.id ? (
              <tr key={e.id} className="border-t border-slate-100 bg-blue-50/40">
                <td className="px-4 py-2">
                  <input value={editForm.name} onChange={(ev) => setEditForm({ ...editForm, name: ev.target.value })}
                    className="w-full border border-slate-300 rounded px-2 py-1 text-sm" />
                </td>
                <td className="px-4 py-2 text-slate-500">{e.email || '—'}</td>
                <td className="px-4 py-2">
                  <select value={editForm.role} onChange={(ev) => setEditForm({ ...editForm, role: ev.target.value as 'employee' | 'admin' })}
                    className="border border-slate-300 rounded px-2 py-1 text-sm">
                    <option value="employee">employee</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="px-4 py-2 text-right">
                  <input type="number" min={0} step={0.5} value={editForm.hourly_rate}
                    onChange={(ev) => setEditForm({ ...editForm, hourly_rate: parseFloat(ev.target.value) || 0 })}
                    className="w-20 border border-slate-300 rounded px-2 py-1 text-sm text-right" />
                </td>
                <td className="px-4 py-2 text-center text-xs text-slate-400">
                  {e.user_id ? 'Linked' : '—'}
                </td>
                <td className="px-4 py-2 text-center whitespace-nowrap">
                  <button onClick={() => saveEdit(e.id)} className="text-xs font-semibold text-green-700 hover:text-green-900 cursor-pointer mr-2">Save</button>
                  <button onClick={cancelEdit} className="text-xs font-medium text-slate-400 hover:text-slate-600 cursor-pointer">Cancel</button>
                </td>
              </tr>
            ) : (
              <tr key={e.id} className="border-t border-slate-100">
                <td className="px-4 py-2 font-medium text-slate-800">{e.name}</td>
                <td className="px-4 py-2 text-slate-600">{e.email || <span className="text-slate-300">—</span>}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${e.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                    {e.role}
                  </span>
                </td>
                <td className="px-4 py-2 text-right text-slate-600">{formatCurrency(e.hourly_rate)}</td>
                <td className="px-4 py-2 text-center">
                  {e.user_id ? (
                    <span className="inline-flex items-center text-xs font-medium text-green-700">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Linked
                    </span>
                  ) : e.invite_token ? (
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => handleCopyInvite(e.id, e.invite_token!)}
                        className="inline-flex items-center text-xs font-medium text-blue-700 hover:text-blue-900 cursor-pointer"
                        title="Copy invite link"
                      >
                        <Copy className="h-3.5 w-3.5 mr-1" />
                        {copiedId === e.id ? 'Copied!' : 'Copy invite'}
                      </button>
                      <button
                        onClick={() => handleRevokeInvite(e.id)}
                        className="inline-flex items-center text-xs font-medium text-slate-400 hover:text-red-600 cursor-pointer"
                        title="Revoke this invite"
                      >
                        <Ban className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleGenerateInvite(e.id)}
                      disabled={!e.email}
                      title={e.email ? 'Generate an invite link' : 'Add an email first'}
                      className="inline-flex items-center text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed px-2.5 py-1 rounded-lg cursor-pointer"
                    >
                      <Link2 className="h-3.5 w-3.5 mr-1" />
                      {copiedId === e.id ? 'Link copied!' : 'Generate invite'}
                    </button>
                  )}
                </td>
                {isAdmin && (
                  <td className="px-4 py-2 text-center">
                    <button onClick={() => startEdit(e)}
                      className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-blue-700 cursor-pointer" title="Edit name, rate, role">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
          Add an employee with their work email, click <span className="font-medium text-slate-700">Generate invite</span> to copy a one-time link, and send it to them. They activate their account by signing in with that same email — the link only works for the matching email and can be revoked anytime.
        </div>
      </div>
      )}

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
              <Fragment key={s.employee_id}>
                <tr
                  className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer"
                  onClick={() => setExpandedEmp(expandedEmp === s.employee_id ? null : s.employee_id)}
                >
                  <td className="px-4 py-3 font-medium text-slate-800">
                    <span className="inline-flex items-center">
                      {expandedEmp === s.employee_id
                        ? <ChevronDown className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                        : <ChevronRight className="h-3.5 w-3.5 mr-1.5 text-slate-400" />}
                      {s.employee_name}
                      <span className="ml-2 text-xs font-normal text-slate-400">
                        ({s.entries.length} shift{s.entries.length !== 1 ? 's' : ''})
                      </span>
                    </span>
                  </td>
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
                {expandedEmp === s.employee_id && (
                  <tr className="bg-slate-50/60">
                    <td colSpan={8} className="px-4 py-3">
                      {s.entries.length === 0 ? (
                        <p className="text-xs text-slate-400 py-2 text-center">No shifts in this period.</p>
                      ) : (
                        <table className="w-full text-xs">
                          <thead className="text-slate-400 uppercase">
                            <tr>
                              <th className="text-left px-2 py-1 font-semibold">Date</th>
                              <th className="text-left px-2 py-1 font-semibold">In</th>
                              <th className="text-left px-2 py-1 font-semibold">Out</th>
                              <th className="text-right px-2 py-1 font-semibold">Break</th>
                              <th className="text-right px-2 py-1 font-semibold">Hours</th>
                              {isAdmin && <th className="text-right px-2 py-1 font-semibold">Actions</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {s.entries.map((en) => editingShift === en.id ? (
                              <tr key={en.id} className="border-t border-slate-200 bg-blue-50/50">
                                <td className="px-2 py-1">
                                  <input type="date" value={shiftForm.date} onChange={(ev) => setShiftForm({ ...shiftForm, date: ev.target.value })}
                                    className="border border-slate-300 rounded px-1.5 py-0.5 text-xs" />
                                </td>
                                <td className="px-2 py-1">
                                  <input type="time" value={shiftForm.clock_in} onChange={(ev) => setShiftForm({ ...shiftForm, clock_in: ev.target.value })}
                                    className="border border-slate-300 rounded px-1.5 py-0.5 text-xs" />
                                </td>
                                <td className="px-2 py-1">
                                  <input type="time" value={shiftForm.clock_out} onChange={(ev) => setShiftForm({ ...shiftForm, clock_out: ev.target.value })}
                                    className="border border-slate-300 rounded px-1.5 py-0.5 text-xs" />
                                </td>
                                <td className="px-2 py-1 text-right">
                                  <input type="number" min={0} value={shiftForm.break_minutes} onChange={(ev) => setShiftForm({ ...shiftForm, break_minutes: Math.max(0, parseInt(ev.target.value) || 0) })}
                                    className="w-14 border border-slate-300 rounded px-1.5 py-0.5 text-xs text-right" />
                                </td>
                                <td className="px-2 py-1 text-right text-slate-400">—</td>
                                <td className="px-2 py-1 text-right whitespace-nowrap">
                                  <button onClick={() => saveShiftEdit(en.id)} disabled={shiftBusy}
                                    className="inline-flex items-center text-green-700 hover:text-green-900 cursor-pointer mr-2" title="Save">
                                    <Check className="h-3.5 w-3.5" />
                                  </button>
                                  <button onClick={cancelShiftEdit} className="inline-flex items-center text-slate-400 hover:text-slate-600 cursor-pointer" title="Cancel">
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ) : (
                              <tr key={en.id} className="border-t border-slate-200">
                                <td className="px-2 py-1 text-slate-700">{new Date(en.clock_in).toLocaleDateString()}</td>
                                <td className="px-2 py-1 text-slate-600">{new Date(en.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                <td className="px-2 py-1 text-slate-600">
                                  {en.clock_out ? new Date(en.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : <span className="text-green-600">In progress</span>}
                                </td>
                                <td className="px-2 py-1 text-right text-slate-500">{en.break_minutes}m</td>
                                <td className="px-2 py-1 text-right font-medium text-slate-800">{en.is_open ? '—' : en.worked_hours.toFixed(2)}</td>
                                {isAdmin && (
                                  <td className="px-2 py-1 text-right whitespace-nowrap">
                                    <button onClick={() => startShiftEdit(en)} className="inline-flex items-center text-slate-400 hover:text-blue-700 cursor-pointer mr-2" title="Edit shift">
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button onClick={() => deleteShift(en.id)} className="inline-flex items-center text-slate-400 hover:text-red-600 cursor-pointer" title="Delete shift">
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / manual hours modal */}
      {showAddHours && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 relative">
            <button onClick={() => setShowAddHours(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Add Hours Manually</h2>
            <p className="text-xs text-slate-500 mb-4">For shifts that weren&apos;t clocked. Overtime is recalculated automatically.</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Employee</label>
                <select
                  value={hoursForm.employee_id}
                  onChange={(e) => setHoursForm({ ...hoursForm, employee_id: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">— Select employee —</option>
                  {employees.filter((e) => e.active).map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Date</label>
                <input type="date" value={hoursForm.date}
                  onChange={(e) => setHoursForm({ ...hoursForm, date: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Clock In</label>
                  <input type="time" value={hoursForm.clock_in}
                    onChange={(e) => setHoursForm({ ...hoursForm, clock_in: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Clock Out</label>
                  <input type="time" value={hoursForm.clock_out}
                    onChange={(e) => setHoursForm({ ...hoursForm, clock_out: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Break (min)</label>
                  <input type="number" min={0} value={hoursForm.break_minutes}
                    onChange={(e) => setHoursForm({ ...hoursForm, break_minutes: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Notes</label>
                  <input type="text" value={hoursForm.notes} placeholder="Optional"
                    onChange={(e) => setHoursForm({ ...hoursForm, notes: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button onClick={() => setShowAddHours(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 cursor-pointer">Cancel</button>
              <button onClick={handleSaveHours} disabled={savingHours || !hoursForm.employee_id}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer disabled:opacity-50">
                {savingHours ? 'Saving…' : 'Save Hours'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email timesheet modal */}
      {showEmail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 relative">
            <button onClick={() => setShowEmail(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Email Timesheet</h2>
            <p className="text-xs text-slate-500 mb-4">
              Sends the {fmtRange()} timesheet with a summary plus PDF &amp; CSV attachments.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Send to</label>
                <input type="email" value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              {sendResult && (
                <div className={`text-xs rounded-lg px-3 py-2 ${sendResult.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {sendResult.msg}
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button onClick={() => setShowEmail(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 cursor-pointer">Close</button>
              <button onClick={handleSendEmail} disabled={sending || !emailTo}
                className="px-4 py-2 text-sm font-semibold text-white bg-green-700 hover:bg-green-800 rounded-lg cursor-pointer disabled:opacity-50">
                {sending ? 'Sending…' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}

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
