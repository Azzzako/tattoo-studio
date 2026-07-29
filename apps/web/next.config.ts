import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const basePath = isProd && process.env.GITHUB_PAGES === 'true' ? `/${repoName}` : '';

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: true,
  basePath,
  typedRoutes: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '8mb',
    },
  },
};

export default config;
