import Link from 'next/link';
import { site } from '@/content/site';
import { services } from '@/content/services';

export default function MarketingFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-3">{site.name}</h3>
            <p className="text-sm leading-relaxed mb-4">{site.tagline}</p>
            <p className="text-sm">{site.address.full}</p>
            <a href={site.phoneHref} className="block text-sm text-yellow-400 hover:text-yellow-300 mt-1">{site.phone}</a>
            <a href={`mailto:${site.email}`} className="block text-sm text-yellow-400 hover:text-yellow-300">{site.email}</a>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Services</h4>
            <ul className="space-y-1">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/${s.slug}`} className="text-sm hover:text-white transition-colors">
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Company</h4>
            <ul className="space-y-1 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/portfolio" className="hover:text-white transition-colors">Portfolio</Link></li>
              <li><Link href="/service-areas" className="hover:text-white transition-colors">Service Areas</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/sitemap.xml" className="hover:text-white transition-colors">Sitemap</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div className="text-center sm:text-left">
            <p>© {new Date().getFullYear()} {site.legalName}. All rights reserved. Licensed & Insured.</p>
            <p className="mt-1">Serving {site.serviceArea}.</p>
          </div>
          <a
            href="https://login.schmidt-construction.com"
            className="text-gray-600 hover:text-gray-400 transition-colors border border-gray-700 hover:border-gray-600 rounded px-3 py-1.5 whitespace-nowrap"
          >
            Admin Portal
          </a>
        </div>
      </div>
    </footer>
  );
}
