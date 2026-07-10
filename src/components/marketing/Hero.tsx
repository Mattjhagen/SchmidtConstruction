import Link from 'next/link';
import { site } from '@/content/site';
import HeroSlideshow from './HeroSlideshow';

interface Props {
  slideshowImages?: string[];
}

export default function Hero({ slideshowImages = [] }: Props) {
  return (
    <section className="relative bg-gray-900 text-white overflow-hidden min-h-[520px] flex items-center">
      {slideshowImages.length > 0 ? (
        <HeroSlideshow images={slideshowImages} />
      ) : (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: "url('/images/retaining-wall.jpg')" }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gray-900/40" aria-hidden="true" />
        </>
      )}

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="max-w-2xl">
          <p className="text-yellow-400 text-sm font-semibold tracking-widest uppercase mb-3">
            Omaha, NE · Est. {site.founded}
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
            Retaining Walls, Concrete & Remodeling Done Right
          </h1>
          <p className="text-lg text-gray-200 mb-8 leading-relaxed">
            {site.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/contact"
              className="inline-flex justify-center items-center bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 py-3 rounded-lg text-base transition-colors"
            >
              {site.cta.primary}
            </Link>
            <Link
              href="/portfolio"
              className="inline-flex justify-center items-center border border-white hover:bg-white hover:text-gray-900 text-white font-bold px-6 py-3 rounded-lg text-base transition-colors"
            >
              {site.cta.secondary}
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-6 text-sm text-gray-300">
            <span>✓ {site.yearsInBusiness}+ years in business</span>
            <span>✓ Licensed & Insured</span>
            <span>✓ Free Estimates</span>
          </div>
        </div>
      </div>
    </section>
  );
}
