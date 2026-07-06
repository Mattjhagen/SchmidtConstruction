import Link from 'next/link';
import type { Service } from '@/content/services';

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/${service.slug}`}
      className="group flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-yellow-300 transition-all overflow-hidden"
    >
      <div className="bg-gray-50 h-40 flex items-center justify-center text-5xl group-hover:bg-yellow-50 transition-colors">
        {service.icon}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-base mb-2 group-hover:text-yellow-700 transition-colors">
          {service.name}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed flex-1">{service.shortDescription}</p>
        <span className="mt-4 text-xs font-semibold text-yellow-600 group-hover:underline">
          Learn more →
        </span>
      </div>
    </Link>
  );
}
