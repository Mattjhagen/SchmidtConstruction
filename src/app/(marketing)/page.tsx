import type { Metadata } from 'next';
import Hero from '@/components/marketing/Hero';
import ServiceCard from '@/components/marketing/ServiceCard';
import TestimonialCard from '@/components/marketing/TestimonialCard';
import CTASection from '@/components/marketing/CTASection';
import { services } from '@/content/services';
import { featuredTestimonials } from '@/content/testimonials';
import { site } from '@/content/site';
import { siteContentDb } from '@/lib/db';
import { portfolioItems as fallbackItems } from '@/content/portfolio';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: site.seo.homeTitle,
  description: site.seo.homeDescription,
};

export default async function HomePage() {
  const dbItems = await siteContentDb.getPortfolioItems();
  const items = dbItems.length > 0 ? dbItems : fallbackItems.map(p => ({
    image_url: p.image,
    id: p.id,
  }));
  const slideshowImages = items
    .map(p => p.image_url)
    .filter(Boolean) as string[];

  return (
    <>
      <Hero slideshowImages={slideshowImages} />

      {/* Services */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Our Services</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              From retaining walls and concrete to kitchen and bathroom remodeling, Schmidt Construction delivers quality craftsmanship on every project.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s) => <ServiceCard key={s.id} service={s} />)}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                Why Omaha Chooses Schmidt Construction
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Since {site.founded}, we&apos;ve built a reputation for doing the job right the first time. As a family-owned business, our name is on every wall we build and every project we complete.
              </p>
              <ul className="space-y-3 text-gray-700">
                {[
                  `${site.yearsInBusiness}+ years serving the Omaha metro`,
                  'Every project includes proper drainage',
                  'Licensed, bonded, and fully insured',
                  'Free on-site estimates',
                  'Straight answers and transparent pricing',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-yellow-500 font-bold mt-0.5">✓</span>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl h-72 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/stone-retaining-wall-commercial.jpg" alt="Schmidt Construction retaining wall project" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredTestimonials.map((t) => <TestimonialCard key={t.id} t={t} />)}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
