import type { Metadata } from 'next';
import { siteContentDb } from '@/lib/db';
import { portfolioItems as fallbackItems } from '@/content/portfolio';
import CTASection from '@/components/marketing/CTASection';

export const metadata: Metadata = {
  title: 'Portfolio — Our Work',
  description: 'Browse completed retaining wall, concrete, and remodeling projects from Schmidt Construction in Omaha, NE.',
};

export const revalidate = 3600;

export default async function PortfolioPage() {
  const dbItems = await siteContentDb.getPortfolioItems();
  const items = dbItems.length > 0 ? dbItems : fallbackItems.map(p => ({
    id: p.id,
    title: p.title,
    location: p.location,
    service_slug: p.serviceSlug,
    service_name: p.serviceName,
    description: p.description,
    image_url: p.image,
    featured: p.featured,
    sort_order: 0,
    created_at: '',
    updated_at: '',
  }));

  return (
    <>
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold mb-3">Our Work</h1>
          <p className="text-gray-300 text-lg">Browse completed projects across Omaha and the surrounding metro area.</p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-100 h-48 flex items-center justify-center overflow-hidden">
                  {item.image_url && !item.image_url.startsWith('/images/') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl">🏗️</span>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs text-yellow-600 font-semibold uppercase tracking-wide mb-1">{item.service_name}</p>
                  <h2 className="font-bold text-gray-900 mb-1">{item.title}</h2>
                  <p className="text-xs text-gray-500 mb-3">{item.location}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
