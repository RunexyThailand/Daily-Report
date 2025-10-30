import type { NextConfig } from "next";

const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin({});
const nextConfig: NextConfig = {
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
};

export default withNextIntl(nextConfig);
