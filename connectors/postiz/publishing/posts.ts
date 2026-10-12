import type { PostizHttp } from "../client/http";

export interface PostizMedia {
  id: string;
  path: string;
}

export interface PostizPostItem {
  integration: { id: string };
  value: Array<{ content: string; image: PostizMedia[] }>;
  /** Provider-specific settings; must include `__type` (e.g. "instagram"). */
  settings: { __type: string } & Record<string, unknown>;
}

export interface CreatePostsInput {
  type: "schedule" | "now" | "draft";
  /** ISO timestamp */
  date: string;
  shortLink?: boolean;
  tags?: Array<{ value: string; label: string }>;
  posts: PostizPostItem[];
}

export interface CreatedPost {
  postId: string;
  integration: string;
}

/**
 * POST /posts - several posts can go in one request; the create endpoint is
 * rate limited per instance (API_LIMIT env on self-hosted), so batch when you can.
 */
export function createPosts(http: PostizHttp, input: CreatePostsInput) {
  return http.request<CreatedPost[]>("POST", "/posts", {
    body: { shortLink: false, tags: [], ...input },
  });
}

/** DELETE /posts/{id} - 404 means already deleted. */
export function deletePost(http: PostizHttp, postId: string) {
  return http.request<void>("DELETE", `/posts/${postId}`);
}

/** POST /upload-from-url - media must be uploaded before it is attached to a post. */
export function uploadFromUrl(http: PostizHttp, url: string) {
  return http.request<PostizMedia>("POST", "/upload-from-url", { body: { url } });
}

/** POST /upload (multipart) */
export function uploadFile(http: PostizHttp, file: Blob, filename: string) {
  const form = new FormData();
  form.append("file", file, filename);
  return http.upload<PostizMedia>("/upload", form);
}
