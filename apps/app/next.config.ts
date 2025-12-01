import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
    serverActions: {
      bodySizeLimit: "10mb"
    }
  },
  transpilePackages: ["@simplist/ui", "@simplist/limits"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.simplist.blog" },
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" }
    ],
  }
}

export default nextConfig;
