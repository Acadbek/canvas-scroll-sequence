/** @type {import('next').NextConfig} */
const nextConfig = {
  // Compression
  compress: true,

  // SWC minification
  swcMinify: true,

  // React strict mode o'chirish (double render oldini olish)
  reactStrictMode: false,

  // Image optimization
  images: {
    unoptimized: true,
    formats: ['image/webp'],
  },

  // Turbopack konfiguratsiyasi (Next.js 16+)
  turbopack: {},

  // Headers - cache uchun
  async headers() {
    return [
      {
        source: '/images/sequence-optimized/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
