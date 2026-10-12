import type { PostizHttp } from "../client/http";

/** Postiz provider identifiers we support at launch (extend as needed). */
export type PostizProvider =
  | "instagram"
  | "instagram-standalone"
  | "facebook"
  | "linkedin"
  | "linkedin-page"
  | "youtube"
  | "x"
  | "threads"
  | "pinterest";

/**
 * GET /social/{integration}  -> { url }
 * Returns the platform OAuth URL; redirect the brand owner there.
 * Pass `refreshIntegrationId` to re-authorize an existing channel instead of adding one.
 */
export async function getConnectUrl(
  http: PostizHttp,
  provider: PostizProvider,
  refreshIntegrationId?: string,
): Promise<string> {
  const res = await http.request<{ url: string }>("GET", `/social/${provider}`, {
    query: { refresh: refreshIntegrationId },
  });
  return res.url;
}

/** GET /is-connected -> verifies the API key works (used by the readiness probe). */
export async function isApiKeyValid(http: PostizHttp): Promise<boolean> {
  try {
    await http.request("GET", "/is-connected");
    return true;
  } catch {
    return false;
  }
}
