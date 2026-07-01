import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: blob: https:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' https:; " +
      "frame-src 'self' https:; " +
      "frame-ancestors 'self'; " +
      "base-uri 'self'; " +
      "form-action 'self'; " +
      "object-src 'none';",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
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
