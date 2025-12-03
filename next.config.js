/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/pos',
  experimental: {
    serverComponentsExternalPackages: ['sqlite3'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true, // Disable image optimization for all images by default
  },
}

module.exports = nextConfig