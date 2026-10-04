import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets phones/laptops on the same Wi-Fi use the dev server (http://192.168.1.17:3100).
  // Dev-only: production builds ignore this.
  allowedDevOrigins: ["192.168.1.17"],
};

export default nextConfig;
