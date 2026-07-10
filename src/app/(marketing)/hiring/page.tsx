import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/content/site';
import CTASection from '@/components/marketing/CTASection';

export const metadata: Metadata = {
  title: 'Now Hiring | Schmidt Construction Omaha NE',
  description: 'Schmidt Construction is hiring experienced construction workers in Omaha, NE. Join a family-owned company with 50+ years of excellence. Apply today.',
};

export default function HiringPage() {
  return (
    <>
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-yellow-400 text-sm font-semibold tracking-widest uppercase mb-3">Join Our Team</p>
          <h1 className="text-4xl font-extrabold mb-3">Now Hiring in Omaha, NE</h1>
          <p className="text-gray-300 text-lg">Schmidt Construction is a family-owned contractor with 50+ years of excellence. We're looking for skilled, reliable people to grow with us.</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Open Positions</h2>
              <div className="space-y-4">
                {[
                  { title: 'Retaining Wall Installer', type: 'Full-Time', desc: 'Experience with block wall systems (Allan Block, Versa-Lok, Keystone). Will train the right candidate.' },
                  { title: 'Concrete Laborer', type: 'Full-Time', desc: 'Assist with driveway, patio, and flatwork concrete pours. Physical work in an outdoor environment.' },
                  { title: 'Equipment Operator', type: 'Full-Time', desc: 'Skid steer and mini excavator experience preferred. CDL a plus.' },
                  { title: 'General Construction Laborer', type: 'Full-Time / Seasonal', desc: 'No experience required. Hardworking and reliable. Willing to learn all aspects of the trade.' },
                ].map((job) => (
                  <div key={job.title} className="border border-gray-200 rounded-xl p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-bold text-gray-900">{job.title}</h3>
                      <span className="text-xs bg-yellow-100 text-yellow-800 font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">{job.type}</span>
                    </div>
                    <p className="text-sm text-gray-600">{job.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Work With Us</h2>
              <ul className="space-y-3 mb-8">
                {[
                  'Competitive pay based on experience',
                  'Year-round and seasonal positions available',
                  'Overtime opportunities during peak season',
                  'Work with an experienced, professional crew',
                  'Family-owned company — you\'re not just a number',
                  'Omaha-based, local work — no long travel',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="text-yellow-500 font-bold mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Apply</h2>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                Call or email us to express your interest. We'll schedule a quick conversation and go from there. No formal application required to start.
              </p>
              <a
                href={site.phoneHref}
                className="inline-flex items-center bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 py-3 rounded-lg text-sm transition-colors mr-3"
              >
                Call {site.phone}
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center border border-gray-300 hover:border-yellow-400 text-gray-700 font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
              >
                Send a Message
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
