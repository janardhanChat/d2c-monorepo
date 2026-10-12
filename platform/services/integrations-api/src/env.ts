import { baseEnvSchema, loadEnv } from "@ap/service-kit";
import { z } from "zod";

export const envSchema = baseEnvSchema.extend({
  PORT: z.coerce.number().int().positive().default(4010),
  CORE_API_URL: z.url().default("http://localhost:4000"),
  POSTIZ_URL: z.url().default("http://localhost:5000/api/public/v1"),
  POSTIZ_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;
export const loadIntegrationsEnv = () => loadEnv(envSchema);
