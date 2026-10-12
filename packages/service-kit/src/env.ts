import { z } from "zod";

/** Env vars every service understands. Extend with `baseEnvSchema.extend({...})`. */
export const baseEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().positive(),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:3000")
    .transform((v) => v.split(",").map((s) => s.trim())),
  SUPABASE_JWKS_URL: z.url().optional(),
  SUPABASE_JWT_SECRET: z.string().min(32).optional(),
  SUPABASE_JWT_ISSUER: z.string().optional(),
  /** Shared secret for service-to-service calls on /internal routes. */
  INTERNAL_SERVICE_TOKEN: z.string().min(16).optional(),
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;

/** Validate process.env once at boot; crash fast with a readable message. */
export function loadEnv<S extends z.ZodType>(schema: S, source = process.env): z.infer<S> {
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    console.error("Invalid environment variables:\n" + z.prettifyError(parsed.error));
    process.exit(1);
  }
  return parsed.data;
}
