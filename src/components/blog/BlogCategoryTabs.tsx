"use client";

import React from "react";
import Link from "next/link";
import { BlogCategory } from "@/types/blog";
import { routes } from "@/lib/routes";

interface BlogCategoryTabsProps {
  categories: BlogCategory[];
  activeCategorySlug?: string;
  activeTagSlug?: string;
  activeSearchQuery?: string;
}

export function BlogCategoryTabs({
  categories,
  activeCategorySlug,
  activeTagSlug,
  activeSearchQuery,
}: BlogCategoryTabsProps) {
  const activeCategories = categories.filter((c) => c.isActive);

  // Helper to maintain searchQuery if active
  const buildCategoryUrl = (slug?: string) => {
    const params = new URLSearchParams();
    if (slug) params.set("category", slug);
    if (activeSearchQuery) params.set("search", activeSearchQuery);
    const str = params.toString();
    return str ? `${routes.blog.list}?${str}` : routes.blog.list;
  };

  const isAllActive = !activeCategorySlug && !activeTagSlug;

  return (
    <nav className="mb-8 overflow-x-auto no-scrollbar py-1" aria-label="دسته‌بندی‌های وبلاگ">
      <div className="flex items-center gap-2 min-w-max pb-1 border-b border-[#EEEEEE]">
        {/* 'All' Tab */}
        <Link
          href={buildCategoryUrl(undefined)}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
            isAllActive
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-surface-subtle text-foreground hover:bg-neutral-200/60"
          }`}
        >
          همه مقالات
        </Link>

        {/* Category Tabs */}
        {activeCategories.map((cat) => {
          const isActive = activeCategorySlug === cat.slug;
          return (
            <Link
              key={cat.id}
              href={buildCategoryUrl(cat.slug)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-surface-subtle text-foreground hover:bg-neutral-200/60"
              }`}
            >
              {cat.title}
            </Link>
          );
        })}

        {/* Active Tag Indicator if filtering by tag */}
        {activeTagSlug && (
          <div className="flex items-center gap-2 mr-2 pr-2 border-r border-[#EEEEEE]">
            <span className="text-xs text-neutral-500">تگ انتخاب‌شده:</span>
            <span className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center gap-1.5">
              #{activeTagSlug}
              <Link
                href={routes.blog.list}
                className="text-neutral-400 hover:text-foreground mr-1"
                title="حذف فیلتر تگ"
              >
                ×
              </Link>
            </span>
          </div>
        )}
      </div>
    </nav>
  );
}
