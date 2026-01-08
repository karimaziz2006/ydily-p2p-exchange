/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  allowedDevOrigins: [
    '1b0aeb73-9d25-4a34-8e13-0274381f26c5-00-3pb7jhcuh1vra.janeway.replit.dev',
    '127.0.0.1',
    'localhost',
  ],
  experimental: {
    serverActions: {
      allowedOrigins: ['*'],
    },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
