import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** Cible du proxy /api/* (Moodle plugin, iframe unique base_url). */
const apiRewriteTarget = (
  process.env.XCCM_API_REWRITE_TARGET ??
  process.env.NEXT_PUBLIC_API_URL ??
  'https://xccm-2-api.vercel.app'
).replace(/\/$/, '');

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiRewriteTarget}/api/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
