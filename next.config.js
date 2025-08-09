// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable strict TypeScript checking for better security and code quality
  typescript: {
    // Remove ignoreBuildErrors to catch type issues
    // ignoreBuildErrors: true,
  },
  eslint: {
    // Temporarily disable ESLint during build for deployment
    ignoreDuringBuilds: true,
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value: (() => {
              const isProd = process.env.NODE_ENV === 'production'
              const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
              const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || ''

              const scriptSrc = isProd
                ? "'self'"
                : "'self' 'unsafe-eval' 'unsafe-inline'"

              const styleSrc = "'self' 'unsafe-inline'"
              const imgSrc = "'self' data: https:"
              const fontSrc = "'self' data:"
              const workerSrc = "'self' blob:"
              const connectSrcParts = ["'self'", 'https:', 'wss:']
              if (supaUrl) connectSrcParts.push(supaUrl)
              if (wsUrl) connectSrcParts.push(wsUrl)
              const connectSrc = connectSrcParts.join(' ')

              const base = [
                `default-src 'self'`,
                `script-src ${scriptSrc}`,
                `style-src ${styleSrc}`,
                `img-src ${imgSrc}`,
                `font-src ${fontSrc}`,
                `connect-src ${connectSrc}`,
                `worker-src ${workerSrc}`,
                `frame-src 'self'`,
                `object-src 'none'`
              ]
              if (isProd) base.push('upgrade-insecure-requests')
              return base.join('; ')
            })(),
          },
        ],
      },
    ]
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

