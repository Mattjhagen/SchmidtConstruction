import Link from 'next/link';
import type { Service } from '@/content/services';

interface Props {
  service: Service;
  imageUrl?: string;
}

export default function ServiceCard({ service, imageUrl }: Props) {
  const photo = imageUrl || service.image;

  return (
    <Link
      href={`/${service.slug}`}
      className="group flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-yellow-300 transition-all overflow-hidden"
    >
      <div className="relative h-40 overflow-hidden bg-gray-100">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-gray-50 group-hover:bg-yellow-50 transition-colors">
            {service.icon}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
