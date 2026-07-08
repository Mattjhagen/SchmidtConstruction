import Link from 'next/link';
import { site } from '@/content/site';
import { services } from '@/content/services';
import { defaultSections } from '@/content/sections';
import NewsletterSignup from './NewsletterSignup';

export default function MarketingFooter() {
  const h = defaultSections.hours;

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-white font-extrabold text-lg mb-3">{site.name}</h3>
            <p className="text-sm leading-relaxed mb-4 text-gray-400">{site.tagline}</p>
            <p className="text-sm text-gray-400">{site.address.full}</p>
            <a href={site.phoneHref} className="block text-sm text-yellow-400 hover:text-yellow-300 mt-1 transition-colors">{site.phone}</a>
            <a href={`mailto:${site.email}`} className="block text-sm text-yellow-400 hover:text-yellow-300 transition-colors">{site.email}</a>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
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
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm mb-6">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/portfolio" className="text-gray-400 hover:text-white transition-colors">Portfolio</Link></li>
              <li><Link href="/service-areas" className="text-gray-400 hover:text-white transition-colors">Service Areas</Link></li>
              <li><Link href="/hiring" className="text-gray-400 hover:text-white transition-colors">Now Hiring</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/sitemap.xml" className="text-gray-400 hover:text-white transition-colors">Sitemap</Link></li>
            </ul>
            <h4 className="text-white font-semibold mb-2 text-sm">Business Hours</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li className="flex justify-between gap-4"><span>Mon – Fri</span><span>{h.weekdays}</span></li>
              <li className="flex justify-between gap-4"><span>Saturday</span><span>{h.saturday}</span></li>
              <li className="flex justify-between gap-4"><span>Sunday</span><span>{h.sunday}</span></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-2">Stay in Touch</h4>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Get seasonal tips, project spotlights, and special offers — no spam.
            </p>
            <NewsletterSignup />
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <div>
            <p>© {new Date().getFullYear()} {site.legalName}. All rights reserved. Licensed & Insured.</p>
            <p className="mt-0.5">Serving {site.serviceArea}.</p>
          </div>
          <a
            href="https://login.schmidt-construction.com"
            className="text-gray-700 hover:text-gray-400 transition-colors border border-gray-800 hover:border-gray-700 rounded px-3 py-1.5 whitespace-nowrap"
          >
            Admin Portal
          </a>
        </div>
      </div>
    </footer>
  );
}
