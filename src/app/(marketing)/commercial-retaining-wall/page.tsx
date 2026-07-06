import type { Metadata } from 'next';
import { getServiceBySlug, getRelatedServices } from '@/content/services';
import ServicePageTemplate from '@/components/marketing/ServicePageTemplate';
import { notFound } from 'next/navigation';

const slug = 'commercial-retaining-wall';

export async function generateMetadata(): Promise<Metadata> {
  const s = getServiceBySlug(slug);
  if (!s) return {};
  return { title: s.seoTitle, description: s.seoDescription };
}

export default function Page() {
  const service = getServiceBySlug(slug);
  if (!service) notFound();
  return <ServicePageTemplate service={service} related={getRelatedServices(slug)} />;
}
