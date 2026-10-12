import { baseEnvSchema, loadEnv } from "@ap/service-kit";
import { z } from "zod";

export const envSchema = baseEnvSchema.extend({
  PORT: z.coerce.number().int().positive().default(4100),
  CORE_API_URL: z.url().default("http://localhost:4000"),
  INTEGRATIONS_API_URL: z.url().default("http://localhost:4010"),
  DATABASE_URL: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;
export const loadSocialEnv = () => loadEnv(envSchema);
