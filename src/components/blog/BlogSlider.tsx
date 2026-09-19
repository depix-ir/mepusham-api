"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ChevronLeft, Clock, Calendar, ArrowLeft } from "lucide-react";
import { BlogPost, BlogCategory } from "@/types/blog";
import { routes } from "@/lib/routes";

interface BlogSliderProps {
  posts: BlogPost[];
  categories: BlogCategory[];
}

export function BlogSlider({ posts, categories }: BlogSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const total = posts.length;
  const sliderRef = useRef<HTMLDivElement>(null);

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      // In RTL, right arrow goes to previous or next slide depending on convention, let's trigger next/prev
      prevSlide();
    } else if (e.key === "ArrowLeft") {
      nextSlide();
    }
  };

  if (!posts || posts.length === 0) return null;

  const currentPost = posts[currentIndex];
  const category = categoryMap.get(currentPost.categoryId);
  const publishedDate = currentPost.publishedAt || currentPost.createdAt;
  const formattedDate = new Date(publishedDate).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      ref={sliderRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className="relative bg-background border border-[#EEEEEE] rounded-xl overflow-hidden mb-8 md:mb-12 outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label="مقالات منتخب وبلاگ"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[360px] md:min-h-[400px]">
        {/* Image Column */}
        <div className="md:col-span-7 relative min-h-[240px] md:min-h-[400px] bg-surface-subtle overflow-hidden">
          <Image
            src={currentPost.coverImage}
            alt={currentPost.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover transition-all duration-500"
          />
          {/* Subtle gradient overlay on image for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:hidden" />
        </div>

        {/* Content Column */}
        <div className="md:col-span-5 p-6 md:p-8 flex flex-col justify-between bg-background">
          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] md:text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                مقاله منتخب
              </span>

              {category && (
                <Link
                  href={routes.blog.category(category.slug)}
                  className="text-xs font-semibold text-neutral-600 hover:text-primary transition-colors"
                >
                  {category.title}
                </Link>
              )}
            </div>

            {/* Title */}
            <h2 className="text-lg md:text-2xl font-bold text-foreground mb-3 leading-snug hover:text-primary transition-colors">
              <Link href={routes.blog.detail(currentPost.slug)}>
                {currentPost.title}
              </Link>
            </h2>

            {/* Excerpt */}
            <p className="text-xs md:text-sm text-neutral-600 line-clamp-3 mb-6 leading-relaxed">
              {currentPost.excerpt}
            </p>
          </div>

          {/* Footer Info & CTA */}
          <div className="space-y-4 pt-4 border-t border-[#EEEEEE]">
            <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>{currentPost.readingTime || 5} دقیقه مطالعه</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span>{formattedDate}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-1">
              <Link
                href={routes.blog.detail(currentPost.slug)}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-primary text-primary-foreground font-bold text-xs hover:bg-primary-hover transition-colors shadow-xs"
              >
                <span>مطالعه مقاله</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>

              {/* Slider controls */}
              {total > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={prevSlide}
                    className="p-2 rounded-lg border border-[#EEEEEE] hover:bg-surface-subtle text-foreground transition-colors cursor-pointer"
                    aria-label="اسلاید قبلی"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono text-neutral-500 px-1">
                    {currentIndex + 1} / {total}
                  </span>
                  <button
                    onClick={nextSlide}
                    className="p-2 rounded-lg border border-[#EEEEEE] hover:bg-surface-subtle text-foreground transition-colors cursor-pointer"
                    aria-label="اسلاید بعدی"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
