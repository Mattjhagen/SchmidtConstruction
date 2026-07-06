'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { site } from '@/content/site';
import Image from 'next/image';

const moreItems = [
  { label: 'Service Areas', href: '/service-areas' },
  { label: 'About Us', href: '/about' },
  { label: 'Hiring', href: '/hiring' },
];

const retainingWallItems = [
  { label: 'Retaining Wall Installation', href: '/retaining-wall-installation' },
  { label: 'Block Retaining Wall', href: '/block-retaining-wall' },
  { label: 'Timber Retaining Wall', href: '/timber-retaining-wall' },
  { label: 'Seawall & Lakeside', href: '/seawall-lakeside' },
  { label: 'Commercial Retaining Wall', href: '/commercial-retaining-wall' },
  { label: 'Drainage Solutions', href: '/drainage-solutions' },
];

const remodelingItems = [
  { label: 'Kitchen Remodeling', href: '/kitchen-remodeling' },
  { label: 'Bathroom Remodeling', href: '/bathroom-remodeling' },
];

function DropdownMenu({ label, items, mobile, onClose }: {
  label: string;
  items: { label: string; href: string }[];
  mobile?: boolean;
  onClose?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (mobile) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-2 py-2 text-sm font-medium text-gray-700 hover:text-yellow-600"
        >
          {label}
          <svg className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <div className="pl-4 space-y-1 pb-1">
            {items.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="block py-1.5 text-sm text-gray-600 hover:text-yellow-600"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onMouseEnter={() => { cancelClose(); setOpen(true); }}
        onMouseLeave={scheduleClose}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-yellow-600 transition-colors"
      >
        {label}
        <svg className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
        >
          {items.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MarketingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt={site.name} width={160} height={54} className="h-12 w-auto" priority />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-5">
            <DropdownMenu label="Retaining Walls" items={retainingWallItems} />
            <DropdownMenu label="Remodeling" items={remodelingItems} />
            <Link href="/concrete-contractor" className="text-sm font-medium text-gray-700 hover:text-yellow-600 transition-colors">
              Concrete
            </Link>
            <Link href="/portfolio" className="text-sm font-medium text-gray-700 hover:text-yellow-600 transition-colors">
              Portfolio
            </Link>
            <Link href="/contact" className="text-sm font-medium text-gray-700 hover:text-yellow-600 transition-colors">
              Contact
            </Link>
            <DropdownMenu label="More" items={moreItems} />
            <a
              href={site.phoneHref}
              className="ml-2 inline-flex items-center bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              {site.phone}
            </a>
          </nav>

          {/* Mobile hamburger */}
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

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 pb-4 pt-2 space-y-1">
            <DropdownMenu label="Retaining Walls" items={retainingWallItems} mobile onClose={() => setMenuOpen(false)} />
            <DropdownMenu label="Remodeling" items={remodelingItems} mobile onClose={() => setMenuOpen(false)} />
            {[
              { label: 'Concrete Contractor', href: '/concrete-contractor' },
              { label: 'Portfolio', href: '/portfolio' },
              { label: 'Service Areas', href: '/service-areas' },
              { label: 'About', href: '/about' },
              { label: 'Hiring', href: '/hiring' },
              { label: 'Contact', href: '/contact' },
            ].map(item => (
              <Link
                key={item.href}
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
