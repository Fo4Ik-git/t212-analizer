import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: "build",
  output: "export",
  basePath: process.env.NODE_ENV === "production" ? "/t212-analizer" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
