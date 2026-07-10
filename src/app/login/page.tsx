// Schmidt Construction Login Screen
// Location: src/app/login/page.tsx

'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { auth, resolveRole } from '../../lib/auth';
import { getSupabaseBrowser } from '../../lib/supabaseClient';
import { isDemoMode } from '../../lib/db';
import { Mail, AlertTriangle, KeyRound } from 'lucide-react';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestedNext = searchParams.get('next');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      setError(null);
      await auth.login(email, password);
      // Role-based redirect: staff => admin app, clients => portal.
      // An explicit ?next= (e.g. a deep link that bounced through login) wins.
      const { destination } = await resolveRole(email);
      router.push(requestedNext || destination);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoBypass = async () => {
    try {
      setLoading(true);
      setError(null);
      await auth.login('estimator@schmidtconstruction.com');
      const { destination } = await resolveRole('estimator@schmidtconstruction.com');
      router.push(requestedNext || destination);
    } catch (err: any) {
      console.error(err);
      setError('Error triggering demo session bypass.');
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google (OAuth). The callback exchanges the code for a cookie
  // session, then lands on /portal/dashboard which auto-routes linked staff to
  // the admin app and keeps clients on the portal.
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = getSupabaseBrowser();
      const next = requestedNext || '/portal/dashboard';
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/portal/auth/callback?next=${encodeURIComponent(next)}` },
      });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Could not start Google sign-in.');
      setLoading(false);
    }
  };

  // Send a password-reset email. The link routes through the auth callback
  // (which establishes a session) then to /reset-password to set a new one.
  const [resetSent, setResetSent] = useState(false);
  const handleForgotPassword = async () => {
    if (!email) { setError('Enter your email above first, then click "Forgot password?".'); return; }
    try {
      setLoading(true);
      setError(null);
      const supabase = getSupabaseBrowser();
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/portal/auth/callback?next=/reset-password`,
      });
      if (resetErr) throw resetErr;
      setResetSent(true);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Could not send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-4 z-50 overflow-y-auto">
      {/* Background accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(29,78,216,0.12),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(15,23,42,0.8),transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 text-white rounded-2xl border border-slate-800 p-8 premium-shadow relative z-10 space-y-6">
        {/* Brand Banner */}
        <div className="flex flex-col items-center space-y-4">
          <Image src="/icon.png" alt="Schmidt Construction" width={96} height={96} className="h-24 w-24 rounded-2xl" priority />
          <span className="text-xs text-blue-400 font-semibold uppercase tracking-widest">
            Estimating &amp; Proposals
          </span>
        </div>

        {/* Demo Mode Notice */}
        {isDemoMode && (
          <div className="bg-blue-900/20 border border-blue-700/30 p-4 rounded-xl text-xs text-blue-300 space-y-2">
            <div className="flex items-center space-x-2 font-bold uppercase tracking-wider text-[10px]">
              <AlertTriangle className="h-4 w-4 text-blue-400 shrink-0" />
              <span>Demo Mode Active</span>
            </div>
            <p className="leading-relaxed font-medium">
              Supabase credentials are missing. Running in local fallback mode. You can bypass authentication with one click below.
            </p>
            <button
              type="button"
              onClick={handleDemoBypass}
              disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-extrabold py-2 px-3 rounded-lg transition-colors cursor-pointer text-xs"
            >
              One-Click Demo Bypass Login
            </button>
          </div>
        )}

        {/* Google Sign-In */}
        {!isDemoMode && (
          <>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-xl px-4 py-2.5 transition-colors cursor-pointer text-xs disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            <div className="flex items-center gap-3 text-[10px] text-slate-500">
              <div className="flex-1 h-px bg-slate-800" /><span>or sign in with email</span><div className="flex-1 h-px bg-slate-800" />
            </div>
          </>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-semibold">
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-900 rounded-xl text-red-400 font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-slate-400">Estimator Email *</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@schmidt-construction.com"
                className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400">Password *</label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required={!isDemoMode}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isDemoMode ? "Optional in Demo Mode" : "••••••••"}
                className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-100 hover:bg-white text-slate-950 font-extrabold py-3 px-4 rounded-xl transition-all cursor-pointer text-xs"
          >
            {loading ? "Signing In..." : "Sign In to Dashboard"}
          </button>

          {!isDemoMode && (
            <div className="text-center pt-1">
              {resetSent ? (
                <p className="text-[11px] text-green-400 font-medium">Password reset email sent — check your inbox.</p>
              ) : (
                <button type="button" onClick={handleForgotPassword} disabled={loading}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-medium cursor-pointer">
                  Forgot password?
                </button>
              )}
            </div>
          )}
        </form>

        {/* Footer info */}
        <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
          <p>Schmidt Construction Estimating System © {new Date().getFullYear()}</p>
          <p className="mt-1">50+ years of family-owned craftsmanship excellence</p>
        </div>
      </div>
    </div>
  );
}
