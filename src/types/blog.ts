export type BlogPostStatus = "published" | "draft" | "archived";

export type BlogContentBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "heading";
      level: 2 | 3;
      text: string;
    }
  | {
      type: "image";
      src: string;
      alt: string;
      caption?: string;
    }
  | {
      type: "quote";
      text: string;
    }
  | {
      type: "list";
      ordered: boolean;
      items: string[];
    }
  | {
      type: "table";
      headers: string[];
      rows: string[][];
    };

export type BlogPost = {
  id: string;
  slug: string;

  title: string;
  excerpt: string;

  coverImage: string;

  content: BlogContentBlock[];

  categoryId: string;
  tagIds: string[];

  authorName?: string;

  status: BlogPostStatus;

  publishedAt?: string;

  readingTime?: number; // In minutes

  createdAt: string;
  updatedAt: string;

  isFeatured?: boolean;
};

export type BlogCategory = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  isActive: boolean;
};

export type BlogTag = {
  id: string;
  title: string;
  slug: string;
};

export type GetBlogPostsOptions = {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  categorySlug?: string;
  tagId?: string;
  tagSlug?: string;
  status?: BlogPostStatus;
  searchQuery?: string;
  featuredOnly?: boolean;
};

export type PaginatedBlogPostsResult = {
  posts: BlogPost[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
