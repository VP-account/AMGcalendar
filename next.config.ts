import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",  // ← обовʼязково для static export
};

export default nextConfig;
