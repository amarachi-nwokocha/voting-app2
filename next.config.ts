/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/7for7",
  trailingSlash: true, // ensures /7for7/ maps to app/page.tsx

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pvnqgwlmnmtvnhqmswjz.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  async redirects() {
    return [
      {
        source: "/7for7",      // anyone visiting /7for7 without a slash
        destination: "/7for7/", // gets redirected to /7for7/
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
