import Link from 'next/link';
import { site } from '@/content/site';
import HeroSlideshow from './HeroSlideshow';

interface Props {
  slideshowImages?: string[];
  headline?: string;
  subheadline?: string;
  ctaText?: string;
}

export default function Hero({
  slideshowImages = [],
  headline = 'Building Durable Structures with Quality and Precision',
  subheadline = site.description,
  ctaText = 'Get a Free Quote',
}: Props) {
  return (
    <section className="relative bg-gray-900 text-white overflow-hidden min-h-[580px] flex items-center">
      {slideshowImages.length > 0 ? (
        <HeroSlideshow images={slideshowImages} />
      ) : (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: "url('/images/retaining-wall.jpg')" }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gray-900/50" aria-hidden="true" />
        </>
      )}

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36 text-center">
        <p className="text-yellow-400 text-xs font-bold tracking-widest uppercase mb-4">
          Omaha, NE · Est. {site.founded} · {site.yearsInBusiness}+ Years of Excellence
        </p>
        <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight mb-6">
          {headline}
        </h1>
        <p className="text-lg text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto">
          {subheadline}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/contact"
            className="inline-flex justify-center items-center bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-extrabold px-8 py-4 rounded-lg text-base transition-colors shadow-lg"
          >
            {ctaText}
          </Link>
          <Link
            href="/portfolio"
            className="inline-flex justify-center items-center border-2 border-white/60 hover:border-white hover:bg-white/10 text-white font-bold px-8 py-4 rounded-lg text-base transition-colors"
          >
            View Our Work
          </Link>
        </div>
        <div className="mt-10 flex flex-wrap gap-6 text-sm text-gray-400 justify-center">
          <span>✓ Licensed & Insured</span>
          <span>✓ Free On-Site Estimates</span>
          <span>✓ Omaha&apos;s Trusted Contractor</span>
        </div>
      </div>
    </section>
  );
}
