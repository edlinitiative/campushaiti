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

  // Skip middleware for static files only
  if (url.pathname.startsWith('/_next') ||
      url.pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2)$/)) {
    return NextResponse.next();
  }

  // For API routes on school subdomains, add the header but don't rewrite
  if (url.pathname.startsWith('/api') && subdomain && subdomain !== 'admin') {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-school-slug', subdomain);
    
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    response.headers.set('x-school-slug', subdomain);
    return response;
  }

  // Skip middleware for other API routes
  if (url.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // If this is a school subdomain, rewrite URLs to /schools/* routes
  if (subdomain && subdomain !== 'admin') {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-school-slug', subdomain);
    
    // Don't rewrite auth routes - use global auth
    if (url.pathname.startsWith('/auth') || url.pathname.startsWith('/en/auth') || url.pathname.startsWith('/fr/auth') || url.pathname.startsWith('/ht/auth')) {
      return intlMiddleware(request);
    }
    
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
    // Handle both /dashboard and /en/dashboard patterns
    let pathToRewrite = url.pathname;
    
    // Strip locale prefix if present
    for (const locale of locales) {
      if (url.pathname.startsWith(`/${locale}/`)) {
        pathToRewrite = url.pathname.substring(locale.length + 1); // Remove /en/ or /fr/ or /ht/
        break;
      }
    }
    
    // e.g., uc.campushaiti.org/ -> /en/schools/home (public page)
    const newPath = pathToRewrite === '/' || pathToRewrite === '' 
      ? `/${defaultLocale}/schools/home`
      : `/${defaultLocale}/schools${pathToRewrite}`;
    
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
  // Match all routes including API routes (needed for school subdomain header passing)
  // Only exclude Next.js internals and static files
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
