import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Desabilitar para evitar double-rendering em dev
  experimental: {
    optimizePackageImports: ['@/components', '@/lib']
  },
  // Configuração para melhor SSR
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  }
};

export default nextConfig;
