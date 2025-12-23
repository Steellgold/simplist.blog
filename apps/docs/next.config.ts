import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  transpilePackages: ["@simplist/ui"],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withBundleAnalyzer(nextConfig);
