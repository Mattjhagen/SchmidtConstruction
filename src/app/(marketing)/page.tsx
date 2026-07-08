import type { Metadata } from 'next';
import Link from 'next/link';
import Hero from '@/components/marketing/Hero';
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

const BRAND = '#3D52D4';

export default async function HomePage() {
  const [dbItems, serviceOverrides] = await Promise.all([
    siteContentDb.getPortfolioItems(),
    siteContentDb.getServiceOverrides(),
  ]);

  const items = dbItems.length > 0 ? dbItems : fallbackItems.map(p => ({ image_url: p.image, id: p.id }));
  const gridImages = items.map(p => p.image_url).filter(Boolean).slice(0, 6) as string[];
  const serviceImageMap = Object.fromEntries(
    serviceOverrides.filter(o => o.image_url).map(o => [o.slug, o.image_url as string])
  );
  const s = defaultSections;

  return (
    <>
      <Hero headline={s.hero.headline} subheadline={s.hero.subheadline} ctaText={s.hero.ctaText} />

      {/* Expert Construction Services — blue accent bar */}
      <section style={{ background: BRAND }} className="py-10 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-wide mb-2">
            Expert Construction Services
          </h2>
          <p className="text-white/80 text-sm max-w-2xl mx-auto">
            Schmidt Construction provides commercial and residential contracting in Omaha, NE and surrounding areas.
            Retaining walls, concrete, drainage, and full remodeling — all backed by {site.yearsInBusiness}+ years of family-owned craftsmanship.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase text-gray-900 mb-2 inline-flex items-center gap-2">
              {s.services.title}
              <AdminEditHint href="/admin/services" label="Edit" />
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">{s.services.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((svc) => {
              const img = serviceImageMap[svc.slug] || svc.image;
              return (
                <Link key={svc.id} href={`/${svc.slug}`}
                  className="group block rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  {img && (
                    <div className="h-44 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={svc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-sm">{svc.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{svc.seoDescription}</p>
                    <span className="mt-3 inline-block text-xs font-bold" style={{ color: BRAND }}>Learn More →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Project Showcase */}
      {gridImages.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold uppercase text-gray-900 mb-2">Our Latest Project Showcase</h2>
              <p className="text-gray-500 text-sm">{s.projects.subtitle}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gridImages.map((src, i) => (
                <div key={i} className="aspect-square overflow-hidden rounded-xl shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Project ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/portfolio"
                className="inline-block font-bold text-sm px-8 py-3 rounded-full text-white transition-colors"
                style={{ background: BRAND }}>
                View Full Portfolio
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase text-gray-900 mb-2">What Our Customers Say</h2>
            <p className="text-gray-500 text-sm">{s.testimonials.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredTestimonials.map((t) => <TestimonialCard key={t.id} t={t} />)}
          </div>
        </div>
      </section>

      {/* Contact / Hours + CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Hours */}
            <div>
              <h2 className="text-2xl font-extrabold uppercase text-gray-900 mb-6">Business Hours</h2>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="font-medium">Monday – Friday</span>
                  <span>{s.hours.weekdays}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="font-medium">Saturday</span>
                  <span>{s.hours.saturday}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Sunday</span>
                  <span>{s.hours.sunday}</span>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-sm text-gray-600 mb-1">Call us anytime:</p>
                <a href={site.phoneHref} className="text-2xl font-extrabold" style={{ color: BRAND }}>{site.phone}</a>
              </div>
            </div>

            {/* Get a Free Quote CTA */}
            <div className="rounded-2xl text-white p-8 text-center" style={{ background: BRAND }}>
              <h3 className="text-2xl font-extrabold uppercase mb-3">Ready to Start?</h3>
              <p className="text-white/80 text-sm mb-6">
                Get a free on-site estimate. We serve Omaha, Bellevue, Papillion, La Vista, Elkhorn, and surrounding communities.
              </p>
              <Link href="/contact"
                className="inline-block bg-white font-extrabold text-sm px-8 py-3 rounded-full transition-colors hover:bg-gray-100"
                style={{ color: BRAND }}>
                Get a Free Quote
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
