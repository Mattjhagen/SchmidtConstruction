import Link from 'next/link';
import CTASection from './CTASection';
import ServiceCard from './ServiceCard';
import type { Service } from '@/content/services';
import { site } from '@/content/site';

interface Props {
  service: Service;
  related: Service[];
}

export default function ServicePageTemplate({ service, related }: Props) {
  return (
    <>
      {/* Hero */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-yellow-400 text-xs font-semibold uppercase tracking-widest mb-2">
            <Link href="/" className="hover:underline">Home</Link> / {service.name}
          </p>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{service.icon}</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold">{service.name}</h1>
          </div>
          <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">{service.shortDescription}</p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 py-3 rounded-lg text-sm transition-colors"
            >
              {site.cta.primary}
            </Link>
            <a
              href={site.phoneHref}
              className="inline-flex items-center border border-gray-400 hover:border-white text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
            >
              {site.phone}
            </a>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Service</h2>
            <p className="text-gray-600 leading-relaxed">{service.longDescription}</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What&apos;s Included</h2>
            <ul className="space-y-2">
              {service.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-gray-700 text-sm">
                  <span className="text-yellow-500 mt-0.5 shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CTASection />

      {/* Related */}
      {related.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Services</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((s) => <ServiceCard key={s.id} service={s} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
