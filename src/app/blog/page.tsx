"use client";

import React, { useState, useEffect, use } from "react";
import { Container } from "@/components/ui/Container";
import { Search } from "lucide-react";
import { blogService } from "@/lib/blog/blogService";
import { BlogSlider } from "@/components/blog/BlogSlider";
import { BlogCategoryTabs } from "@/components/blog/BlogCategoryTabs";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { BlogPagination } from "@/components/blog/BlogPagination";
import { BlogPost, BlogCategory, PaginatedBlogPostsResult } from "@/types/blog";

interface BlogPageProps {
  searchParams: Promise<{
    category?: string;
    tag?: string;
    search?: string;
    page?: string;
  }>;
}

export default function BlogPage({ searchParams }: BlogPageProps) {
  const resolvedSearchParams = use(searchParams);

  const categorySlug = resolvedSearchParams.category;
  const tagSlug = resolvedSearchParams.tag;
  const searchQuery = resolvedSearchParams.search;
  const currentPage = parseInt(resolvedSearchParams.page || "1", 10);

  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [paginatedData, setPaginatedData] = useState<PaginatedBlogPostsResult>({
    posts: [],
    total: 0,
    page: 1,
    pageSize: 6,
    totalPages: 1,
  });

  const [searchInput, setSearchInput] = useState(searchQuery || "");

  const loadData = () => {
    const cats = blogService.getCategories();
    setCategories(cats);

    const featured = blogService.getFeaturedPosts();
    setFeaturedPosts(featured);

    const result = blogService.getPublishedPosts({
      page: currentPage,
      pageSize: 6,
      categorySlug,
      tagSlug,
      searchQuery,
    });
    setPaginatedData(result);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = blogService.subscribe(loadData);
    return () => unsubscribe();
  }, [categorySlug, tagSlug, searchQuery, currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchInput.trim()) params.set("search", searchInput.trim());
    if (categorySlug) params.set("category", categorySlug);
    window.location.href = params.toString() ? `/blog?${params.toString()}` : "/blog";
  };

  const showSlider = currentPage === 1 && !categorySlug && !tagSlug && !searchQuery;

  return (
    <Container className="py-8 md:py-12">
      {/* Blog Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-[#EEEEEE]">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            وبلاگ مپوشام
          </h1>
          <p className="text-neutral-600 text-xs md:text-sm leading-relaxed">
            راهنمایی برای انتخاب بهتر، استایل و دنیای مد زنانه
          </p>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative w-full md:w-72"
        >
          <input
            type="text"
            placeholder="جستجو در مقالات..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full h-10 pr-9 pl-4 bg-surface-subtle border border-[#EEEEEE] rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
          />
          <button
            type="submit"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-primary transition-colors cursor-pointer"
            aria-label="جستجو"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Category Tabs Filter */}
      <BlogCategoryTabs
        categories={categories}
        activeCategorySlug={categorySlug}
        activeTagSlug={tagSlug}
        activeSearchQuery={searchQuery}
      />

      {/* Hero Featured Slider */}
      {showSlider && featuredPosts.length > 0 && (
        <BlogSlider posts={featuredPosts} categories={categories} />
      )}

      {/* Main Articles Grid Section */}
      <section className="mt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg md:text-xl font-bold text-foreground">
            {searchQuery
              ? `نتایج جستجو برای "${searchQuery}"`
              : tagSlug
              ? `مقالات با تگ "${tagSlug}"`
              : categorySlug
              ? `مقالات دسته‌بندی ${
                  categories.find((c) => c.slug === categorySlug)?.title || categorySlug
                }`
              : "آخرین مقالات"}
          </h2>
          <span className="text-xs text-neutral-500">
            {paginatedData.total} مقاله
          </span>
        </div>

        <BlogGrid posts={paginatedData.posts} categories={categories} />

        {/* Pagination */}
        <BlogPagination
          currentPage={paginatedData.page}
          totalPages={paginatedData.totalPages}
          categorySlug={categorySlug}
          tagSlug={tagSlug}
          searchQuery={searchQuery}
        />
      </section>
    </Container>
  );
}
