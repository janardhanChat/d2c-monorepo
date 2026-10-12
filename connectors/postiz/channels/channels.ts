import type { PostizHttp } from "../client/http";

/** Postiz calls a connected social account an "integration" (UI: "channel"). */
export interface PostizIntegration {
  id: string;
  name: string;
  identifier: string;
  picture: string;
  disabled: boolean;
  profile: string;
  customer?: { id: string; name: string } | null;
}

/** GET /integrations?group=<customerId> */
export function listIntegrations(http: PostizHttp, customerId?: string) {
  return http.request<PostizIntegration[]>("GET", "/integrations", {
    query: { group: customerId },
  });
}

/** DELETE /integrations/{id} - also deletes that channel's scheduled posts. */
export function deleteIntegration(http: PostizHttp, integrationId: string) {
  return http.request<void>("DELETE", `/integrations/${integrationId}`);
}
