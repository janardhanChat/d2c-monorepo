import { startService } from "@ap/service-kit";
import postgres from "postgres";

import { buildApp } from "./app";
import { loadCoreEnv } from "./env";
import {
  createInMemoryOrganizationsRepo,
  createPgOrganizationsRepo,
} from "./modules/organizations";

const env = loadCoreEnv();

const organizationsRepo = env.DATABASE_URL
  ? createPgOrganizationsRepo(postgres(env.DATABASE_URL, { max: 10 }))
  : createInMemoryOrganizationsRepo();

const app = await buildApp({ env, organizationsRepo });
if (!env.DATABASE_URL) app.log.warn("DATABASE_URL not set - using in-memory repository");

await startService(app, env.PORT, env.HOST);
