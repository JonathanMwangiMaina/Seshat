/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Explicitly disable App Router experimental features
  experimental: {},
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Suppress webpack warnings for optional dependencies
  webpack: (config, { isServer }) => {
    // Ignore OpenTelemetry optional dependencies
    config.ignoreWarnings = [
      { module: /node_modules\/@opentelemetry\/sdk-node/ },
      { module: /node_modules\/handlebars/ },
    ];

    return config;
  },
  turbopack: {},
};

module.exports = nextConfig;