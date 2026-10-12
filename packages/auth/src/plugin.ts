import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

import { createTokenVerifier, extractBearer, type AuthUser, type VerifierOptions } from "./verify";

declare module "fastify" {
  interface FastifyRequest {
    user: AuthUser | null;
  }
  interface FastifyInstance {
    /** onRequest hook that rejects requests without a valid Supabase session */
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

/**
 * Decorates every request with `request.user` (or null) and exposes
 * `app.authenticate` to protect routes:
 *
 *   app.get("/v1/me", { onRequest: app.authenticate }, handler)
 */
const authPluginImpl: FastifyPluginAsync<VerifierOptions> = async (app, opts) => {
  const verify = createTokenVerifier(opts);

  app.decorateRequest("user", null);

  app.addHook("onRequest", async (req) => {
    const token = extractBearer(req.headers.authorization);
    if (!token) return;
    try {
      req.user = await verify(token);
    } catch {
      req.user = null;
    }
  });

  app.decorate("authenticate", async (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.user) {
      await reply.code(401).send({ error: "Unauthorized", message: "Valid session required" });
    }
  });
};

export const authPlugin = fp(authPluginImpl, { name: "@ap/auth", fastify: "5.x" });
