import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@workspace/database', '@workspace/ui'],
};

export default nextConfig;
