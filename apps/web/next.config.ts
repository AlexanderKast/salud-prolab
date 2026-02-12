import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@salud-prolab/database", "@salud-prolab/shared"],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
      },
    ],
  },
};

export default nextConfig;
