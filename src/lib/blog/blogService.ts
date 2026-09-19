import {
  BlogPost,
  BlogCategory,
  BlogTag,
  GetBlogPostsOptions,
  PaginatedBlogPostsResult,
  BlogContentBlock,
} from "@/types/blog";
import { blogRepository, IBlogRepository } from "@/lib/repositories/blogRepository";

export function calculateReadingTime(content: BlogContentBlock[]): number {
  if (!content || content.length === 0) return 1;

  let totalWords = 0;
  for (const block of content) {
    if (block.type === "paragraph" || block.type === "heading" || block.type === "quote") {
      totalWords += block.text.trim().split(/\s+/).filter(Boolean).length;
    } else if (block.type === "list") {
      for (const item of block.items) {
        totalWords += item.trim().split(/\s+/).filter(Boolean).length;
      }
    } else if (block.type === "table") {
      for (const header of block.headers) {
        totalWords += header.trim().split(/\s+/).filter(Boolean).length;
      }
      for (const row of block.rows) {
        for (const cell of row) {
          totalWords += cell.trim().split(/\s+/).filter(Boolean).length;
        }
      }
    }
  }

  const wordsPerMinute = 180;
  const minutes = Math.ceil(totalWords / wordsPerMinute);
  return Math.max(1, minutes);
}

export class BlogService {
  constructor(private repo: IBlogRepository = blogRepository) {}

  /**
   * Get public/published blog posts with pagination and filters
   */
  getPublishedPosts(options?: Omit<GetBlogPostsOptions, "status">): PaginatedBlogPostsResult {
    return this.repo.getPosts({
      ...options,
      status: "published",
    });
  }

  /**
   * Get all posts for Admin view
   */
  getAdminPosts(options?: GetBlogPostsOptions): PaginatedBlogPostsResult {
    return this.repo.getPosts(options);
  }

  /**
   * Get featured posts for the hero slider
   */
  getFeaturedPosts(): BlogPost[] {
    const res = this.repo.getPosts({
      status: "published",
      featuredOnly: true,
      pageSize: 5,
    });
    return res.posts;
  }

  /**
   * Find post by slug
   */
  getPostBySlug(slug: string, options?: { allowUnpublished?: boolean }): BlogPost | null {
    const post = this.repo.getPostBySlug(slug);
    if (!post) return null;
    if (!options?.allowUnpublished && post.status !== "published") {
      return null;
    }
    return post;
  }

  /**
   * Find post by ID
   */
  getPostById(id: string): BlogPost | null {
    return this.repo.getPostById(id);
  }

  /**
   * Get related blog posts based on matching category or tags
   */
  getRelatedPosts(postId: string, limit: number = 3): BlogPost[] {
    const currentPost = this.repo.getPostById(postId);
    if (!currentPost) return [];

    const allPublished = this.repo.getAllPostsRaw().filter(
      (p) => p.status === "published" && p.id !== postId
    );

    // Score candidates based on matching category and tags
    const scored = allPublished.map((post) => {
      let score = 0;
      if (post.categoryId === currentPost.categoryId) {
        score += 5;
      }
      const sharedTags = post.tagIds.filter((t) => currentPost.tagIds.includes(t));
      score += sharedTags.length * 2;

      return { post, score };
    });

    // Filter out zero-score posts if possible, then sort by score descending
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map((item) => item.post);
  }

  /**
   * Categories
   */
  getCategories(): BlogCategory[] {
    return this.repo.getCategories();
  }

  getCategoryBySlug(slug: string): BlogCategory | null {
    return this.repo.getCategoryBySlug(slug);
  }

  createCategory(data: Omit<BlogCategory, "id">): BlogCategory {
    const categories = this.repo.getCategories();

    // Check slug uniqueness
    const existing = categories.find((c) => c.slug === data.slug);
    if (existing) {
      throw new Error(`اسلاگ دسته‌بندی "${data.slug}" تکراری است.`);
    }

    const newCategory: BlogCategory = {
      ...data,
      id: `bcat-${Date.now()}`,
    };

    this.repo.saveCategories([...categories, newCategory]);
    return newCategory;
  }

  /**
   * Tags
   */
  getTags(): BlogTag[] {
    return this.repo.getTags();
  }

  getTagBySlug(slug: string): BlogTag | null {
    return this.repo.getTagBySlug(slug);
  }

  createTag(data: Omit<BlogTag, "id">): BlogTag {
    const tags = this.repo.getTags();

    const existing = tags.find((t) => t.slug === data.slug);
    if (existing) {
      throw new Error(`اسلاگ تگ "${data.slug}" تکراری است.`);
    }

    const newTag: BlogTag = {
      ...data,
      id: `btag-${Date.now()}`,
    };

    this.repo.saveTags([...tags, newTag]);
    return newTag;
  }

  /**
   * Create new Blog Post
   */
  createPost(data: Omit<BlogPost, "id" | "createdAt" | "updatedAt">): BlogPost {
    const allPosts = this.repo.getAllPostsRaw();

    // Check slug uniqueness
    const existingSlug = allPosts.find((p) => p.slug === data.slug);
    if (existingSlug) {
      throw new Error(`نام مستعار (Slug) "${data.slug}" قبلاً استفاده شده است.`);
    }

    const now = new Date().toISOString();
    const readingTime = data.readingTime || calculateReadingTime(data.content);

    const newPost: BlogPost = {
      ...data,
      id: `bpost-${Date.now()}`,
      readingTime,
      createdAt: now,
      updatedAt: now,
      publishedAt: data.status === "published" ? (data.publishedAt || now) : data.publishedAt,
    };

    this.repo.savePosts([newPost, ...allPosts]);
    return newPost;
  }

  /**
   * Update existing Blog Post
   */
  updatePost(id: string, updates: Partial<Omit<BlogPost, "id" | "createdAt">>): BlogPost {
    const allPosts = this.repo.getAllPostsRaw();
    const index = allPosts.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error("مقاله مورد نظر یافت نشد.");
    }

    const existingPost = allPosts[index];

    // Check slug uniqueness if slug is changing
    if (updates.slug && updates.slug !== existingPost.slug) {
      const duplicateSlug = allPosts.find((p) => p.slug === updates.slug && p.id !== id);
      if (duplicateSlug) {
        throw new Error(`نام مستعار (Slug) "${updates.slug}" قبلاً استفاده شده است.`);
      }
    }

    const now = new Date().toISOString();
    const updatedContent = updates.content || existingPost.content;
    const readingTime = updates.readingTime || calculateReadingTime(updatedContent);

    let publishedAt = updates.publishedAt !== undefined ? updates.publishedAt : existingPost.publishedAt;
    if (updates.status === "published" && !publishedAt) {
      publishedAt = now;
    }

    const updatedPost: BlogPost = {
      ...existingPost,
      ...updates,
      readingTime,
      updatedAt: now,
      publishedAt,
    };

    const newPosts = [...allPosts];
    newPosts[index] = updatedPost;
    this.repo.savePosts(newPosts);

    return updatedPost;
  }

  /**
   * Archive Blog Post
   */
  archivePost(id: string): void {
    this.updatePost(id, { status: "archived" });
  }

  /**
   * Subscribe to repo updates
   */
  subscribe(listener: () => void): () => void {
    return this.repo.subscribe(listener);
  }
}

export const blogService = new BlogService();
