import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Isolated per dev port so a second `pnpm dev` can bind elsewhere without Next 16 distDir lock conflicts.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
};

export default nextConfig;
