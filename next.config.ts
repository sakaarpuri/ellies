import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  // Avoid AppleDouble cache files on the external drive during local preview.
  // Production continues to use the host's image optimisation.
  images: { unoptimized: process.env.NODE_ENV === "development" },
  experimental: {
    turbopackFileSystemCacheForDev: false,
    turbopackFileSystemCacheForBuild: Boolean(process.env.NETLIFY),
  },
};

export default nextConfig;
