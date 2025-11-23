import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n";
import { NextRequest, NextResponse } from "next/server";
import { getSubdomain } from "./lib/utils/subdomain";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
  localeDetection: false, // Disable automatic locale detection
});

export default function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const subdomain = getSubdomain(hostname);
  const url = request.nextUrl.clone();

  // If this is a school subdomain, rewrite URLs to /schools/* routes
  if (subdomain && subdomain !== 'admin') {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-school-slug', subdomain);
    
    // Rewrite root paths to /schools paths
    // e.g., quisqueya.campus.ht/dashboard -> /schools/dashboard
    if (!url.pathname.startsWith('/schools') && 
        !url.pathname.startsWith('/api') && 
        !url.pathname.startsWith('/_next') &&
        !url.pathname.startsWith('/auth')) {
      
      // Rewrite to schools route with headers
      url.pathname = `/schools${url.pathname}`;
      
      const response = NextResponse.rewrite(url, {
        request: {
          headers: requestHeaders,
        },
      });
      
      response.headers.set('x-school-slug', subdomain);
      return response;
    }
    
    // For API routes, pass through with headers
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    
    response.headers.set('x-school-slug', subdomain);
    return response;
  }
  
  // If this is admin subdomain, rewrite URLs to /admin/* routes
  if (subdomain === 'admin') {
    // Rewrite root paths to /admin paths
    // e.g., admin.campus.ht/universities -> /admin/universities
    if (!url.pathname.startsWith('/admin') && 
        !url.pathname.startsWith('/api') && 
        !url.pathname.startsWith('/_next') &&
        !url.pathname.startsWith('/auth') &&
        url.pathname !== '/') {
      
      url.pathname = `/admin${url.pathname}`;
      return NextResponse.rewrite(url);
    }
    
    // admin.campus.ht/ -> /admin
    if (url.pathname === '/') {
      url.pathname = '/admin';
      return NextResponse.rewrite(url);
    }
  }

  // No subdomain, just run intl middleware
  return intlMiddleware(request);
}

export const config = {
  // Match all routes including API routes (need subdomain for API)
  // Exclude Next.js internals and static files
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
