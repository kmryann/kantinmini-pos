import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  devIndicators: false,
  serverExternalPackages: ["@electric-sql/pglite", "midtrans-client"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
