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

  // Skip middleware for API routes entirely - let them handle themselves
  if (url.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // If this is a school subdomain, rewrite URLs to /schools/* routes
  if (subdomain && subdomain !== 'admin') {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-school-slug', subdomain);
    
    // Rewrite root paths to /schools paths
    // e.g., uc.campushaiti.org/dashboard -> /schools/dashboard
    if (!url.pathname.startsWith('/schools') && 
        !url.pathname.startsWith('/api') && 
        !url.pathname.startsWith('/_next') &&
        !url.pathname.startsWith('/auth')) {
      
      // First apply intl middleware to get the locale
      const intlResponse = intlMiddleware(request);
      
      // Get the locale from the pathname (if added by intl middleware)
      const locale = url.pathname.split('/')[1];
      const hasLocale = locales.includes(locale as any);
      
      // Build the rewrite path
      const pathWithoutLocale = hasLocale ? url.pathname.substring(locale.length + 1) : url.pathname;
      const rewritePath = hasLocale 
        ? `/${locale}/schools${pathWithoutLocale || '/dashboard'}`
        : `/schools${url.pathname}`;
      
      url.pathname = rewritePath;
      
      const response = NextResponse.rewrite(url, {
        request: {
          headers: requestHeaders,
        },
      });
      
      response.headers.set('x-school-slug', subdomain);
      return response;
    }
    
    // For already /schools paths, just add headers
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
    // First apply intl middleware
    const intlResponse = intlMiddleware(request);
    
    // Rewrite root paths to /admin paths
    if (!url.pathname.startsWith('/admin') && 
        !url.pathname.startsWith('/api') && 
        !url.pathname.startsWith('/_next') &&
        !url.pathname.startsWith('/auth') &&
        url.pathname !== '/') {
      
      const locale = url.pathname.split('/')[1];
      const hasLocale = locales.includes(locale as any);
      
      const pathWithoutLocale = hasLocale ? url.pathname.substring(locale.length + 1) : url.pathname;
      const rewritePath = hasLocale 
        ? `/${locale}/admin${pathWithoutLocale || ''}`
        : `/admin${url.pathname}`;
      
      url.pathname = rewritePath;
      return NextResponse.rewrite(url);
    }
    
    // admin.campushaiti.org/ -> /admin
    if (url.pathname === '/') {
      url.pathname = `/${defaultLocale}/admin`;
      return NextResponse.rewrite(url);
    }
  }

  // No subdomain, just run intl middleware
  return intlMiddleware(request);
}

export const config = {
  // Exclude API routes, Next.js internals and static files
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
