/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // ВИБЕРІТЬ ОДИН З ВАРІАНТІВ:
  
  // Варіант 1: Для Vercel (з API routes)
  output: "standalone",
  
  // Варіант 2: Для GitHub Pages (статичний сайт БЕЗ API)
  // output: "export",
  
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Обов'язково для Prisma
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },
  
  // Опціонально для швидкого білду
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Для PWA
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
}

module.exports = nextConfig
