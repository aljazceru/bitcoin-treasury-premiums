/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: false,
  webpack: (config, { isServer }) => {
    // Handle node modules that need to be excluded from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        sqlite3: false,
        puppeteer: false,
        child_process: false,
        'node-cron': false,
        winston: false,
        cheerio: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;