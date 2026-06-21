import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: false,
  experimental: {
    largePageDataBytes: 50 * 1024 * 1024,
  },
  // Transpile PSV packages supaya di-bundle bersama
  transpilePackages: [
    "@photo-sphere-viewer/core",
    "@photo-sphere-viewer/gallery-plugin",
    "@photo-sphere-viewer/autorotate-plugin",
    "three",
  ],
  // Pakai webpack (bukan turbopack) supaya resolveAlias benar-benar
  // meng-unify semua `import 'three'` ke file module yang sama persis.
  // Turbopack di Next 16 punya bug resolveAlias yang menyebabkan
  // three.js ter-bundle dua kali → PSV throw "Multiple instances".
  webpack: (config) => {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Map semua `import 'three'` ke entry package utama,
      // sehingga PSV core + plugin berbagi instance three yang sama.
      three: "three",
    }
    return config
  },
};

export default nextConfig;
