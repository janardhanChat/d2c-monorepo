import { createPostizClient } from "@ap/connector-postiz";
import { startService } from "@ap/service-kit";
import { createHttpMembershipResolver } from "@ap/tenant";

import { buildApp } from "./app";
import { loadIntegrationsEnv } from "./env";
import { createInMemoryBrandMappingRepo } from "./publishers/brand-mapping";
import { createPostizPublisher } from "./publishers/postiz.publisher";

const env = loadIntegrationsEnv();

const publisher = createPostizPublisher(
  createPostizClient({ baseUrl: env.POSTIZ_URL, apiKey: env.POSTIZ_API_KEY ?? "" }),
  createInMemoryBrandMappingRepo(),
);

const resolveMembership = createHttpMembershipResolver({
  coreApiUrl: env.CORE_API_URL,
  internalToken: env.INTERNAL_SERVICE_TOKEN ?? "",
});

const app = await buildApp({ env, publisher, resolveMembership });
if (!env.POSTIZ_API_KEY) app.log.warn("POSTIZ_API_KEY not set - publishing calls will fail");

await startService(app, env.PORT, env.HOST);
