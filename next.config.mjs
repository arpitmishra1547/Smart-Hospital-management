/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow all hosts for Replit environment
  allowedDevOrigins: [
    '93734446-bbc7-47b5-b3ea-937224d6f17f-00-gnu9cg46usln.kirk.replit.dev',
    '127.0.0.1',
    'localhost',
    /.*\.replit\.dev$/
  ],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
