import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Genera .next/standalone: un server.js con solo las dependencias necesarias, para la imagen Docker.
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
