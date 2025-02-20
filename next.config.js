/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/twol' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/twol' : '',
  trailingSlash: true,
};

module.exports = nextConfig; 