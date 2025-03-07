import { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
  experimental: {
    authInterrupts: true
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
  },
  images: {
    remotePatterns: [
      { hostname: "cdn.simplist.blog" }, // 😎😎😎
      { hostname: "avatars.githubusercontent.com" }
    ]
  }
}

export default nextConfig