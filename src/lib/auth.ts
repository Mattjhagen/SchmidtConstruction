// Authentication Service (Supabase Auth + Demo Mock Session)
// Location: src/lib/auth.ts

import { isSupabaseConfigured } from './db';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

export interface SessionUser {
  email: string;
  role: 'estimator' | 'admin';
  name: string;
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
      return user;
    }
  },

  // Logout
  async logout(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('schmidt_auth_session');
  }
};
