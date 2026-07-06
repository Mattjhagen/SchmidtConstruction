'use client';

import Link from 'next/link';
import { useState } from 'react';
import { site } from '@/content/site';
import Image from 'next/image';

export default function MarketingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  const nav = [
    { label: 'Services', href: '/#services' },
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'Service Areas', href: '/service-areas' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt={site.name} width={160} height={54} className="h-12 w-auto" priority />
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            {nav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-gray-700 hover:text-yellow-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={site.phoneHref}
              className="ml-4 inline-flex items-center bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              {site.phone}
            </a>
          </nav>

          <button
            className="md:hidden p-2 rounded text-gray-600 hover:text-gray-900"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 pb-4 pt-2 space-y-1">
            {nav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block px-2 py-2 text-sm font-medium text-gray-700 hover:text-yellow-600"
              >
                {item.label}
              </Link>
            ))}
            <a href={site.phoneHref} className="block mt-2 px-2 py-2 text-sm font-semibold text-yellow-600">
              {site.phone}
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
