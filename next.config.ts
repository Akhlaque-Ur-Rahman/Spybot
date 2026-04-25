import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Isolated per dev port so a second `pnpm dev` can bind elsewhere without Next 16 distDir lock conflicts.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  async redirects() {
    return [
      { source: "/industries/death-proposal", destination: "/death-proposal", permanent: true },
      { source: "/industries/death-claim", destination: "/death-claim", permanent: true },
    ];
  },
};

export default nextConfig;
