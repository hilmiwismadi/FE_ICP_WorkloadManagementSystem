/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['img.icons8.com', "utfs.io", "be-icpworkloadmanagementsystem.up.railway.app"],
  },
  // Remove experimental features that might cause issues
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          }
        ],
      },
    ];
  }
};

module.exports = nextConfig;