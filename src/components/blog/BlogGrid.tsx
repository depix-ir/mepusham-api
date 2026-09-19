"use client";

import React from "react";
import { BlogPost, BlogCategory } from "@/types/blog";
import { BlogCard } from "./BlogCard";

interface BlogGridProps {
  posts: BlogPost[];
  categories: BlogCategory[];
}

export function BlogGrid({ posts, categories }: BlogGridProps) {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  if (posts.length === 0) {
    return (
      <div className="py-12 text-center border border-dashed border-neutral-200 rounded-lg bg-surface-subtle/50 my-6">
        <p className="text-neutral-600 text-sm font-medium mb-1">
          هیچ مقاله‌ای یافت نشد.
        </p>
        <p className="text-neutral-400 text-xs">
          لطفاً عبارت دیگری را جستجو کرده یا فیلترهای اعمال‌شده را تغییر دهید.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <BlogCard
          key={post.id}
          post={post}
          category={categoryMap.get(post.categoryId)}
        />
      ))}
    </div>
  );
}
