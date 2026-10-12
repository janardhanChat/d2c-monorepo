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
};

export default nextConfig;
