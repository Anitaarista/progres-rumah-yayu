import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export → deploy sebagai situs statis ke Vercel
  output: "export",
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Foto panorama cukup besar → naikkan batas ukuran追踪
  experimental: {
    // Allow large static assets
    largePageDataBytes: 50 * 1024 * 1024,
  },
};

export default nextConfig;
