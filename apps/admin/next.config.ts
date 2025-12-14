import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@al-ramy/database',
    '@al-ramy/server',
    '@al-ramy/types',
    '@al-ramy/ui',
    '@al-ramy/shadcn',
    '@al-ramy/hooks',
  ],
};

export default nextConfig;
