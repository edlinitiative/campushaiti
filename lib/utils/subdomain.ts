/*
 * Subdomain utilities for multi-tenant school portals
 * Each school gets their own subdomain: quisqueya.campushaiti.org
 */

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'campushaiti.org';
const RESERVED_SUBDOMAINS = ['www', 'admin', 'api', 'app', 'staging', 'dev', 'test', 'campushaiti'];

/**
 * Extract subdomain from hostname
 * Examples:
 *   quisqueya.campushaiti.org -> quisqueya
 *   www.campushaiti.org -> null
 *   localhost -> null
 *   quisqueya.campushaiti.vercel.app -> quisqueya (Vercel preview)
 */
export function getSubdomain(hostname: string): string | null {
  // Handle localhost
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return null;
  }

  // Remove port if present
  const host = hostname.split(':')[0];
  
  // Split by dots
  const parts = host.split('.');
  
  // For Vercel domains (e.g., quisqueya.campushaiti.vercel.app)
  // We need at least 4 parts: subdomain.project.vercel.app
  // Special case: project.vercel.app (3 parts) = no subdomain
  if (parts[parts.length - 2] === 'vercel' && parts[parts.length - 1] === 'app') {
    if (parts.length === 3) {
      // Just project.vercel.app - no school subdomain
      return null;
    }
    if (parts.length >= 4) {
      const subdomain = parts[0];
      // Check if it's a reserved subdomain
      if (RESERVED_SUBDOMAINS.includes(subdomain)) {
        return null;
      }
      return subdomain;
    }
  }
  
  // Custom domain pattern: subdomain.domain.tld (3 parts minimum)
  if (parts.length >= 3) {
    const subdomain = parts[0];
    // Check if it's a reserved subdomain
    if (RESERVED_SUBDOMAINS.includes(subdomain)) {
      return null;
    }
    return subdomain;
  }

  return null;
}

/**
 * Check if a hostname is a school subdomain
 */
export function isSchoolSubdomain(hostname: string): boolean {
  return getSubdomain(hostname) !== null;
}

/**
 * Get the school subdomain URL for a given slug
 */
export function getSchoolSubdomainUrl(slug: string, path: string = ''): string {
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'campushaiti.org';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${protocol}://${slug}.${domain}${cleanPath}`;
}

/**
 * Get the main platform URL
 */
export function getMainPlatformUrl(path: string = ''): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000' + path;
}

/**
 * Extract school slug from request headers (set by middleware)
 */
export function getSchoolSlugFromHeaders(headers: Headers): string | null {
  return headers.get('x-school-slug');
}

/**
 * Validate school slug format (alphanumeric, hyphens, lowercase)
 */
export function isValidSchoolSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
