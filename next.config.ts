import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true
  },
  transpilePackages: ["@simplist/db", "pg"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.simplist.blog" },
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" }
    ],
  }
}

const withMDX = createMDX();
export default withMDX(nextConfig);