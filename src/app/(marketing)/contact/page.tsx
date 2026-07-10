import type { Metadata } from 'next';
import { site } from '@/content/site';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us — Free Estimate',
  description: `Contact Schmidt Construction for a free estimate. Serving Omaha, NE and surrounding communities. Call ${site.phone} or send us a message.`,
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold mb-3">Get a Free Estimate</h1>
          <p className="text-gray-300 text-lg">We respond to all inquiries within one business day.</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Info</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold text-gray-900">Phone</p>
                <a href={site.phoneHref} className="text-yellow-600 hover:underline text-base">{site.phone}</a>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Email</p>
                <a href={`mailto:${site.email}`} className="text-yellow-600 hover:underline">{site.email}</a>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Location</p>
                <p className="text-gray-600">{site.address.full}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Hours</p>
                <p className="text-gray-600">Monday–Friday: 7am–5pm</p>
                <p className="text-gray-600">Saturday: By appointment</p>
              </div>
            </div>
          </div>

          <ContactForm phone={site.phone} phoneHref={site.phoneHref} />
        </div>
      </section>
    </>
  );
}
