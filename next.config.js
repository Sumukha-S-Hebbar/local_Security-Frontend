
/** @type {import('next').NextConfig} */
const nextConfig = {
 
  basePath: '/security',
  trailingSlash: true,  // match Apache's rewrite
 
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
       {
        protocol: 'http',
        hostname: 'are.towerbuddy.tel',
        port: '8000',
      },
      {
        protocol: 'http',
        hostname: 'ind.localhost',
        port: '8000',
      },
    ],
  },
};
 
module.exports = nextConfig;
