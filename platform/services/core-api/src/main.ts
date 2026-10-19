import { startService } from "@ap/service-kit";
import postgres from "postgres";

import { buildApp } from "./app";
import { loadCoreEnv } from "./env";
import {
  createInMemoryOrganizationsRepo,
  createPgOrganizationsRepo,
} from "./modules/organizations";

const env = loadCoreEnv();

const sql = env.DATABASE_URL ? postgres(env.DATABASE_URL, { max: 10 }) : null;

const organizationsRepo = sql ? createPgOrganizationsRepo(sql) : createInMemoryOrganizationsRepo();

const app = await buildApp({ env, organizationsRepo });
if (!env.DATABASE_URL) app.log.warn("DATABASE_URL not set - using in-memory repository");

await startService(app, env.PORT, env.HOST);
