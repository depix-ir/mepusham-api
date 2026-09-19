import {
  BlogPost,
  BlogCategory,
  BlogTag,
  GetBlogPostsOptions,
  PaginatedBlogPostsResult,
} from "@/types/blog";
import {
  initialBlogPosts,
  initialBlogCategories,
  initialBlogTags,
} from "@/data/blogData";

export const STORAGE_KEY_BLOG_POSTS = "mepusham_blog_posts_v1";
export const STORAGE_KEY_BLOG_CATEGORIES = "mepusham_blog_categories_v1";
export const STORAGE_KEY_BLOG_TAGS = "mepusham_blog_tags_v1";

export type BlogListener = () => void;

export interface IBlogRepository {
  getPosts(options?: GetBlogPostsOptions & { isHydrated?: boolean }): PaginatedBlogPostsResult;
  getAllPostsRaw(options?: { isHydrated?: boolean }): BlogPost[];
  getPostById(id: string, options?: { isHydrated?: boolean }): BlogPost | null;
  getPostBySlug(slug: string, options?: { isHydrated?: boolean }): BlogPost | null;
  savePosts(posts: BlogPost[]): void;

  getCategories(options?: { isHydrated?: boolean }): BlogCategory[];
  getCategoryBySlug(slug: string, options?: { isHydrated?: boolean }): BlogCategory | null;
  saveCategories(categories: BlogCategory[]): void;

  getTags(options?: { isHydrated?: boolean }): BlogTag[];
  getTagBySlug(slug: string, options?: { isHydrated?: boolean }): BlogTag | null;
  saveTags(tags: BlogTag[]): void;

  subscribe(listener: BlogListener): () => void;
  resetToDefaults(): void;
}

class MockBlogRepository implements IBlogRepository {
  private memoryPosts: BlogPost[] | null = null;
  private memoryCategories: BlogCategory[] | null = null;
  private memoryTags: BlogTag[] | null = null;
  private listeners: Set<BlogListener> = new Set();

