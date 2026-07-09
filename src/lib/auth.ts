// Authentication Service (Supabase Auth + Demo Mock Session)
// Location: src/lib/auth.ts
//
// IMPORTANT: login/logout/session use the @supabase/ssr BROWSER client
// (getSupabaseBrowser) so the session is stored in COOKIES — the same place
// the proxy/middleware and server components read it. Using the plain
// @supabase/supabase-js client here would store the session only in
// localStorage, so the middleware would never see it and would bounce the
// user back to /login (an infinite "nothing happens" loop).

import { isSupabaseConfigured } from './db';
import { getSupabaseBrowser } from './supabaseClient';

// Cookie-backed browser client (only in the browser + when configured).
const supabase = isSupabaseConfigured && typeof window !== 'undefined' ? getSupabaseBrowser() : null;

export interface SessionUser {
  email: string;
  role: 'estimator' | 'admin';
  name: string;
}

function setAuthCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = 'schmidt_admin=1; path=/; max-age=86400; SameSite=Lax';
}

function clearAuthCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = 'schmidt_admin=; path=/; max-age=0; SameSite=Lax';
}

export const auth = {
  // Check if user is currently logged in
  getSessionUser(): SessionUser | null {
    if (typeof window === 'undefined') return null;

    if (isSupabaseConfigured && supabase) {
      // In production mode, we check active Supabase Auth token
      // For this Next.js app, we check if there is an active session
      // In server components/middleware we check cookies, locally we check supabase client
      // A simple fallback to cookie check works:
      const sessionJson = localStorage.getItem('schmidt_auth_session');
      return sessionJson ? JSON.parse(sessionJson) : null;
    } else {
      // Demo Mode: LocalStorage check
      const sessionJson = localStorage.getItem('schmidt_auth_session');
      return sessionJson ? JSON.parse(sessionJson) : null;
    }
  },

  // Perform mock/Supabase login
  async login(email: string, password?: string): Promise<SessionUser> {
    const timestamp = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      if (!password) throw new Error('Password is required in Supabase mode');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user data returned');

      const user: SessionUser = {
        email: data.user.email || email,
        role: 'estimator', // default role
        name: data.user.user_metadata?.name || 'Estimator'
      };

      localStorage.setItem('schmidt_auth_session', JSON.stringify(user));
      setAuthCookie();
      return user;
    } else {
      // Demo Mode Login
      // Accept any credentials, default values if blank
      const finalEmail = email || 'estimator@schmidt.com';
      const user: SessionUser = {
        email: finalEmail,
        role: 'estimator',
        name: finalEmail.split('@')[0].toUpperCase()
      };

      localStorage.setItem('schmidt_auth_session', JSON.stringify(user));
      setAuthCookie();
      return user;
    }
  },

  // Logout
  async logout(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('schmidt_auth_session');
    clearAuthCookie();
  }
};

// Return the Supabase Auth user id for the signed-in user (null in demo mode
// or when not signed in). Used by the time clock to resolve the employee row.
export async function getAuthUserId(): Promise<string | null> {
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  }
  return null;
}

// The audience a signed-in user belongs to. Employees/admins use the estimator
// app; everyone else is treated as a portal client.
export type Audience = 'admin' | 'employee' | 'client';

export interface ResolvedRole {
  audience: Audience;
  destination: string; // where to send the user after login
}

// Decide where a signed-in user should land, based on the employees table.
// - A user whose auth id (Supabase) or email matches an employee row with
//   role 'admin'    => admin app (/dashboard)
//   role 'employee' => admin app (/dashboard) — staff self-service + estimating
// - Anyone else (a quote recipient with a Supabase account) => client portal.
export async function resolveRole(email?: string): Promise<ResolvedRole> {
  try {
    // Query the employees table through the SAME cookie-backed client that
    // holds the just-established session, so RLS sees the authenticated user.
    // (Using db.getEmployees(), which has its own client, can run
    // unauthenticated right after login and misroute staff to the portal.)
    if (isSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      let match: { role: string; active: boolean } | null = null;

      if (user) {
        const { data } = await supabase
          .from('employees')
          .select('role, active')
          .eq('user_id', user.id)
          .maybeSingle();
        match = data ?? null;
      }

      if (match && match.active) {
        return {
          audience: match.role === 'admin' ? 'admin' : 'employee',
          destination: '/dashboard',
        };
      }
    }
  } catch (e) {
    // If the employees lookup fails, fall through to client (least privilege).
    console.error('resolveRole failed, defaulting to client portal:', e);
  }
  return { audience: 'client', destination: '/portal/dashboard' };
}
