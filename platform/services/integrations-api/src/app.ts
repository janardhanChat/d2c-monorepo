import { authFromEnv, createService } from "@ap/service-kit";
import type { MembershipResolver } from "@ap/tenant";

import type { Env } from "./env";
import { registerChannelRoutes } from "./modules/channels.routes";
import { registerPublishingRoutes } from "./modules/publishing.routes";
import type { Publisher } from "./publishers/publisher";

export interface AppDeps {
  env: Env;
  publisher: Publisher;
  resolveMembership: MembershipResolver;
}

export async function buildApp({ env, publisher, resolveMembership }: AppDeps) {
  const app = await createService({
    name: "integrations-api",
    logLevel: env.LOG_LEVEL,
    pretty: env.NODE_ENV === "development",
    corsOrigins: env.CORS_ORIGINS,
    auth: authFromEnv(env),
    resolveMembership,
  });

  registerChannelRoutes(app, publisher);
  registerPublishingRoutes(app, { publisher, internalToken: env.INTERNAL_SERVICE_TOKEN });

  return app;
}
