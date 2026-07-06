'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { getSupabaseBrowser } from '@/lib/supabaseClient';

type Mode = 'signin' | 'signup' | 'forgot';

export default function ClientLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/portal/dashboard';
  const errorParam = searchParams.get('error');

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const supabase = getSupabaseBrowser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/portal/auth/callback?next=/portal/dashboard`,
      });
      if (error) {
        setStatus('error');
        setMessage(error.message);
      } else {
        setStatus('success');
        setMessage('Check your email for a password reset link.');
      }
      return;
    }

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/portal/auth/callback?next=${next}`,
        },
      });
      if (error) {
        setStatus('error');
        setMessage(error.message);
      } else {
        setStatus('success');
        setMessage('Check your email to confirm your account, then sign in.');
      }
      return;
    }

    // Sign in
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setStatus('error');
      setMessage(error.message);
    } else {
      router.push(next);
      router.refresh();
    }
  };

  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/portal/auth/callback?next=${next}`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="Schmidt Construction" width={180} height={60} className="h-12 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold text-gray-900">
            {mode === 'signup' ? 'Create your portal account' : mode === 'forgot' ? 'Reset your password' : 'Sign in to your portal'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">View and manage your Schmidt Construction proposals</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          {(errorParam || (status === 'error' && message)) && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {errorParam === 'auth_callback_failed' ? 'Authentication failed. Please try again.' : message}
            </div>
          )}
          {status === 'success' && message && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
              {message}
            </div>
          )}

          {mode !== 'forgot' && (
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          )}

          {mode !== 'forgot' && (
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <div className="flex-1 h-px bg-gray-200" />
              <span>or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-extrabold py-3 rounded-xl transition-colors disabled:opacity-50 text-sm"
            >
              {status === 'loading'
                ? 'Please wait…'
                : mode === 'signup'
                  ? 'Create Account'
                  : mode === 'forgot'
                    ? 'Send Reset Link'
                    : 'Sign In'}
            </button>
          </form>

          <div className="text-center space-y-2 text-xs text-gray-500">
            {mode === 'signin' && (
              <>
                <button onClick={() => setMode('forgot')} className="hover:text-yellow-600 transition-colors block w-full">
                  Forgot your password?
                </button>
                <span>Don't have an account? </span>
                <button onClick={() => setMode('signup')} className="font-bold text-yellow-600 hover:text-yellow-700">
                  Create one
                </button>
              </>
            )}
            {mode === 'signup' && (
              <>
                <span>Already have an account? </span>
                <button onClick={() => setMode('signin')} className="font-bold text-yellow-600 hover:text-yellow-700">
                  Sign in
                </button>
              </>
            )}
            {mode === 'forgot' && (
              <button onClick={() => setMode('signin')} className="font-bold text-yellow-600 hover:text-yellow-700">
                Back to sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
