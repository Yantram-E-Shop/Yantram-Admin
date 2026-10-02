/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*", // Proxy requests from your frontend
        //destination: `${process.env.API_PROXY_TARGET || "https://api.yantramshop.in"}/api/v1/:path*`,
        destination: "http://localhost:5000/api/v1/:path*",      
      },
    ];
  },
};

export default nextConfig;
