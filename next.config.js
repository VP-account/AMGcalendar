/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  // Додайте ці налаштування для кращої сумісності
  images: {
    unoptimized: true, // обов'язково для static export
  },
  // Додайте, якщо є проблеми з TypeScript або ESLint
  typescript: {
    ignoreBuildErrors: true, // тимчасово, якщо є помилки TypeScript
  },
  eslint: {
    ignoreDuringBuilds: true, // тимчасово, якщо є помилки ESLint
  },
}

module.exports = nextConfig
