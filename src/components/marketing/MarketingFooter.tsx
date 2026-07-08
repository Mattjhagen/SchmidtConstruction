import Link from 'next/link';
import { site } from '@/content/site';
import { services } from '@/content/services';
import { defaultSections } from '@/content/sections';
import NewsletterSignup from './NewsletterSignup';

const BRAND = '#3D52D4';

export default function MarketingFooter() {
  const h = defaultSections.hours;

  return (
    <footer style={{ background: '#1a2a7a' }} className="text-gray-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-white font-extrabold text-lg mb-3">{site.name}</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">{site.tagline}</p>
            <p className="text-sm text-gray-400">{site.address.full}</p>
            <a href={site.phoneHref} className="block text-sm mt-1 transition-colors hover:text-white" style={{ color: '#8BA3FF' }}>{site.phone}</a>
            <a href={`mailto:${site.email}`} className="block text-sm transition-colors hover:text-white" style={{ color: '#8BA3FF' }}>{site.email}</a>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase text-xs tracking-widest">Services</h4>
            <ul className="space-y-2">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/${s.slug}`} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company + Hours */}
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase text-xs tracking-widest">Company</h4>
            <ul className="space-y-2 text-sm mb-6">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Portfolio', href: '/portfolio' },
                { label: 'Service Areas', href: '/service-areas' },
                { label: 'Now Hiring', href: '/hiring' },
                { label: 'Contact', href: '/contact' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Sitemap', href: '/sitemap.xml' },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="text-gray-400 hover:text-white transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
            <h4 className="text-white font-semibold mb-2 uppercase text-xs tracking-widest">Hours</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li className="flex justify-between gap-4"><span>Mon – Fri</span><span>{h.weekdays}</span></li>
              <li className="flex justify-between gap-4"><span>Saturday</span><span>{h.saturday}</span></li>
              <li className="flex justify-between gap-4"><span>Sunday</span><span>{h.sunday}</span></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-2 uppercase text-xs tracking-widest">Stay in Touch</h4>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Get 10% off your first service when you subscribe to our newsletter.
            </p>
            <NewsletterSignup />
          </div>
        </div>

        <div className="border-t mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div>
            <p>© {new Date().getFullYear()} {site.legalName}. All rights reserved. Licensed & Insured.</p>
            <p className="mt-0.5">Serving {site.serviceArea}.</p>
          </div>
          <a
            href="https://login.schmidt-construction.com"
            className="text-gray-600 hover:text-gray-400 transition-colors border rounded px-3 py-1.5 whitespace-nowrap"
            style={{ borderColor: 'rgba(255,255,255,0.15)' }}
          >
            Admin Portal
          </a>
        </div>
      </div>
    </footer>
  );
}
