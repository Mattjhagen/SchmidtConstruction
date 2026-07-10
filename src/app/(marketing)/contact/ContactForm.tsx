'use client';

import { useState } from 'react';
import { sendContactForm } from '@/app/actions/sendContactForm';

interface Props {
  phone: string;
  phoneHref: string;
}

export default function ContactForm({ phone, phoneHref }: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    const fd = new FormData(e.currentTarget);
    const result = await sendContactForm(fd);
    if (result.success) {
      setStatus('success');
      (e.target as HTMLFormElement).reset();
    } else {
      setStatus('error');
      setErrorMsg(result.error || 'Something went wrong. Please call us directly.');
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h2>
      <p className="text-gray-600 text-sm mb-4">
        Fill out the form below and we&apos;ll reach out to schedule your free on-site estimate.
      </p>

      {status === 'success' ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <p className="text-green-800 font-semibold text-base mb-1">Message sent!</p>
          <p className="text-green-700 text-sm">We&apos;ll be in touch within one business day.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              name="name"
              type="text"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              name="phone"
              type="tel"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Needed</label>
            <select
              name="service"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="">Select a service...</option>
              <option>Retaining Wall Installation</option>
              <option>Block Retaining Wall</option>
              <option>Timber Retaining Wall</option>
              <option>Commercial Retaining Wall</option>
              <option>Drainage Solutions</option>
              <option>Concrete Work</option>
              <option>Kitchen Remodeling</option>
              <option>Bathroom Remodeling</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              name="body"
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Describe your project..."
            />
          </div>

          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 text-white font-bold py-3 rounded-lg text-sm transition-colors"
          >
            {status === 'sending' ? 'Sending…' : 'Send Message'}
          </button>
        </form>
      )}

      <p className="text-xs text-gray-400 mt-3">
        Prefer to call?{' '}
        <a href={phoneHref} className="text-yellow-600">{phone}</a>
      </p>
    </div>
  );
}
