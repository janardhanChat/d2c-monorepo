import { authFromEnv, createService } from "@ap/service-kit";
import type { MembershipResolver } from "@ap/tenant";

import type { Env } from "./env";
import type { PostsRepo } from "./modules/posts/posts.repo";
import { registerPostRoutes } from "./modules/posts/posts.routes";
import { createPostsService } from "./modules/posts/posts.service";
import type { PublishClient } from "./modules/posts/publisher.client";

export interface AppDeps {
  env: Env;
  postsRepo: PostsRepo;
  publisher: PublishClient;
  resolveMembership: MembershipResolver;
}

export async function buildApp(deps: AppDeps) {
  const app = await createService({
    name: "social-api",
    logLevel: deps.env.LOG_LEVEL,
    pretty: deps.env.NODE_ENV === "development",
    corsOrigins: deps.env.CORS_ORIGINS,
    auth: authFromEnv(deps.env),
    resolveMembership: deps.resolveMembership,
  });

  registerPostRoutes(app, createPostsService({ repo: deps.postsRepo, publisher: deps.publisher }));

  return app;
}
