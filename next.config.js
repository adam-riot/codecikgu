/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable strict TypeScript checking
  typescript: {
    // Remove ignoreBuildErrors to catch type issues
    // ignoreBuildErrors: true,
  },
  eslint: {
    // Temporarily disable ESLint during build for deployment
    ignoreDuringBuilds: true,
  },
  // Performance optimizations
  experimental: {
    // Temporarily disable CSS optimization to fix build error
    // optimizeCss: true,
    optimizePackageImports: ['@monaco-editor/react', 'lucide-react'],
  },
  // Image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  // Bundle analyzer (optional)
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          monaco: {
            test: /[\\/]node_modules[\\/]@monaco-editor[\\/]/,
            name: 'monaco',
            chunks: 'all',
          },
        },
      }
    }
    return config
  },
}

module.exports = nextConfig

