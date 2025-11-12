import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  basePath: "/proxy/3000",
  assetPrefix: "/proxy/3000",
};

export default nextConfig;
