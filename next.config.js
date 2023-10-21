/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'image.tmdb.org',
            port: '',
            pathname: '/t/p/w500/*',
          },
          {
            protocol: 'https',
            hostname: 'www.hungrypaprikas.com',
            port: '',
            pathname: '/wp-content/uploads/**',
          },
          {
            protocol: 'https',
            hostname: 'www.skinnytaste.com',
            port: '',
            pathname: '/wp-content/uploads/**',
          },
          {
            protocol: 'https',
            hostname: 'www.restlesschipotle.com',
            port: '',
            pathname: '/wp-content/uploads/**',
          },
          {
            protocol: 'https',
            hostname: 'www.allrecipes.com',
            port: '',
            pathname: '/thmb/**',
          },
          {
            protocol: 'https',
            hostname: 'www.theclevercarrot.com',
            port: '',
            pathname: '/wp-content/uploads/**',
          },
          {
            protocol: 'https',
            hostname: 'platedcravings.com',
            port: '',
            pathname: '/wp-content/uploads/**',
          }
        ],
    }, 
};

module.exports = nextConfig;
