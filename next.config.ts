import type { NextConfig } from "next";
import { createMDX } from 'fumadocs-mdx/next';

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.simplist.blog" },
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" }
    ],
  },
}

const withMDX = createMDX();
export default withMDX(nextConfig);