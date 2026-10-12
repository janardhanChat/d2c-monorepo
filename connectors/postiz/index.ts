import { getChannelAnalytics, getPostAnalytics } from "./analytics/analytics";
import { getConnectUrl, isApiKeyValid, type PostizProvider } from "./auth/connect";
import { deleteIntegration, listIntegrations } from "./channels/channels";
import { createPostizHttp, type PostizClientOptions } from "./client/http";
import {
  createPosts,
  deletePost,
  uploadFile,
  uploadFromUrl,
  type CreatePostsInput,
} from "./publishing/posts";

export { PostizError, type PostizClientOptions } from "./client/http";
export type { PostizProvider } from "./auth/connect";
export type { PostizIntegration } from "./channels/channels";
export type {
  CreatePostsInput,
  CreatedPost,
  PostizMedia,
  PostizPostItem,
} from "./publishing/posts";
export type { PostizMetric } from "./analytics/analytics";

/** Facade grouping the Postiz API by area. */
export function createPostizClient(opts: PostizClientOptions) {
  const http = createPostizHttp(opts);
  return {
    auth: {
      getConnectUrl: (p: PostizProvider, refreshId?: string) => getConnectUrl(http, p, refreshId),
      isApiKeyValid: () => isApiKeyValid(http),
    },
    channels: {
      list: (customerId?: string) => listIntegrations(http, customerId),
      remove: (id: string) => deleteIntegration(http, id),
    },
    publishing: {
      create: (input: CreatePostsInput) => createPosts(http, input),
      remove: (postId: string) => deletePost(http, postId),
      uploadFromUrl: (url: string) => uploadFromUrl(http, url),
      uploadFile: (file: Blob, name: string) => uploadFile(http, file, name),
    },
    analytics: {
      post: (postId: string, days?: number) => getPostAnalytics(http, postId, days),
      channel: (integrationId: string, days?: number) =>
        getChannelAnalytics(http, integrationId, days),
    },
  };
}

export type PostizClient = ReturnType<typeof createPostizClient>;
