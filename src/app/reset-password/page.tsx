// Password Reset Page
// Location: src/app/reset-password/page.tsx
//
// The recovery email routes through /portal/auth/callback?next=/reset-password,
// which exchanges the recovery code for a session. By the time the user lands
// here they are authenticated, so we can call updateUser({ password }).

'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getSupabaseBrowser } from '@/lib/supabaseClient';
import { resolveRole } from '@/lib/auth';
import { KeyRound, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}

function ResetForm() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  // Confirm we have a (recovery) session to update against.
  useEffect(() => {
    (async () => {
      const supabase = getSupabaseBrowser();
      const { data: { session } } = await supabase.auth.getSession();
      setHasSession(!!session);
      setChecking(false);
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setBusy(true);
    try {
      const supabase = getSupabaseBrowser();
      const { error: updErr } = await supabase.auth.updateUser({ password });
      if (updErr) throw updErr;
      setDone(true);
      // Route to the right place based on role after a short beat.
      const { destination } = await resolveRole();
      setTimeout(() => router.push(destination), 1400);
    } catch (err: any) {
      setError(err?.message || 'Could not update your password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(29,78,216,0.12),transparent_50%)] pointer-events-none" />
      <div className="w-full max-w-md bg-slate-900/90 text-white rounded-2xl border border-slate-800 p-8 premium-shadow relative z-10 space-y-6">
        <div className="flex flex-col items-center space-y-3">
          <Image src="/icon.png" alt="Schmidt Construction" width={80} height={80} className="h-20 w-20 rounded-2xl" priority />
          <span className="text-xs text-blue-400 font-semibold uppercase tracking-widest">Set a New Password</span>
        </div>

        {checking && (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
          </div>
        )}

        {!checking && !hasSession && !done && (
          <div className="bg-red-950/60 border border-red-900 rounded-xl p-4 text-center text-red-300 text-sm">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
            This reset link is invalid or has expired. Please request a new password reset email and open the link again.
          </div>
        )}

        {done && (
          <div className="bg-green-950/50 border border-green-900 rounded-xl p-4 text-center text-green-300 text-sm">
            <CheckCircle2 className="h-6 w-6 mx-auto mb-2" />
            Password updated! Signing you in…
          </div>
        )}

        {!checking && hasSession && !done && (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
            {error && <div className="p-3 bg-red-950/60 border border-red-900 rounded-xl text-red-400 font-medium">{error}</div>}
            <div className="space-y-1.5">
              <label className="text-slate-400">New Password *</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 text-xs font-medium" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-400">Confirm Password *</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 text-xs font-medium" />
              </div>
            </div>
            <button type="submit" disabled={busy}
              className="w-full bg-slate-100 hover:bg-white text-slate-950 font-extrabold py-3 px-4 rounded-xl transition-all cursor-pointer text-xs disabled:opacity-50">
              {busy ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
