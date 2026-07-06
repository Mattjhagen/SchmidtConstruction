import type { Metadata } from 'next';
import { getServiceBySlug, getRelatedServices } from '@/content/services';
import ServicePageTemplate from '@/components/marketing/ServicePageTemplate';
import { siteContentDb } from '@/lib/db';
import { notFound } from 'next/navigation';

const slug = 'timber-retaining-wall';
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const s = getServiceBySlug(slug);
  if (!s) return {};
  return { title: s.seoTitle, description: s.seoDescription };
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
