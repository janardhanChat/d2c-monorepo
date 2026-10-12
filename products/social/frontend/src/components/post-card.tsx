import type { Post, PostStatus } from "@ap/social-domain";
import { Badge, type BadgeProps, Card } from "@ap/ui";

const statusTone: Record<PostStatus, BadgeProps["tone"]> = {
  draft: "neutral",
  pending_approval: "warning",
  approved: "info",
  scheduled: "info",
  publishing: "info",
  published: "success",
  failed: "danger",
};

export type PostCardData = Pick<
  Post,
  "caption" | "format" | "platforms" | "status" | "scheduledAt"
>;

export function PostCard({ post }: { post: PostCardData }) {
  return (
    <Card className="w-80 space-y-3">
      <div className="text-muted flex items-center justify-between text-xs">
        <span className="tracking-wide uppercase">
          {post.format} · {post.platforms.join(", ")}
        </span>
        <Badge tone={statusTone[post.status]}>{post.status.replace("_", " ")}</Badge>
      </div>
      <p className="line-clamp-3 text-sm">{post.caption}</p>
      {post.scheduledAt && (
        <p className="text-muted text-xs">
          {new Date(post.scheduledAt).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "Asia/Kolkata",
          })}
        </p>
      )}
    </Card>
  );
}
