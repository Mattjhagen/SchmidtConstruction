import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_SUBDOMAIN = 'login';
const PUBLIC_PATHS = ['/login', '/favicon.ico', '/_next', '/api', '/robots.txt', '/sitemap.xml', '/llms.txt'];

// Domains that should 301 redirect to the main site
const REDIRECT_DOMAINS = ['walls2.com', 'www.walls2.com'];

export function proxy(request: NextRequest) {
  const host = request.headers.get('host') ?? '';

  // Redirect alias domains to the canonical site
  if (REDIRECT_DOMAINS.some(d => host === d)) {
    const url = request.nextUrl.clone();
    url.host = 'www.schmidt-construction.com';
    url.protocol = 'https:';
    return NextResponse.redirect(url, { status: 301 });
  }

  const isAdminSubdomain =
    host.startsWith(`${ADMIN_SUBDOMAIN}.`) ||
    // support localhost preview: login.localhost:3000
    host.startsWith(`${ADMIN_SUBDOMAIN}.localhost`);

  if (!isAdminSubdomain) return NextResponse.next();

  const { pathname } = request.nextUrl;

  // Always allow public paths (login page, static assets, API routes)
  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  // Check auth cookie
  const isAuthed = request.cookies.has('schmidt_admin');

  if (!isAuthed) {
    // Redirect to login, preserving the intended destination
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on all paths except static files
    '/((?!_next/static|_next/image|public/|favicon.ico).*)',
  ],
};
