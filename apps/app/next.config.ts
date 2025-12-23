import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  transpilePackages: ["@simplist/ui", "@simplist/limits"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.simplist.blog" },
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "www.google.com" },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
