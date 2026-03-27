import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization - allow external images if needed
  images: {
    remotePatterns: [],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3001/api/:path*", // Proxy to backend API
      },
    ];
  }
};

export default nextConfig;
