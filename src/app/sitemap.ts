import type { MetadataRoute } from 'next';
import { services } from '@/content/services';

const base = 'https://www.schmidt-construction.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    { url: base, priority: 1.0 },
    { url: `${base}/about`, priority: 0.7 },
    { url: `${base}/portfolio`, priority: 0.8 },
    { url: `${base}/service-areas`, priority: 0.7 },
    { url: `${base}/contact`, priority: 0.9 },
    { url: `${base}/hiring`, priority: 0.6 },
    { url: `${base}/terms`, priority: 0.3 },
    { url: `${base}/privacy`, priority: 0.3 },
  ];

  const servicePages = services.map((s) => ({
    url: `${base}/${s.slug}`,
    priority: 0.8,
  }));

  return [...staticPages, ...servicePages].map((page) => ({
    url: page.url,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: page.priority,
  }));
}
