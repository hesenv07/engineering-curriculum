/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['jsx', 'js', 'ts', 'tsx'],
  i18n: {
    locales: ['az', 'en'],
    defaultLocale: 'az',
  },
};

module.exports = nextConfig;
