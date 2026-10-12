import { randomUUID } from "node:crypto";

import { authPlugin, type VerifierOptions } from "@ap/auth";
import { tenantPlugin, type MembershipResolver } from "@ap/tenant";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import sensible from "@fastify/sensible";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify, { type FastifyError } from "fastify";
import {
  hasZodFastifySchemaValidationErrors,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";

export interface CreateServiceOptions {
  name: string;
  version?: string;
  logLevel?: string;
  pretty?: boolean;
  corsOrigins?: string[];
  /** Requests per minute per IP. 0 disables rate limiting. */
  rateLimitPerMinute?: number;
  /** Serve OpenAPI docs at /docs (default: on outside production). */
  docs?: boolean;
  /** Omit to run a service without auth (e.g. an internal worker). */
  auth?: VerifierOptions;
  /** Required when auth is set and the service has tenant-scoped routes. */
  resolveMembership?: MembershipResolver;
}

/**
 * Builds a Fastify instance with the platform's defaults.
 * Every Node service should start from here so they all behave the same:
 * same logs, same error shape, same health endpoints, same auth.
 */
export async function createService(opts: CreateServiceOptions) {
  const app = Fastify({
    logger: {
      level: opts.logLevel ?? "info",
      redact: ["req.headers.authorization", "req.headers.cookie", "*.accessToken", "*.token"],
      ...(opts.pretty ? { transport: { target: "pino-pretty" } } : {}),
    },
    genReqId: (req) => (req.headers["x-request-id"] as string | undefined) ?? randomUUID(),
    requestIdHeader: "x-request-id",
    disableRequestLogging: false,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(sensible);
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, { origin: opts.corsOrigins ?? true, credentials: true });
  if ((opts.rateLimitPerMinute ?? 300) > 0) {
    await app.register(rateLimit, { max: opts.rateLimitPerMinute ?? 300, timeWindow: "1 minute" });
  }

  if (opts.docs ?? process.env.NODE_ENV !== "production") {
    await app.register(swagger, {
      openapi: {
        info: { title: opts.name, version: opts.version ?? "0.0.0" },
        components: {
          securitySchemes: { bearer: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
        },
      },
      transform: jsonSchemaTransform,
    });
    await app.register(swaggerUi, { routePrefix: "/docs" });
  }

  if (opts.auth) {
    await app.register(authPlugin, opts.auth);
    if (opts.resolveMembership) {
      await app.register(tenantPlugin, { resolveMembership: opts.resolveMembership });
    }
  } else {
    // No auth configured: protected routes still register, but always answer 401.
    app.log.warn("auth not configured - protected routes will reject every request");
    app.decorateRequest("user", null);
    app.decorateRequest("tenant", null);
    const deny = async (
      _req: unknown,
      reply: { code: (n: number) => { send: (b: unknown) => unknown } },
    ) => {
      await reply.code(401).send({ error: "Unauthorized", message: "Auth is not configured" });
    };
    app.decorate("authenticate", deny);
    app.decorate("requireTenant", () => deny);
  }

  // One error shape across every service: { error, message, details? }
  app.setErrorHandler((err: FastifyError, req, reply) => {
    if (hasZodFastifySchemaValidationErrors(err)) {
      return reply.code(400).send({
        error: "ValidationError",
        message: "Request validation failed",
        details: err.validation,
      });
    }
    const status = err.statusCode ?? 500;
    if (status >= 500) req.log.error({ err }, "unhandled error");
    return reply.code(status).send({
      error: err.name ?? "Error",
      message: status >= 500 ? "Internal Server Error" : err.message,
    });
  });

  app.get("/health", { schema: { hide: true } }, async () => ({
    status: "ok",
    service: opts.name,
  }));
  app.get("/ready", { schema: { hide: true } }, async () => ({ status: "ready" }));

  return app;
}

export type Service = Awaited<ReturnType<typeof createService>>;

/** Listen + graceful shutdown on SIGINT/SIGTERM (Docker / k8s friendly). */
export async function startService(app: Service, port: number, host = "0.0.0.0") {
  const shutdown = async (signal: string) => {
    app.log.info({ signal }, "shutting down");
    await app.close();
    process.exit(0);
  };
  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));

  try {
    await app.listen({ port, host });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}
