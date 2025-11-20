import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignore ESLint errors during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Dangerously skip type checking during build (Vercel will handle it)
    ignoreBuildErrors: false,
  },
  experimental: {
    // Skip collecting page data for API routes
    isrFlushToDisk: false,
  },
};

export default withNextIntl(nextConfig);
