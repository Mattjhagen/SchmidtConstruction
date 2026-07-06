import type { Metadata } from 'next';
import { site } from '@/content/site';

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

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h2>
            <p className="text-gray-600 text-sm mb-4">
              Fill out the form below and we&apos;ll reach out to schedule your free on-site estimate.
            </p>
            <form
              action={`mailto:${site.email}`}
              method="GET"
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input name="name" type="text" required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input name="phone" type="tel" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Needed</label>
                <select name="service" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                  <option value="">Select a service...</option>
                  <option>Retaining Wall Installation</option>
                  <option>Block Retaining Wall</option>
                  <option>Timber Retaining Wall</option>
                  <option>Commercial Retaining Wall</option>
                  <option>Drainage Solutions</option>
                  <option>Concrete Work</option>
                  <option>Kitchen Remodeling</option>
                  <option>Bathroom Remodeling</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea name="body" rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="Describe your project..." />
              </div>
              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-lg text-sm transition-colors"
              >
                Send Message
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-3">
              This form opens your email client. Prefer to call? Reach us at <a href={site.phoneHref} className="text-yellow-600">{site.phone}</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
