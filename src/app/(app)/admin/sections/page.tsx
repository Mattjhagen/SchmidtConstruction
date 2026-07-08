'use client';

import { useState } from 'react';
import { defaultSections } from '@/content/sections';

type HeroData = typeof defaultSections.hero;
type AboutData = typeof defaultSections.about;
type HoursData = typeof defaultSections.hours;

export default function SectionEditorPage() {
  const [hero, setHero] = useState<HeroData>({ ...defaultSections.hero });
  const [about, setAbout] = useState<AboutData>({ ...defaultSections.about });
  const [hours, setHours] = useState<HoursData>({ ...defaultSections.hours });
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    // Persist to Supabase site_config table (key/value pairs)
    const payload = { hero, about, hours };
    await fetch('/api/admin/sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">Site Section Editor</h1>
        <button
          onClick={handleSave}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors"
        >
          {saved ? 'Saved!' : 'Save All'}
        </button>
      </div>

      {/* Hero */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-bold text-gray-900 text-lg border-b pb-2">Hero Section</h2>
        <div>
          <label className="text-xs font-bold text-gray-600 block mb-1">Headline</label>
          <input
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
            value={hero.headline}
            onChange={e => setHero(h => ({ ...h, headline: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600 block mb-1">Sub-headline</label>
          <textarea
            rows={3}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
            value={hero.subheadline}
            onChange={e => setHero(h => ({ ...h, subheadline: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600 block mb-1">CTA Button Text</label>
          <input
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
            value={hero.ctaText}
            onChange={e => setHero(h => ({ ...h, ctaText: e.target.value }))}
          />
        </div>
      </section>

      {/* About */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-bold text-gray-900 text-lg border-b pb-2">About / Why Us Section</h2>
        <div>
          <label className="text-xs font-bold text-gray-600 block mb-1">Section Title</label>
          <input
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
            value={about.title}
            onChange={e => setAbout(a => ({ ...a, title: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600 block mb-1">Body Text</label>
          <textarea
            rows={4}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
            value={about.body}
            onChange={e => setAbout(a => ({ ...a, body: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-600 block mb-1">Bullet Points (one per line)</label>
          <textarea
            rows={6}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-yellow-500"
            value={about.bullets.join('\n')}
            onChange={e => setAbout(a => ({ ...a, bullets: e.target.value.split('\n').filter(Boolean) }))}
          />
        </div>
      </section>

      {/* Hours */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-bold text-gray-900 text-lg border-b pb-2">Business Hours</h2>
        {(['weekdays', 'saturday', 'sunday'] as const).map(day => (
          <div key={day}>
            <label className="text-xs font-bold text-gray-600 block mb-1 capitalize">{day}</label>
            <input
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
              value={hours[day]}
              onChange={e => setHours(h => ({ ...h, [day]: e.target.value }))}
            />
          </div>
        ))}
      </section>
    </div>
  );
}
