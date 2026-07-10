import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this repo so Next.js doesn't pick up the stray
  // lockfile in the home directory (~/package-lock.json) as the root.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
