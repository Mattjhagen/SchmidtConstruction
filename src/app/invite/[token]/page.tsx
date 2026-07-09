// Employee Invite Redemption Page
// Location: src/app/invite/[token]/page.tsx
//
// Flow: resolve invite -> user signs in / signs up (Supabase, work email) ->
// redeem token (server enforces email match) -> land on the admin app.

'use client';

import { useEffect, useState, use as usePromise } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { db } from '@/lib/db';
import { getSupabaseBrowser } from '@/lib/supabaseClient';
import { isDemoMode } from '@/lib/db';
import { Mail, KeyRound, CheckCircle2, AlertTriangle, UserCheck } from 'lucide-react';

type Mode = 'signin' | 'signup';

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = usePromise(params);
  const router = useRouter();

  const [info, setInfo] = useState<{ name: string; email: string; already_linked: boolean } | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const i = await db.getInviteInfo(token);
        setInfo(i);
        if (i?.email) setEmail(i.email); // pre-fill the invited email
      } catch {
        setInfo(null);
      } finally {
        setLoadingInfo(false);
      }
    })();
  }, [token]);

  const finishRedeem = async () => {
    // Server enforces email match; on success the row is linked to this user.
    await db.redeemEmployeeInvite(token);
    setDone(true);
    setTimeout(() => router.push('/dashboard'), 1200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (isDemoMode) {
        // No real auth in demo mode — just redeem to demonstrate the flow.
        await finishRedeem();
        return;
      }
      const supabase = getSupabaseBrowser();
      if (mode === 'signup') {
        const { error: e1 } = await supabase.auth.signUp({ email, password });
        if (e1) throw e1;
        // If email confirmation is on, there may be no session yet.
        const { data: sess } = await supabase.auth.getSession();
        if (!sess.session) {
          setError('Check your email to confirm your account, then return to this invite link to finish.');
          setBusy(false);
          return;
        }
      } else {
        const { error: e2 } = await supabase.auth.signInWithPassword({ email, password });
        if (e2) throw e2;
      }
      await finishRedeem();
    } catch (err: any) {
      setError(err?.message || 'Something went wrong redeeming your invite.');
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
          <span className="text-xs text-blue-400 font-semibold uppercase tracking-widest">Employee Invitation</span>
        </div>

        {loadingInfo && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
          </div>
        )}

        {!loadingInfo && !info && (
          <div className="bg-red-950/60 border border-red-900 rounded-xl p-4 text-center text-red-300 text-sm">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
            This invitation link is invalid or has already been used.
          </div>
        )}

        {!loadingInfo && info?.already_linked && (
          <div className="bg-green-950/50 border border-green-900 rounded-xl p-4 text-center text-green-300 text-sm">
            <CheckCircle2 className="h-6 w-6 mx-auto mb-2" />
            This account is already set up. You can just sign in normally.
          </div>
        )}

        {done && (
          <div className="bg-green-950/50 border border-green-900 rounded-xl p-4 text-center text-green-300 text-sm">
            <CheckCircle2 className="h-6 w-6 mx-auto mb-2" />
            You&apos;re all set, {info?.name?.split(' ')[0]}! Taking you to the dashboard…
          </div>
        )}

        {!loadingInfo && info && !info.already_linked && !done && (
          <>
            <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-4 text-sm text-blue-200 flex items-start space-x-2">
              <UserCheck className="h-5 w-5 shrink-0 text-blue-400 mt-0.5" />
              <div>
                <p className="font-semibold text-white">{info.name}</p>
                <p className="text-blue-300 text-xs mt-0.5">Sign in with <span className="font-medium">{info.email}</span> to activate your employee access.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              {error && <div className="p-3 bg-red-950/60 border border-red-900 rounded-xl text-red-400 font-medium">{error}</div>}

              <div className="space-y-1.5">
                <label className="text-slate-400">Work Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 text-xs font-medium"
                  />
                </div>
                <p className="text-[10px] text-slate-500 font-normal">Must match the email your invite was sent to.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400">Password *</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="password" required={!isDemoMode} value={password} onChange={(e) => setPassword(e.target.value)}
                    minLength={6} placeholder={mode === 'signup' ? 'Create a password' : '••••••••'}
                    className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 text-xs font-medium"
                  />
                </div>
              </div>

              <button type="submit" disabled={busy}
                className="w-full bg-slate-100 hover:bg-white text-slate-950 font-extrabold py-3 px-4 rounded-xl transition-all cursor-pointer text-xs disabled:opacity-50">
                {busy ? 'Activating…' : mode === 'signup' ? 'Create Account & Activate' : 'Sign In & Activate'}
              </button>

              <div className="text-center text-[11px] text-slate-500 font-normal">
                {mode === 'signin' ? (
                  <>First time here? <button type="button" onClick={() => setMode('signup')} className="font-bold text-blue-400 hover:text-blue-300">Create your account</button></>
                ) : (
                  <>Already have an account? <button type="button" onClick={() => setMode('signin')} className="font-bold text-blue-400 hover:text-blue-300">Sign in</button></>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
