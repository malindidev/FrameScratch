import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/github",
        destination: "https://github.com/malindidev/FrameScratch",
        permanent: false,
      },
      {
        source: "/repo",
        destination: "https://github.com/malindidev/FrameScratch",
        permanent: false,
      },
      {
        source: "/policy",
        destination: "/privacy",
        permanent: true,
      },
      {
        source: "/tos",
        destination: "/terms",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
