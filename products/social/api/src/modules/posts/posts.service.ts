import { randomUUID } from "node:crypto";

import { transition, type CreatePostInput, type Post } from "@ap/social-domain";
import type { TenantContext } from "@ap/tenant";

import type { PostsRepo } from "./posts.repo";
import type { PublishClient } from "./publisher.client";

class NotFoundError extends Error {
  readonly statusCode = 404;
  override name = "NotFound";
}

export function createPostsService(deps: { repo: PostsRepo; publisher: PublishClient }) {
  const { repo, publisher } = deps;

  async function load(t: TenantContext, id: string) {
    const post = await repo.get(t.brandId!, id);
    if (!post) throw new NotFoundError("Post not found");
    return post;
  }

  return {
    list: (t: TenantContext) => repo.list(t.brandId!),

    async create(t: TenantContext, userId: string, input: CreatePostInput): Promise<Post> {
      const now = new Date().toISOString();
      return repo.save({
        id: randomUUID(),
        organizationId: t.organizationId,
        brandId: t.brandId!,
        caption: input.caption,
        format: input.format,
        platforms: input.platforms,
        channelIds: input.channelIds,
        mediaUrls: input.mediaUrls,
        status: "draft",
        scheduledAt: input.scheduledAt ?? null,
        festivalId: input.festivalId ?? null,
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
      });
    },

    async submitForApproval(t: TenantContext, id: string) {
      return repo.save(transition(await load(t, id), "pending_approval"));
    },

    async approve(t: TenantContext, id: string) {
      return repo.save(transition(await load(t, id), "approved"));
    },

    /** Approved -> scheduled, and hand it to the platform publisher (which schedules it). */
    async schedule(t: TenantContext, id: string, scheduledAt: string) {
      const post = transition({ ...(await load(t, id)), scheduledAt }, "scheduled");
      await publisher.publish({
        organizationId: post.organizationId,
        brandId: post.brandId,
        channelIds: post.channelIds,
        caption: post.caption,
        mediaUrls: post.mediaUrls,
        scheduledAt,
        providerSettings: post.format === "reel" ? { instagram: { post_type: "reel" } } : undefined,
      });
      return repo.save(post);
    },
  };
}

export type PostsService = ReturnType<typeof createPostsService>;
