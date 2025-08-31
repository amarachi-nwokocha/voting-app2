/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/7for7', // 👈 this is the key fix

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
