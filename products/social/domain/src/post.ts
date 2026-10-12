import { z } from "zod";

export const PLATFORMS = ["instagram", "facebook", "linkedin", "youtube"] as const;
export const POST_FORMATS = ["image", "carousel", "reel", "story", "video", "text"] as const;
export const POST_STATUSES = [
  "draft",
  "pending_approval",
  "approved",
  "scheduled",
  "publishing",
  "published",
  "failed",
] as const;

export type Platform = (typeof PLATFORMS)[number];
export type PostStatus = (typeof POST_STATUSES)[number];

export const postSchema = z.object({
  id: z.uuid(),
  organizationId: z.uuid(),
  brandId: z.uuid(),
  caption: z.string().max(2200),
  format: z.enum(POST_FORMATS),
  platforms: z.array(z.enum(PLATFORMS)).min(1),
  channelIds: z.array(z.string()),
  mediaUrls: z.array(z.url()),
  status: z.enum(POST_STATUSES),
  scheduledAt: z.iso.datetime().nullable(),
  festivalId: z.string().nullable(),
  createdBy: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type Post = z.infer<typeof postSchema>;

export const createPostInput = postSchema
  .pick({ caption: true, format: true, platforms: true, channelIds: true, mediaUrls: true })
  .extend({
    scheduledAt: z.iso.datetime().optional(),
    festivalId: z.string().optional(),
  });
export type CreatePostInput = z.infer<typeof createPostInput>;

/**
 * Allowed lifecycle moves. Approval is optional per brand (Auto mode can skip it),
 * but nothing reaches "scheduled" without passing through "approved".
 */
const transitions: Record<PostStatus, PostStatus[]> = {
  draft: ["pending_approval", "approved"],
  pending_approval: ["approved", "draft"],
  approved: ["scheduled", "draft"],
  scheduled: ["publishing", "draft"],
  publishing: ["published", "failed"],
  published: [],
  failed: ["scheduled", "draft"],
};

export class InvalidTransitionError extends Error {
  readonly statusCode = 409;
  constructor(from: PostStatus, to: PostStatus) {
    super(`Cannot move a post from "${from}" to "${to}"`);
    this.name = "Conflict";
  }
}

export function canTransition(from: PostStatus, to: PostStatus): boolean {
  return transitions[from].includes(to);
}

export function transition(post: Post, to: PostStatus, now = new Date()): Post {
  if (!canTransition(post.status, to)) throw new InvalidTransitionError(post.status, to);
  if (to === "scheduled" && !post.scheduledAt) {
    throw new InvalidTransitionError(post.status, to);
  }
  return { ...post, status: to, updatedAt: now.toISOString() };
}

/** Instagram caps captions at 2,200 chars and 30 hashtags. */
export function validateForPlatform(caption: string, platform: Platform): string[] {
  const issues: string[] = [];
  if (platform === "instagram") {
    if (caption.length > 2200) issues.push("Instagram captions are limited to 2,200 characters");
    if ((caption.match(/#\w+/g) ?? []).length > 30)
      issues.push("Instagram allows at most 30 hashtags");
  }
  if (platform === "linkedin" && caption.length > 3000) {
    issues.push("LinkedIn posts are limited to 3,000 characters");
  }
  return issues;
}
