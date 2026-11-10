/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // The frontend always calls /api/x/ with a trailing slash; keep it instead of
  // redirecting to /api/x (the API in server/ answers both).
  skipTrailingSlashRedirect: true,
  compress: true,
  reactStrictMode: true,
  experimental: {
    // tree-shake icon/animation barrels instead of shipping the whole package
    optimizePackageImports: ['lucide-react'],
  },
  // The Node API is its own service (server/, port 4000). The browser keeps
  // talking to this origin and Next forwards the request, so there is no CORS
  // or hard-coded host anywhere in the frontend.
  async rewrites() {
    const api = process.env.API_ORIGIN || 'http://127.0.0.1:4000';
    return [
      { source: '/api/:path*', destination: `${api}/api/:path*` },
      { source: '/api', destination: `${api}/api` },
      { source: '/uploads/:path*', destination: `${api}/uploads/:path*` },
    ];
  },
  images: {
    // smallest modern format first, and cache the optimiser output for a year
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    deviceSizes: [360, 420, 640, 768, 1024, 1280, 1536, 1920],
    // Staff and student photos live on imgbb (imgdb), which is what the
    // dashboard uploads to; the rest are common hosts the school may paste in.
    // Anything not listed here is rendered as a plain <img> by SafeImage
    // instead of crashing the page.
    remotePatterns: [
      { protocol: 'https', hostname: '**.ibb.co' },
      { protocol: 'https', hostname: 'ibb.co' },
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
    ],
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
