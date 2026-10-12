import { timingSafeEqual } from "node:crypto";

import type { FastifyReply, FastifyRequest } from "fastify";

/** onRequest hook for /internal routes: only other platform services (with the shared token) may call. */
export function requireInternalToken(expected: string | undefined) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const got = req.headers["x-internal-token"];
    const ok =
      !!expected &&
      typeof got === "string" &&
      got.length === expected.length &&
      timingSafeEqual(Buffer.from(got), Buffer.from(expected));
    if (!ok) await reply.code(401).send({ error: "Unauthorized", message: "internal only" });
  };
}
