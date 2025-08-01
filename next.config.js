/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/dbipbt0eh/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'teereserve.golf',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  serverExternalPackages: ['@prisma/client', 'prisma'],
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
  env: {
    CLOUDINARY_URL: 'cloudinary://233925611379148:dn-bm8tqqK3N9ZJB_RSStsX3U0Y@dbipbt0eh',
    CLOUDINARY_CLOUD_NAME: 'dbipbt0eh',
    CLOUDINARY_API_KEY: '233925611379148',
    CLOUDINARY_API_SECRET: 'dn-bm8tqqK3N9ZJB_RSStsX3U0Y',
  },
};

module.exports = nextConfig
