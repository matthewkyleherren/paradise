// next.config.ts
import type { NextConfig } from "next";
import type { Configuration } from "webpack";

const nextConfig: NextConfig = {
  // The dev server is reached over the box's public hostname, not just localhost.
  allowedDevOrigins: ["escrtd.com", "*.escrtd.com", "217.69.0.234"],
  turbopack: {
    rules: {
      '*.glsl': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      '*.vert': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
      '*.frag': {
        loaders: ['raw-loader'],
        as: '*.js',
      },
    },
  },
  webpack(config: Configuration) {
    config.module?.rules?.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: 'raw-loader',
    });
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
};

export default nextConfig;