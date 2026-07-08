import type { Metadata } from 'next';
import Link from 'next/link';
import Hero from '@/components/marketing/Hero';
import ServiceCard from '@/components/marketing/ServiceCard';
import TestimonialCard from '@/components/marketing/TestimonialCard';
import { services } from '@/content/services';
import { featuredTestimonials } from '@/content/testimonials';
import { site } from '@/content/site';
import { defaultSections } from '@/content/sections';
import { siteContentDb } from '@/lib/db';
import { portfolioItems as fallbackItems } from '@/content/portfolio';
import AdminEditHint from '@/components/marketing/AdminEditHint';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: site.seo.homeTitle,
  description: site.seo.homeDescription,
};

export default async function HomePage() {
  const [dbItems, serviceOverrides] = await Promise.all([
    siteContentDb.getPortfolioItems(),
    siteContentDb.getServiceOverrides(),
  ]);

  const items = dbItems.length > 0 ? dbItems : fallbackItems.map(p => ({
    image_url: p.image,
    id: p.id,
  }));

  const slideshowImages = items.map(p => p.image_url).filter(Boolean) as string[];
  const gridImages = slideshowImages.slice(0, 6);

  const serviceImageMap = Object.fromEntries(
    serviceOverrides.filter(o => o.image_url).map(o => [o.slug, o.image_url as string])
  );

  const s = defaultSections;

  return (
    <>
      <Hero
        slideshowImages={slideshowImages}
        headline={s.hero.headline}
        subheadline={s.hero.subheadline}
        ctaText={s.hero.ctaText}
      />

      {/* Services */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3 inline-flex items-center flex-wrap justify-center gap-2">
              {s.services.title}
              <AdminEditHint href="/admin/services" label="Edit service photos" />
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-base">{s.services.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {services.map((svc) => (
              <ServiceCard
                key={svc.id}
                service={svc}
                imageUrl={serviceImageMap[svc.slug] || svc.image}
              />
            ))}
          </div>
        </div>
      </section>

      {/* About / Why Us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-5">{s.about.title}</h2>
              <p className="text-gray-600 leading-relaxed mb-6">{s.about.body}</p>
              <ul className="space-y-3 text-gray-700">
                {s.about.bullets.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-yellow-500 font-bold mt-0.5">✓</span>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className="inline-flex items-center mt-8 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-extrabold px-6 py-3 rounded-lg text-sm transition-colors"
              >
                Get a Free Estimate
              </Link>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-md h-80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/stone-retaining-wall-commercial.jpg"
                alt="Schmidt Construction retaining wall project"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Project Grid */}
      {gridImages.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-3">{s.projects.title}</h2>
              <p className="text-gray-500 max-w-xl mx-auto">{s.projects.subtitle}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gridImages.map((src, i) => (
                <div key={i} className="aspect-square overflow-hidden rounded-xl shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`Schmidt Construction project ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/portfolio"
                className="inline-flex items-center border-2 border-gray-900 hover:bg-gray-900 hover:text-white text-gray-900 font-bold px-6 py-3 rounded-lg text-sm transition-colors"
              >
                View Full Portfolio
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">{s.testimonials.title}</h2>
            <p className="text-gray-500 max-w-xl mx-auto">{s.testimonials.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredTestimonials.map((t) => <TestimonialCard key={t.id} t={t} />)}
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold mb-4">Ready to Start Your Project?</h2>
          <p className="text-gray-400 mb-8">
            Contact Schmidt Construction for a free on-site estimate. Serving Omaha, Bellevue, Papillion, La Vista, Elkhorn, and surrounding areas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex justify-center items-center bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-extrabold px-8 py-4 rounded-lg transition-colors"
            >
              Get a Free Quote
            </Link>
            <a
              href={site.phoneHref}
              className="inline-flex justify-center items-center border-2 border-white/40 hover:border-white text-white font-bold px-8 py-4 rounded-lg transition-colors"
            >
              {site.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
