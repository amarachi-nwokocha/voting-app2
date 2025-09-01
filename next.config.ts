/** @type {import('next').NextConfig} */
const nextConfig = {
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

 
};

module.exports = nextConfig;
