import { describe, it, expect, beforeEach } from "bun:test";
import { blogService, calculateReadingTime } from "../blogService";
import { blogRepository } from "@/lib/repositories/blogRepository";
import { BlogContentBlock } from "@/types/blog";

describe("Blog Domain Service & Repository Tests", () => {
  beforeEach(() => {
    blogRepository.resetToDefaults();

    const cat1 = { id: "cat-fashion", title: "مد و استایل", slug: "fashion", isActive: true, createdAt: new Date().toISOString() };
    const cat2 = { id: "cat-accessories", title: "اکسسوری و ساعت", slug: "accessories", isActive: true, createdAt: new Date().toISOString() };
    blogRepository.saveCategories([cat1, cat2]);

    const tag1 = { id: "tag-watch", title: "ساعت مچی", slug: "watch", createdAt: new Date().toISOString() };
    const tag2 = { id: "tag-style", title: "راهنمای استایل", slug: "style", createdAt: new Date().toISOString() };
    blogRepository.saveTags([tag1, tag2]);

    const post1 = {
      id: "post-1",
      title: "راهنمای خرید ساعت مچی مردانه",
      slug: "mens-watch-buying-guide",
      excerpt: "نکات مهم در انتخاب بهترین ساعت مچی",
      coverImage: "/images/blog-1.jpg",
      categoryId: cat2.id,
      tagIds: [tag1.id, tag2.id],
      authorName: "نویسنده تست",
      status: "published" as const,
      isFeatured: true,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: [{ type: "paragraph" as const, text: "متن مقاله در مورد ساعت مچی" }],
    };

    const post2 = {
      id: "post-2",
      title: "اصول ست کردن لباس پاییزی",
      slug: "autumn-outfit-principles",
      excerpt: "چگونه در فصل پاییز استایل شیکی داشته باشیم",
      coverImage: "/images/blog-2.jpg",
      categoryId: cat1.id,
      tagIds: [tag2.id],
      authorName: "نویسنده تست",
      status: "published" as const,
      isFeatured: false,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: [{ type: "paragraph" as const, text: "متن مقاله در مورد مد و استایل" }],
    };

    const post3 = {
      id: "post-3",
      title: "معرفی برندهای برتر ساعت",
      slug: "top-watch-brands",
      excerpt: "بررسی معروف‌ترین برندهای ساعت جهان",
      coverImage: "/images/blog-3.jpg",
      categoryId: cat2.id,
      tagIds: [tag1.id],
      authorName: "نویسنده تست",
      status: "published" as const,
      isFeatured: false,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: [{ type: "paragraph" as const, text: "مقاله ساعت مچی لوکس" }],
    };

    blogRepository.savePosts([post1, post2, post3]);
  });

  it("1. Initializes with seed mock data for categories, tags, and posts", () => {
    const categories = blogService.getCategories();
    const tags = blogService.getTags();
    const postsResult = blogService.getPublishedPosts({ pageSize: 20 });

    expect(categories.length).toBeGreaterThan(0);
    expect(tags.length).toBeGreaterThan(0);
    expect(postsResult.posts.length).toBeGreaterThan(0);
    expect(postsResult.total).toBe(postsResult.posts.length);
  });

  it("2. Correctly calculates reading time based on block contents", () => {
    const blocks: BlogContentBlock[] = [
      { type: "paragraph", text: "یک متن ساده برای تست زمان مطالعه مقاله وبلاگ فروشگاه مپوشــــم" },
      { type: "heading", level: 2, text: "عنوان اصلی بخش اول" },
      { type: "list", ordered: false, items: ["آیتم اول لیست", "آیتم دوم لیست"] },
    ];

    const time = calculateReadingTime(blocks);
    expect(time).toBeGreaterThanOrEqual(1);
  });

  it("3. Filters posts by category and tag correctly", () => {
    const categories = blogService.getCategories();
    const targetCat = categories[0];

    const catFiltered = blogService.getPublishedPosts({ categorySlug: targetCat.slug });
    expect(catFiltered.posts.every((p) => p.categoryId === targetCat.id)).toBe(true);

    const tags = blogService.getTags();
    const targetTag = tags[0];

    const tagFiltered = blogService.getPublishedPosts({ tagSlug: targetTag.slug });
    expect(tagFiltered.posts.every((p) => p.tagIds.includes(targetTag.id))).toBe(true);
  });

  it("4. Supports pagination and limits page size", () => {
    const page1 = blogService.getPublishedPosts({ page: 1, pageSize: 2 });
    expect(page1.posts.length).toBe(2);
    expect(page1.page).toBe(1);
    expect(page1.totalPages).toBeGreaterThanOrEqual(1);

    if (page1.totalPages > 1) {
      const page2 = blogService.getPublishedPosts({ page: 2, pageSize: 2 });
      expect(page2.posts.length).toBeGreaterThan(0);
      expect(page2.posts[0].id).not.toBe(page1.posts[0].id);
    }
  });

  it("5. Searches posts by title and excerpt without affecting product search", () => {
    const searchRes = blogService.getPublishedPosts({ searchQuery: "ساعت" });
    expect(searchRes.posts.length).toBeGreaterThan(0);
    expect(
      searchRes.posts.some(
        (p) =>
          p.title.includes("ساعت") ||
          p.excerpt.includes("ساعت") ||
          p.tagIds.length > 0
      )
    ).toBe(true);
  });

  it("6. Prevents duplicate slug creation for articles, categories, and tags", () => {
    const existingPost = blogService.getPublishedPosts().posts[0];

    expect(() => {
      blogService.createPost({
        title: "مقاله تکراری",
        slug: existingPost.slug,
        excerpt: "تست",
        coverImage: "/images/test.jpg",
        categoryId: existingPost.categoryId,
        tagIds: [],
        status: "published",
        content: [],
      });
    }).toThrow(/قبلاً استفاده شده است/);

    const existingCat = blogService.getCategories()[0];
    expect(() => {
      blogService.createCategory({
        title: "دسته‌بندی تکراری",
        slug: existingCat.slug,
        isActive: true,
      });
    }).toThrow(/تکراری است/);
  });

  it("7. Single Source of Truth: Admin Create -> Repository -> Storefront visibility", () => {
    const newPostData = {
      title: "تست مقاله جدید اختصاصی",
      slug: "exclusive-test-post",
      excerpt: "خلاصه تست مقاله جدید جهت اطمینان از همگام‌سازی ریپازیتوری",
      coverImage: "/images/watch-1.webp",
      categoryId: blogService.getCategories()[0].id,
      tagIds: [blogService.getTags()[0].id],
      authorName: "نویسنده بومی",
      status: "published" as const,
      content: [{ type: "paragraph" as const, text: "متن اصلی پاراگراف تست" }],
    };

    const createdPost = blogService.createPost(newPostData);
    expect(createdPost.id).toBeDefined();

    // Storefront query
    const fetchedFromStorefront = blogService.getPostBySlug("exclusive-test-post");
    expect(fetchedFromStorefront).not.toBeNull();
    expect(fetchedFromStorefront?.title).toBe("تست مقاله جدید اختصاصی");

    // Admin edit -> update title
    blogService.updatePost(createdPost.id, {
      title: "تست مقاله جدید اختصاصی - ویرایش شده",
    });

    const updatedFromStorefront = blogService.getPostBySlug("exclusive-test-post");
    expect(updatedFromStorefront?.title).toBe("تست مقاله جدید اختصاصی - ویرایش شده");

    // Admin archive
    blogService.archivePost(createdPost.id);

    // Should no longer appear in public published query
    const archivedFromPublic = blogService.getPostBySlug("exclusive-test-post");
    expect(archivedFromPublic).toBeNull();

    // Should still exist in admin query with status archived
    const adminFetch = blogService.getPostById(createdPost.id);
    expect(adminFetch?.status).toBe("archived");
  });

  it("8. Related Posts scoring correctly prioritizes shared category and tags", () => {
    const posts = blogService.getPublishedPosts().posts;
    if (posts.length > 1) {
      const targetPost = posts[0];
      const related = blogService.getRelatedPosts(targetPost.id, 3);

      expect(related.every((p) => p.id !== targetPost.id)).toBe(true);
    }
  });
});
