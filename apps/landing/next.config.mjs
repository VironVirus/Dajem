import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const appDirectory = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  outputFileTracingRoot: join(appDirectory, "../.."),
  transpilePackages: ["@repo/ui"],
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
