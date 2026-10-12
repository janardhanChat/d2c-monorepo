/**
 * The seam that keeps us vendor-independent. Products never see Postiz;
 * they see this interface (over HTTP). Swap Postiz for direct Meta Graph API
 * publishing by adding another implementation.
 */
export const SUPPORTED_PROVIDERS = [
  "instagram",
  "instagram-standalone",
  "facebook",
  "linkedin",
  "linkedin-page",
  "youtube",
  "x",
  "threads",
  "pinterest",
] as const;
export type Provider = (typeof SUPPORTED_PROVIDERS)[number];

export interface Channel {
  id: string;
  provider: string;
  name: string;
  handle: string;
  avatarUrl: string;
  disabled: boolean;
}

export interface PublishRequest {
  brandId: string;
  channelIds: string[];
  caption: string;
  mediaUrls: string[];
  /** ISO time; omit to publish now */
  scheduledAt?: string;
  /** Per-provider options, e.g. { instagram: { post_type: "reel" } } */
  providerSettings?: Record<string, Record<string, unknown>>;
}

export interface PublishResult {
  channelId: string;
  externalPostId: string;
}

export interface Publisher {
  readonly name: string;
  getConnectUrl(brandId: string, provider: Provider): Promise<string>;
  listChannels(brandId: string): Promise<Channel[]>;
  publish(req: PublishRequest): Promise<PublishResult[]>;
}
