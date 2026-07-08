import Link from 'next/link';
import { site } from '@/content/site';

interface Props {
  headline?: string;
  subheadline?: string;
  ctaText?: string;
}

export default function Hero({
  headline = 'EXPERT COMMERCIAL CONSTRUCTION SERVICES',
  subheadline = 'Building durable structures with quality and precision',
  ctaText = 'Get a Free Quote',
}: Props) {
  return (
    <section
      className="flex items-center justify-center text-white text-center min-h-[580px] px-4"
      style={{ background: '#3D52D4' }}
    >
      <div className="max-w-3xl w-full py-24">
        <h1
          className="text-4xl sm:text-6xl font-extrabold uppercase tracking-tight leading-tight mb-5"
          style={{ letterSpacing: '0.02em' }}
        >
          {headline}
        </h1>

        {/* Horizontal rule divider — exactly like GoDaddy site */}
        <div className="border-t border-white/40 w-3/4 mx-auto mb-5" />

        <p className="text-base sm:text-lg text-white/90 mb-8 max-w-xl mx-auto">
          {subheadline}
        </p>

        <Link
          href="/contact"
          className="inline-block font-bold text-sm px-8 py-3 rounded-full text-white transition-all"
          style={{ background: '#2E42B8', border: '2px solid rgba(255,255,255,0.3)' }}
        >
          {ctaText}
        </Link>

        <div className="mt-10 text-xs text-white/60">
          {site.yearsInBusiness}+ Years · Licensed &amp; Insured · Free Estimates
        </div>
      </div>
    </section>
  );
}
