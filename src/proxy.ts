// Host-based access control (Next.js 16 "proxy" convention)
// Location: src/proxy.ts  (MUST be named proxy.ts at src/ root — Next.js 16 renamed
// the old "middleware" convention to "proxy". The exported function must be `proxy`.)
//
// Two hosts, one deployment:
//   - schmidt-construction.com (main)      => PUBLIC MARKETING ONLY.
//       Any authenticated route (admin app OR client portal) is redirected
//       to the login subdomain.
//   - login.schmidt-construction.com (auth) => AUTHENTICATED GATEWAY.
//       Single login; employees land on the admin app, clients on the portal.
//       Admin routes require a Supabase session (role check happens in-app
//       after the session is resolved).

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const ADMIN_SUBDOMAIN = 'login';

// Alias domains that should 301 to the canonical marketing site.
const REDIRECT_DOMAINS = ['walls2.com', 'www.walls2.com'];

// Paths that make up the AUTHENTICATED surface (must live on the login subdomain).
// Everything else on the main host is treated as public marketing.
const ADMIN_PREFIXES = [
  '/dashboard', '/clients', '/catalog', '/admin',
  '/projects', '/proposals', '/settings', '/timeclock', '/timesheets',
];
const PORTAL_PREFIX = '/portal';

// Auth infrastructure + framework paths that are always allowed.
const ALWAYS_ALLOW = ['/login', '/invite', '/reset-password', '/portal/auth', '/_next', '/api', '/favicon.ico', '/robots.txt', '/sitemap.xml', '/llms.txt', '/icon.png', '/logo.png'];

function isAdminPath(pathname: string): boolean {
  return ADMIN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
}
function isPortalPath(pathname: string): boolean {
  return pathname === PORTAL_PREFIX || pathname.startsWith(PORTAL_PREFIX + '/');
}
function isAlwaysAllowed(pathname: string): boolean {
  return ALWAYS_ALLOW.some((p) => pathname === p || pathname.startsWith(p));
}

export async function proxy(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  const { pathname } = request.nextUrl;

  // 1. Redirect alias domains to the canonical marketing site.
  if (REDIRECT_DOMAINS.some((d) => host === d)) {
    const url = request.nextUrl.clone();
    url.host = 'www.schmidt-construction.com';
    url.protocol = 'https:';
    return NextResponse.redirect(url, { status: 301 });
  }

  const isAdminSubdomain =
    host.startsWith(`${ADMIN_SUBDOMAIN}.`) || host.startsWith(`${ADMIN_SUBDOMAIN}.localhost`);

  // -------------------------------------------------------------
  // MAIN HOST: marketing only. Push any authenticated surface to the login subdomain.
  // -------------------------------------------------------------
  if (!isAdminSubdomain) {
    if (isAdminPath(pathname) || isPortalPath(pathname) || pathname === '/login' || pathname.startsWith('/invite') || pathname.startsWith('/reset-password')) {
      const url = request.nextUrl.clone();
      // Promote to the login subdomain, preserving path + query.
      url.host = host.startsWith('localhost') || host.includes('.localhost')
        ? `${ADMIN_SUBDOMAIN}.${host}`
        : `${ADMIN_SUBDOMAIN}.${host.replace(/^www\./, '')}`;
      // Send bare /login to the unified sign-in; keep deep links otherwise.
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // -------------------------------------------------------------
  // LOGIN SUBDOMAIN: authenticated gateway.
  // -------------------------------------------------------------

  // Root of the login subdomain => unified sign-in page.
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url, { status: 302 });
  }

  // Always allow auth infra + framework/static paths.
  if (isAlwaysAllowed(pathname)) return NextResponse.next();

  // Portal pages: any authenticated user may access; the page itself scopes
  // data by the signed-in user (and share_token). No role gate here.
  if (isPortalPath(pathname)) return NextResponse.next();

  // Admin pages: require a Supabase session. Establish/refresh it here.
  if (isAdminPath(pathname)) {
    let response = NextResponse.next({ request: { headers: request.headers } });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Session exists. Fine-grained employee-vs-client role enforcement happens
    // in-app (AuthGuard / page) where the employees table can be queried; the
    // proxy guarantees a valid session before the admin app renders.
    return response;
  }

  // Anything else on the login subdomain: allow (marketing pages won't normally
  // be linked here, but we don't want to hard-block unknown paths).
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on everything except static asset files.
    '/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js)$).*)',
  ],
};
