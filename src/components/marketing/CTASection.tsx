import Link from 'next/link';
import { site } from '@/content/site';

export default function CTASection() {
  return (
    <section className="bg-yellow-500 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold text-white mb-4">
          Ready for a Free Estimate?
        </h2>
        <p className="text-yellow-100 text-lg mb-8 max-w-xl mx-auto">
          We serve Omaha and surrounding communities. Call us today or fill out our contact form and we&apos;ll get back to you fast.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a
            href={site.phoneHref}
            className="inline-flex justify-center items-center bg-white text-yellow-700 font-bold px-8 py-3 rounded-lg text-base hover:bg-yellow-50 transition-colors"
          >
            Call {site.phone}
          </a>
          <Link
            href="/contact"
            className="inline-flex justify-center items-center border-2 border-white text-white font-bold px-8 py-3 rounded-lg text-base hover:bg-yellow-600 transition-colors"
          >
            {site.cta.contact}
          </Link>
        </div>
      </div>
    </section>
  );
}
