import type { NextConfig } from "next";
const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin({});

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    unoptimized: true, // ถ้า export แบบไฟล์ล้วนก็พร้อม
    remotePatterns: [],
  },
};

export default withNextIntl(nextConfig);
