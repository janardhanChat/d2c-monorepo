import type { Post } from "@ap/social-domain";

/** Storage seam. Postgres implementation targets the "social" schema (products/social/db). */
export interface PostsRepo {
  list(brandId: string): Promise<Post[]>;
  get(brandId: string, id: string): Promise<Post | null>;
  save(post: Post): Promise<Post>;
}

export function createInMemoryPostsRepo(): PostsRepo {
  const posts = new Map<string, Post>();
  return {
    async list(brandId) {
      return [...posts.values()]
        .filter((p) => p.brandId === brandId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async get(brandId, id) {
      const p = posts.get(id);
      // Tenant check at the storage edge: a post from another brand simply "doesn't exist".
      return p && p.brandId === brandId ? p : null;
    },
    async save(post) {
      posts.set(post.id, post);
      return post;
    },
  };
}
