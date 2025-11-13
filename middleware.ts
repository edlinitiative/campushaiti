import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
});

export const config = {
  // Match only internationalized pathnames, exclude API routes
  matcher: [
    "/",
    "/(en|fr|ht)/:path*",
    "/((?!api|_next|_vercel|.*\\..*).*)"
  ],
};