  subscribe(listener: BlogListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error("BlogListener error:", err);
      }
    });
  }

  getAllPostsRaw(options?: { isHydrated?: boolean }): BlogPost[] {
    const isHydrated = options?.isHydrated ?? (typeof window !== "undefined");
    if (!isHydrated) {
      return this.memoryPosts ?? initialBlogPosts;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY_BLOG_POSTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.memoryPosts = parsed;
        return parsed;
      }
      localStorage.setItem(STORAGE_KEY_BLOG_POSTS, JSON.stringify(initialBlogPosts));
      this.memoryPosts = initialBlogPosts;
      return initialBlogPosts;
    } catch (e) {
      console.error("MockBlogRepository: Failed to get posts:", e);
      return this.memoryPosts ?? initialBlogPosts;
    }
  }

  getPosts(options?: GetBlogPostsOptions & { isHydrated?: boolean }): PaginatedBlogPostsResult {
    let posts = this.getAllPostsRaw(options);

    // 1. Status Filter
    if (options?.status) {
      posts = posts.filter((p) => p.status === options.status);
    }

    // 2. Featured Filter
    if (options?.featuredOnly) {
      posts = posts.filter((p) => p.isFeatured === true);
    }

    // 3. Category Filter (by id or slug)
    if (options?.categoryId) {
      posts = posts.filter((p) => p.categoryId === options.categoryId);
    } else if (options?.categorySlug) {
      const categories = this.getCategories(options);
      const matchedCat = categories.find((c) => c.slug === options.categorySlug);
      if (matchedCat) {
        posts = posts.filter((p) => p.categoryId === matchedCat.id);
      } else {
        posts = [];
      }
    }

    // 4. Tag Filter (by id or slug)
    if (options?.tagId) {
      posts = posts.filter((p) => p.tagIds.includes(options.tagId!));
    } else if (options?.tagSlug) {
      const tags = this.getTags(options);
      const matchedTag = tags.find((t) => t.slug === options.tagSlug);
      if (matchedTag) {
        posts = posts.filter((p) => p.tagIds.includes(matchedTag.id));
      } else {
        posts = [];
      }
    }

    // 5. Search Query Filter (title, excerpt, tag titles, category title)
    if (options?.searchQuery && options.searchQuery.trim()) {
      const query = options.searchQuery.trim().toLowerCase();
      const categories = this.getCategories(options);
      const tags = this.getTags(options);

      posts = posts.filter((p) => {
        const matchTitle = p.title.toLowerCase().includes(query);
        const matchExcerpt = p.excerpt.toLowerCase().includes(query);

        const category = categories.find((c) => c.id === p.categoryId);
        const matchCat = category ? category.title.toLowerCase().includes(query) : false;

        const postTags = tags.filter((t) => p.tagIds.includes(t.id));
        const matchTag = postTags.some((t) => t.title.toLowerCase().includes(query));

        return matchTitle || matchExcerpt || matchCat || matchTag;
      });
    }

    // Sort by publishedAt descending or createdAt descending
    posts = [...posts].sort((a, b) => {
      const dateA = new Date(a.publishedAt || a.createdAt).getTime();
      const dateB = new Date(b.publishedAt || b.createdAt).getTime();
      return dateB - dateA;
    });

    const total = posts.length;
    const page = Math.max(1, options?.page ?? 1);
    const pageSize = Math.max(1, options?.pageSize ?? 6);
    const totalPages = Math.ceil(total / pageSize) || 1;

    const startIndex = (page - 1) * pageSize;
    const paginatedPosts = posts.slice(startIndex, startIndex + pageSize);

    return {
      posts: paginatedPosts,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  getPostById(id: string, options?: { isHydrated?: boolean }): BlogPost | null {
    const posts = this.getAllPostsRaw(options);
    return posts.find((p) => p.id === id) || null;
  }

  getPostBySlug(slug: string, options?: { isHydrated?: boolean }): BlogPost | null {
    const posts = this.getAllPostsRaw(options);
    return posts.find((p) => p.slug === slug) || null;
  }

  savePosts(posts: BlogPost[]): void {
    this.memoryPosts = posts;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_BLOG_POSTS, JSON.stringify(posts));
      } catch (e) {
        console.error("MockBlogRepository: Failed to save posts:", e);
      }
    }
    this.notifyListeners();
  }

  getCategories(options?: { isHydrated?: boolean }): BlogCategory[] {
    const isHydrated = options?.isHydrated ?? (typeof window !== "undefined");
    if (!isHydrated) {
      return this.memoryCategories ?? initialBlogCategories;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY_BLOG_CATEGORIES);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.memoryCategories = parsed;
        return parsed;
      }
      localStorage.setItem(STORAGE_KEY_BLOG_CATEGORIES, JSON.stringify(initialBlogCategories));
      this.memoryCategories = initialBlogCategories;
      return initialBlogCategories;
    } catch (e) {
      console.error("MockBlogRepository: Failed to get categories:", e);
      return this.memoryCategories ?? initialBlogCategories;
    }
  }

  getCategoryBySlug(slug: string, options?: { isHydrated?: boolean }): BlogCategory | null {
    const categories = this.getCategories(options);
    return categories.find((c) => c.slug === slug) || null;
  }

  saveCategories(categories: BlogCategory[]): void {
    this.memoryCategories = categories;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_BLOG_CATEGORIES, JSON.stringify(categories));
      } catch (e) {
        console.error("MockBlogRepository: Failed to save categories:", e);
      }
    }
    this.notifyListeners();
  }

  getTags(options?: { isHydrated?: boolean }): BlogTag[] {
    const isHydrated = options?.isHydrated ?? (typeof window !== "undefined");
    if (!isHydrated) {
      return this.memoryTags ?? initialBlogTags;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY_BLOG_TAGS);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.memoryTags = parsed;
        return parsed;
      }
      localStorage.setItem(STORAGE_KEY_BLOG_TAGS, JSON.stringify(initialBlogTags));
      this.memoryTags = initialBlogTags;
      return initialBlogTags;
    } catch (e) {
      console.error("MockBlogRepository: Failed to get tags:", e);
      return this.memoryTags ?? initialBlogTags;
    }
  }

  getTagBySlug(slug: string, options?: { isHydrated?: boolean }): BlogTag | null {
    const tags = this.getTags(options);
    return tags.find((t) => t.slug === slug) || null;
  }

  saveTags(tags: BlogTag[]): void {
    this.memoryTags = tags;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY_BLOG_TAGS, JSON.stringify(tags));
      } catch (e) {
        console.error("MockBlogRepository: Failed to save tags:", e);
      }
    }
    this.notifyListeners();
  }

  resetToDefaults(): void {
    this.memoryPosts = initialBlogPosts;
    this.memoryCategories = initialBlogCategories;
    this.memoryTags = initialBlogTags;
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY_BLOG_POSTS);
        localStorage.removeItem(STORAGE_KEY_BLOG_CATEGORIES);
        localStorage.removeItem(STORAGE_KEY_BLOG_TAGS);
      } catch (e) {
        console.error("MockBlogRepository: Failed to reset defaults:", e);
      }
    }
    this.notifyListeners();
  }
}

export const blogRepository: IBlogRepository = new MockBlogRepository();
