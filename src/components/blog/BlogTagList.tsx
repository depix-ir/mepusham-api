"use client";

import React from "react";
import Link from "next/link";
import { Tag as TagIcon } from "lucide-react";
import { BlogTag } from "@/types/blog";
import { routes } from "@/lib/routes";

interface BlogTagListProps {
  tags: BlogTag[];
}

export function BlogTagList({ tags }: BlogTagListProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-6 mt-8 border-t border-[#EEEEEE]">
      <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 ml-2">
        <TagIcon className="w-3.5 h-3.5 text-neutral-400" />
        <span>تگ‌ها:</span>
      </div>

      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={routes.blog.tag(tag.slug)}
          className="px-3 py-1 rounded-md bg-surface-subtle hover:bg-neutral-200/80 text-foreground text-xs font-medium transition-colors cursor-pointer"
        >
          #{tag.title}
        </Link>
      ))}
    </div>
  );
}
