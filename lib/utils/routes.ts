/*
 * Smart routing helpers that adapt to subdomain context
 * - On school subdomain: /dashboard (not /schools/dashboard)
 * - On admin subdomain: /dashboard (not /admin/dashboard)
 * - On main domain: Full paths (/schools/dashboard, /admin)
 */

import { getSubdomain } from './subdomain';

/**
 * Get the appropriate route based on current subdomain context
 * Client-side only (uses window.location)
 */
export function getSchoolRoute(path: string = '/dashboard'): string {
  if (typeof window === 'undefined') {
    // Server-side: return full path
    return `/schools${path}`;
  }

  const subdomain = getSubdomain(window.location.hostname);
  
  if (subdomain && subdomain !== 'admin') {
    // On school subdomain: use root-relative paths
    return path;
  }
  
  // On main domain: use full /schools prefix
  return `/schools${path}`;
}

/**
 * Get the appropriate admin route based on current subdomain context
 * Client-side only (uses window.location)
 */
export function getAdminRoute(path: string = ''): string {
  if (typeof window === 'undefined') {
    // Server-side: return full path
    return `/admin${path}`;
  }

  const subdomain = getSubdomain(window.location.hostname);
  
  if (subdomain === 'admin') {
    // On admin subdomain: use root-relative paths
    return path || '/';
  }
  
  // On main domain: use full /admin prefix
  return `/admin${path}`;
}

/**
 * Check if we're currently on a school subdomain
 */
export function isOnSchoolSubdomain(): boolean {
  if (typeof window === 'undefined') return false;
  
  const subdomain = getSubdomain(window.location.hostname);
  return subdomain !== null && subdomain !== 'admin';
}

/**
 * Check if we're currently on the admin subdomain
 */
export function isOnAdminSubdomain(): boolean {
  if (typeof window === 'undefined') return false;
  
  const subdomain = getSubdomain(window.location.hostname);
  return subdomain === 'admin';
}

/**
 * Check if we're on the main domain (no subdomain or www)
 */
export function isOnMainDomain(): boolean {
  if (typeof window === 'undefined') return true;
  
  const subdomain = getSubdomain(window.location.hostname);
  return subdomain === null;
}
