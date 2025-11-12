import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Only run ESLint on these directories during production builds
    dirs: ['app', 'components', 'lib'],
  },
  typescript: {
    // Dangerously skip type checking during build (Vercel will handle it)
    ignoreBuildErrors: false,
  },
};

export default withNextIntl(nextConfig);
