import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: '/ws',
  assetPrefix: '/proxy/3000',
};

export default nextConfig;
