import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@cern-x/sim-core', '@cern-x/content-schema'],
  reactStrictMode: true,
  poweredByHeader: false,
  ...(process.env.NEXT_STANDALONE === '1' ? { output: 'standalone' } : {}),
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
  webpack: (config) => {
    config.resolve.alias['@cern-x/sim-core'] = path.resolve(__dirname, '../../packages/sim-core/dist/index.js');
    config.resolve.alias['@cern-x/content-schema'] = path.resolve(__dirname, '../../packages/content-schema/dist/index.js');
    return config;
  },
};

export default nextConfig;
