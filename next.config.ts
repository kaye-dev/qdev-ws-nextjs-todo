import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/proxy/3000',
        destination: '/',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
