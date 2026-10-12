import { startService } from "@ap/service-kit";
import { createHttpMembershipResolver } from "@ap/tenant";

import { buildApp } from "./app";
import { loadSocialEnv } from "./env";
import { createInMemoryPostsRepo } from "./modules/posts/posts.repo";
import { createPublishClient } from "./modules/posts/publisher.client";

const env = loadSocialEnv();
const internalToken = env.INTERNAL_SERVICE_TOKEN ?? "";

const app = await buildApp({
  env,
  // TODO: swap for a Postgres repo on the "social" schema once DATABASE_URL is set.
  postsRepo: createInMemoryPostsRepo(),
  publisher: createPublishClient({ baseUrl: env.INTEGRATIONS_API_URL, internalToken }),
  resolveMembership: createHttpMembershipResolver({ coreApiUrl: env.CORE_API_URL, internalToken }),
});

await startService(app, env.PORT, env.HOST);
