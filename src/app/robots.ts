import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/dashboard', '/clients', '/projects', '/proposals', '/settings', '/catalog'] },
    ],
    sitemap: 'https://www.schmidt-construction.com/sitemap.xml',
  };
}
