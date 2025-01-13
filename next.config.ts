/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['img.icons8.com', 'utfs.io'],
  },
  // Add error handling for deployment
  onError: (err: Error) => {
    console.error('Next.js Error:', err);
  },
  // Add specific headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
  // Add build configuration
  experimental: {
    optimizeCss: true,
    modern: true,
  },
  poweredByHeader: false,
  generateEtags: false,
};

module.exports = nextConfig;
