/** @type {import('next').NextConfig} */
const nextConfig = {
  
  images: {
    unoptimized: true
  },
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript type checking during production builds
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig