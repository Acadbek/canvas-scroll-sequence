/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp'],
  },
  compress: true,
  swcMinify: true,
  experimental: {
    optimizeCss: true,
  },
};

module.exports = nextConfig;
