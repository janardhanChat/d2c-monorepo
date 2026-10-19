import { baseEnvSchema, loadEnv } from "@ap/service-kit";
import { z } from "zod";

export const envSchema = baseEnvSchema.extend({
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().optional(),
  ),
});

export type Env = z.infer<typeof envSchema>;

export const loadCoreEnv = () => loadEnv(envSchema);
