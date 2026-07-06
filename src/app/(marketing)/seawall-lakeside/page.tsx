import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getServiceBySlug, getRelatedServices } from '@/content/services';
import ServicePageTemplate from '@/components/marketing/ServicePageTemplate';
import { siteContentDb } from '@/lib/db';

const slug = 'seawall-lakeside';
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const service = getServiceBySlug(slug);
  if (!service) return {};
  return { title: service.seoTitle, description: service.seoDescription };
}

export default async function Page() {
  const service = getServiceBySlug(slug);
  if (!service) notFound();
  const override = await siteContentDb.getServiceOverride(slug);
  return (
    <ServicePageTemplate
      service={service}
      related={getRelatedServices(slug)}
      overrideDescription={override?.long_description}
      overrideImageUrl={override?.image_url}
    />
  );
}
