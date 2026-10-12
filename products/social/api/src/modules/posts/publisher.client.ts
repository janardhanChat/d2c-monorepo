/**
 * HTTP client for integrations-api. The social product never imports connector code;
 * it asks the platform to publish (enforced by the Nx module-boundary lint rule).
 */
export interface PublishClient {
  publish(input: {
    organizationId: string;
    brandId: string;
    channelIds: string[];
    caption: string;
    mediaUrls: string[];
    scheduledAt?: string;
    providerSettings?: Record<string, Record<string, unknown>>;
  }): Promise<{ publisher: string; results: Array<{ channelId: string; externalPostId: string }> }>;
}

export function createPublishClient(opts: {
  baseUrl: string;
  internalToken: string;
}): PublishClient {
  return {
    async publish(input) {
      const res = await fetch(`${opts.baseUrl}/internal/v1/publish`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-internal-token": opts.internalToken },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(60_000),
      });
      if (!res.ok)
        throw new Error(`integrations-api publish failed: ${res.status} ${await res.text()}`);
      return res.json() as ReturnType<PublishClient["publish"]>;
    },
  };
}
