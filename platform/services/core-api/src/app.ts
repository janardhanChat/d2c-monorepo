import { authFromEnv, createService } from "@ap/service-kit";

import type { Env } from "./env";
import { registerInternalRoutes } from "./modules/internal/internal.routes";
import {
  createOrganizationsService,
  registerOrganizationRoutes,
  type OrganizationsRepo,
} from "./modules/organizations";

export interface AppDeps {
  env: Env;
  organizationsRepo: OrganizationsRepo;
}

/** Pure app factory: no ports, no process listeners. main.ts wires it up; tests inject it. */
export async function buildApp({ env, organizationsRepo }: AppDeps) {
  const app = await createService({
    name: "core-api",
    logLevel: env.LOG_LEVEL,
    pretty: env.NODE_ENV === "development",
    corsOrigins: env.CORS_ORIGINS,
    auth: authFromEnv(env),
    resolveMembership: ({ userId, organizationId, brandId }) =>
      organizationsRepo.getRole(userId, organizationId, brandId),
  });

  // Modules: add one line per module.
  registerOrganizationRoutes(app, createOrganizationsService(organizationsRepo));
  registerInternalRoutes(app, {
    repo: organizationsRepo,
    internalToken: env.INTERNAL_SERVICE_TOKEN,
  });

  return app;
}
