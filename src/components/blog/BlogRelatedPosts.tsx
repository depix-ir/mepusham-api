"use client";

import React from "react";
import { BlogPost, BlogCategory } from "@/types/blog";
import { BlogCard } from "./BlogCard";

interface BlogRelatedPostsProps {
  posts: BlogPost[];
  categories: BlogCategory[];
}

export function BlogRelatedPosts({ posts, categories }: BlogRelatedPostsProps) {
  if (!posts || posts.length === 0) return null;

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return (
    <section className="mt-12 md:mt-16 pt-8 border-t border-[#EEEEEE]">
      <h3 className="text-xl md:text-2xl font-bold text-foreground mb-6">
        مقالات مرتبط
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogCard
            key={post.id}
            post={post}
            category={categoryMap.get(post.categoryId)}
          />
        ))}
      </div>
    </section>
  );
}
