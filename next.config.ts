import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow tonal ESM modules
  transpilePackages: ["tonal", "@tonaljs/chord-detect"],
};

export default nextConfig;
