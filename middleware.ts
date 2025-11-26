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

  // Skip middleware for API routes and static files
  if (url.pathname.startsWith('/api') || 
      url.pathname.startsWith('/_next') ||
      url.pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2)$/)) {
    return NextResponse.next();
  }

  // If this is a school subdomain, rewrite URLs to /schools/* routes
  if (subdomain && subdomain !== 'admin') {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-school-slug', subdomain);
    
    // Don't rewrite if already on /schools path
    if (url.pathname.startsWith('/schools') || url.pathname.startsWith('/en/schools') || url.pathname.startsWith('/fr/schools') || url.pathname.startsWith('/ht/schools')) {
      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
      response.headers.set('x-school-slug', subdomain);
      return response;
    }
    
    // Rewrite to /en/schools/* (default locale)
    // e.g., uc.campushaiti.org/dashboard -> /en/schools/dashboard
    const newPath = url.pathname === '/' || url.pathname === '' 
      ? `/${defaultLocale}/schools/dashboard`
      : `/${defaultLocale}/schools${url.pathname}`;
    
    url.pathname = newPath;
    
    const response = NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      },
    });
    
    response.headers.set('x-school-slug', subdomain);
    return response;
  }
  
  // If this is admin subdomain, rewrite URLs to /admin/* routes
  if (subdomain === 'admin') {
    // Don't rewrite if already on /admin path
    if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/en/admin') || url.pathname.startsWith('/fr/admin') || url.pathname.startsWith('/ht/admin')) {
      return NextResponse.next();
    }
    
    // Rewrite to /en/admin/*
    const newPath = url.pathname === '/' || url.pathname === '' 
      ? `/${defaultLocale}/admin`
      : `/${defaultLocale}/admin${url.pathname}`;
    
    url.pathname = newPath;
    return NextResponse.rewrite(url);
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
