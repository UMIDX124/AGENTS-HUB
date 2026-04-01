/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
    outputFileTracingIncludes: {
      "/*": ["./prisma/dev.db"],
    },
  },
};

export default nextConfig;
