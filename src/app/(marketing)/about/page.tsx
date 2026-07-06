import type { Metadata } from 'next';
import CTASection from '@/components/marketing/CTASection';
import { site } from '@/content/site';

export const metadata: Metadata = {
  title: 'About Us',
  description: `Learn about Schmidt Construction, a family-owned contractor serving Omaha, NE since ${site.founded}. ${site.yearsInBusiness}+ years of retaining walls, concrete, and remodeling.`,
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold mb-4">About Schmidt Construction</h1>
          <p className="text-gray-300 text-lg">{site.tagline}</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
            <p className="text-gray-600 leading-relaxed">
              Schmidt Construction was founded in {site.founded} and has served the Omaha metro area for over {site.yearsInBusiness} years. What started as a small family operation has grown into one of the most trusted names in retaining walls, concrete work, drainage solutions, and remodeling in eastern Nebraska.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              We are a family-owned business, and that means something to us. Our reputation is built on every wall we build and every project we complete. We do not cut corners, and we stand behind our work.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { title: 'Quality Workmanship', body: 'We follow manufacturer specs and industry best practices on every installation.' },
                { title: 'Transparent Pricing', body: 'Our estimates are detailed and honest. No surprises at invoice time.' },
                { title: 'Proper Drainage', body: 'Every retaining wall we build includes drainage. Period.' },
                { title: 'Licensed & Insured', body: 'Fully licensed, bonded, and insured for your protection and ours.' },
              ].map((item) => (
                <div key={item.title} className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Area</h2>
            <p className="text-gray-600 leading-relaxed">{site.serviceArea}.</p>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
