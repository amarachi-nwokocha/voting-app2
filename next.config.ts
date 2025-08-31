/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/7for7",

  async redirects() {
    return [
      {
        source: "/7for7",
        destination: "/7for7/",
        permanent: true,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pvnqgwlmnmtvnhqmswjz.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
}

module.exports = nextConfig
