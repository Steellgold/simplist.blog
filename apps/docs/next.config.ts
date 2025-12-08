import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@simplist/ui"],
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig;