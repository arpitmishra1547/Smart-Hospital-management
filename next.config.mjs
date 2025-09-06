/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow all hosts for Replit environment
  allowedDevOrigins: [
    'ba63cac1-cf2b-4a44-a730-cd944135ac92-00-2gnkqlhqumz1b.pike.replit.dev',
    '127.0.0.1',
    'localhost'
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
        ],
      },
    ];
  },
};

export default nextConfig;
