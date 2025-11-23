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

  // If this is a school subdomain, add it to headers for API routes to use
  if (subdomain) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-school-slug', subdomain);
    
    // Run intl middleware with modified headers
    const response = intlMiddleware(request);
    
    // Clone response and add school slug header
    const modifiedResponse = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    
    // Copy cookies and other headers from intl middleware
    if (response) {
      response.cookies.getAll().forEach(cookie => {
        modifiedResponse.cookies.set(cookie);
      });
    }
    
    // Set the school slug header in the response too
    modifiedResponse.headers.set('x-school-slug', subdomain);
    
    return modifiedResponse;
  }

  // No subdomain, just run intl middleware
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames, exclude API routes
  matcher: [
    "/",
    "/(en|fr|ht)/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)"
  ],
};
