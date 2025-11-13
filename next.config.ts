import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  ...(process.env.NODE_ENV === "development" && {
    basePath: "/proxy/3000",
  }),
  assetPrefix: "/proxy/3000",
};

export default nextConfig;
