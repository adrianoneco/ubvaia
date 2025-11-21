import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow cross-origin requests from local network during development
  allowedDevOrigins: [
    '192.168.3.39',
    '192.168.3.*',
    'localhost',
  ],
  
  devIndicators: false,  

  // Performance optimizations for faster startup
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  // Provide an explicit (possibly empty) turbopack config so Next.js
  // doesn't error when a custom webpack config is present.
  turbopack: {},
  
  // Faster refresh in development
  reactStrictMode: true,
  
  // Skip type checking during dev (use IDE for that)
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Optimize webpack for faster builds
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Faster builds in development
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
    }
    return config;
  },
};

export default nextConfig;
