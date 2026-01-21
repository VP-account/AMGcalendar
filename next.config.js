/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ЗМІНИ ЦЕ: видали "export" якщо використовуєш API routes
  // output: "export", // ❌ НЕПРАВИЛЬНО для API
  output: "standalone", // ✅ ПРАВИЛЬНО для Vercel з API
  
  images: {
    unoptimized: true,
  },
  
  // Додай ці налаштування для Prisma
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },
  
  // Ти можеш залишити ці налаштування для швидкого білду
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
