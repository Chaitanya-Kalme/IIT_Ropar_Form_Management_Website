import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization - allow external images if needed
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
