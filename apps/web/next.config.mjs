import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@cern-x/sim-core', '@cern-x/content-schema'],
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias['@cern-x/sim-core'] = path.resolve(__dirname, '../../packages/sim-core/dist/index.js');
    config.resolve.alias['@cern-x/content-schema'] = path.resolve(__dirname, '../../packages/content-schema/dist/index.js');
    return config;
  },
};

export default nextConfig;
