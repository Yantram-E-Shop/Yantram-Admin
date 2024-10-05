/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*", // Proxy requests from your frontend
        destination: "http://13.126.92.193:5000/api/v1/:path*", // Redirect them to your HTTP backend
      },
    ];
  },
};

export default nextConfig;
