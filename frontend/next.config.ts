import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export so the FastAPI backend can serve the built SPA from `out/`.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
