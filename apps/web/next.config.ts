import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const workspaceRoot = fileURLToPath(new URL("../..", import.meta.url));

const nextConfig: NextConfig = {
  // Self-contained server bundle for Docker (infra/docker/web.Dockerfile)
  output: "standalone",
  outputFileTracingRoot: workspaceRoot,
  turbopack: { root: workspaceRoot },
  // Workspace packages ship TypeScript source
  transpilePackages: [
    "@ap/ui",
    "@ap/product-kit",
    "@ap/platform-frontend",
    "@ap/social-frontend",
    "@ap/social-domain",
    "@ap/commerce-frontend",
    "@ap/crm-frontend",
    "@ap/fulfillment-frontend",
  ],
  poweredByHeader: false,
  async rewrites() {
    return [
      {
        source: "/api/core/:path*",
        destination: `${process.env.CORE_API_URL || "http://localhost:4000"}/:path*`,
      },
      {
        source: "/api/integrations/:path*",
        destination: `${process.env.INTEGRATIONS_API_URL || "http://localhost:4010"}/:path*`,
      },
      {
        source: "/api/social/:path*",
        destination: `${process.env.SOCIAL_API_URL || "http://localhost:4100"}/:path*`,
      },
      {
        source: "/api/ai/:path*",
        destination: `${process.env.AI_API_URL || "http://localhost:8000"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
