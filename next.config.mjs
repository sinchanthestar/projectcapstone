/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Ensure Turbopack (Next dev) uses the project root when multiple lockfiles exist
  turbopack: {
    root: './',
  },
}

export default nextConfig
