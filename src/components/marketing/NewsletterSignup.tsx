'use client';

import { useState } from 'react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // Store in Supabase site_config or a leads table — for now just show success
    setStatus('success');
    setEmail('');
  };

  if (status === 'success') {
    return (
      <p className="text-green-400 text-xs font-semibold">
        Thanks! We&apos;ll be in touch.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-yellow-500 placeholder-gray-500"
      />
      <button
        type="submit"
        className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold text-xs px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap"
      >
        Sign Up
      </button>
    </form>
  );
}
