/** @type {import('next').NextConfig} */
const nextConfig = {

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ajredtnhkxtyqtmmqavc.supabase.co",
      },
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
