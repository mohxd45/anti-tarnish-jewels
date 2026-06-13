import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "res.cloudinary.com" }
    ]
  },
  // Suppress the protobufjs critical dependency warning from Firebase
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent Firebase client SDK from being bundled in server context
      // Firebase client SDK uses browser APIs — it must only run client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    // Suppress the @protobufjs/inquire warning
    config.ignoreWarnings = [
      { module: /node_modules\/@protobufjs\/inquire/ },
    ];
    return config;
  }
};

export default nextConfig;
