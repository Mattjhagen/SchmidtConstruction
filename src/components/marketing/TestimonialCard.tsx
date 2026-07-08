import type { Testimonial } from '@/content/testimonials';

const BRAND = '#3D52D4';

export default function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
      <div className="flex mb-3">
        {Array.from({ length: t.rating }).map((_, i) => (
          <svg key={i} className="h-4 w-4" style={{ color: BRAND }} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="text-gray-700 text-sm leading-relaxed flex-1 italic">&ldquo;{t.quote}&rdquo;</p>
      <div className="mt-4 pt-4 border-t border-gray-50">
        <p className="font-bold text-sm text-gray-900">{t.name}</p>
        <p className="text-xs text-gray-500">{t.location} · {t.service}</p>
      </div>
    </div>
  );
}
