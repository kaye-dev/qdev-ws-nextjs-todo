import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // code-server で開発する際に必要な設定対応
  assetPrefix: '/proxy/3000',
};

export default nextConfig;
