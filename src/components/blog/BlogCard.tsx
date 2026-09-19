"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Calendar } from "lucide-react";
import { BlogPost, BlogCategory } from "@/types/blog";
import { routes } from "@/lib/routes";

interface BlogCardProps {
  post: BlogPost;
  category?: BlogCategory | null;
}

export function BlogCard({ post, category }: BlogCardProps) {
  const publishedDate = post.publishedAt || post.createdAt;
  const formattedDate = new Date(publishedDate).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="bg-background border border-[#EEEEEE] rounded-lg overflow-hidden transition-all duration-200 hover:border-primary/40 flex flex-col h-full group">
      {/* Cover Image */}
      <Link
        href={routes.blog.detail(post.slug)}
        className="relative aspect-[16/10] w-full bg-surface-subtle overflow-hidden block"
      >
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-102 transition-transform duration-300"
        />
      </Link>

      {/* Content Body */}
      <div className="p-4 md:p-5 flex flex-col flex-1">
        {/* Category Badge */}
        {category && (
          <div className="mb-2">
            <Link
              href={routes.blog.category(category.slug)}
              className="text-xs font-semibold text-primary hover:underline inline-block"
            >
              {category.title}
            </Link>
          </div>
        )}

        {/* Title */}
        <h3 className="text-base md:text-lg font-bold text-foreground mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          <Link href={routes.blog.detail(post.slug)}>
            {post.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="text-xs md:text-sm text-neutral-600 line-clamp-2 mb-4 leading-relaxed flex-1">
          {post.excerpt}
        </p>

        {/* Footer Info */}
        <div className="flex items-center justify-between pt-3 border-t border-[#EEEEEE] text-[11px] md:text-xs text-neutral-500 font-medium">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>{post.readingTime || 5} دقیقه مطالعه</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
