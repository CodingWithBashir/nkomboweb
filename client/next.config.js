/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // The API lives at /api/** inside this app; keep the trailing slash the
  // frontend uses instead of redirecting /api/x/ -> /api/x.
  skipTrailingSlashRedirect: true,
  compress: true,
  reactStrictMode: true,
  experimental: {
    // tree-shake icon/animation barrels instead of shipping the whole package
    optimizePackageImports: ['lucide-react'],
    // better-sqlite3 ships a native binding; keep it out of the server bundle
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
  images: {
    // smallest modern format first, and cache the optimiser output for a year
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    deviceSizes: [360, 420, 640, 768, 1024, 1280, 1536, 1920],
  },
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
