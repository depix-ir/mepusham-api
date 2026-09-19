"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { routes } from "@/lib/routes";

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  categorySlug?: string;
  tagSlug?: string;
  searchQuery?: string;
}

export function BlogPagination({
  currentPage,
  totalPages,
  categorySlug,
  tagSlug,
  searchQuery,
}: BlogPaginationProps) {
  if (totalPages <= 1) return null;

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", page.toString());
    if (categorySlug) params.set("category", categorySlug);
    if (tagSlug) params.set("tag", tagSlug);
    if (searchQuery) params.set("search", searchQuery);
    const str = params.toString();
    return str ? `${routes.blog.list}?${str}` : routes.blog.list;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      className="flex items-center justify-between sm:justify-center gap-2 mt-10 pt-6 border-t border-[#EEEEEE]"
      aria-label="صفحات وبلاگ"
    >
      {/* Previous Page */}
      {currentPage > 1 ? (
        <Link
          href={buildPageUrl(currentPage - 1)}
          className="h-9 px-3.5 rounded-lg border border-[#EEEEEE] bg-background hover:bg-surface-subtle text-foreground text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
          <span>قبلی</span>
        </Link>
      ) : (
        <div className="h-9 px-3.5 rounded-lg border border-[#EEEEEE] bg-surface-subtle/50 text-neutral-300 text-xs font-semibold flex items-center gap-1 cursor-not-allowed">
          <ChevronRight className="w-4 h-4" />
          <span>قبلی</span>
        </div>
      )}

      {/* Desktop Number Buttons */}
      <div className="hidden sm:flex items-center gap-1.5">
        {pages.map((p) => {
          const isCurrent = p === currentPage;
          return (
            <Link
              key={p}
              href={buildPageUrl(p)}
              className={`w-9 h-9 rounded-lg font-bold text-xs flex items-center justify-center transition-colors cursor-pointer ${
                isCurrent
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "border border-[#EEEEEE] bg-background hover:bg-surface-subtle text-foreground"
              }`}
              aria-current={isCurrent ? "page" : undefined}
            >
              {p}
            </Link>
          );
        })}
      </div>

      {/* Mobile Page Summary */}
      <div className="sm:hidden text-xs font-bold text-neutral-600">
        صفحه {currentPage} از {totalPages}
      </div>

      {/* Next Page */}
      {currentPage < totalPages ? (
        <Link
          href={buildPageUrl(currentPage + 1)}
          className="h-9 px-3.5 rounded-lg border border-[#EEEEEE] bg-background hover:bg-surface-subtle text-foreground text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>بعدی</span>
          <ChevronLeft className="w-4 h-4" />
        </Link>
      ) : (
        <div className="h-9 px-3.5 rounded-lg border border-[#EEEEEE] bg-surface-subtle/50 text-neutral-300 text-xs font-semibold flex items-center gap-1 cursor-not-allowed">
          <span>بعدی</span>
          <ChevronLeft className="w-4 h-4" />
        </div>
      )}
    </nav>
  );
}
