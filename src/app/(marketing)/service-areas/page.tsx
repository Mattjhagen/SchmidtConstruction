import type { Metadata } from 'next';
import { serviceAreas } from '@/content/serviceAreas';
import CTASection from '@/components/marketing/CTASection';
import { site } from '@/content/site';

export const metadata: Metadata = {
  title: 'Service Areas — Omaha Metro',
  description: `Schmidt Construction serves Omaha, Bellevue, Papillion, La Vista, Gretna, Elkhorn, Millard, Ralston, and Council Bluffs. Licensed contractor. Free estimates.`,
};

export default function ServiceAreasPage() {
  const primary = serviceAreas.filter(a => a.primary);
  const secondary = serviceAreas.filter(a => !a.primary);

  return (
    <>
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold mb-3">Service Areas</h1>
          <p className="text-gray-300 text-lg">{site.serviceArea}.</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Primary Service Areas</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {primary.map((area) => (
                <div key={area.id} className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 mb-1">{area.name}, {area.state}</h3>
                  <p className="text-sm text-gray-600">{area.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Coverage</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {secondary.map((area) => (
                <div key={area.id} className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 mb-1">{area.name}, {area.state}</h3>
                  <p className="text-sm text-gray-600">{area.description}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-gray-600 text-sm">
            Not sure if we service your area? Call us at <a href={site.phoneHref} className="text-yellow-600 font-semibold hover:underline">{site.phone}</a> and we&apos;ll let you know.
          </p>
        </div>
      </section>

      <CTASection />
    </>
  );
}
