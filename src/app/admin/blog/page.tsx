"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Edit2,
  Eye,
  Archive,
  Send,
  BookOpen,
  Filter,
  Clock,
} from "lucide-react";
import { blogService } from "@/lib/blog/blogService";
import { BlogPost, BlogCategory, BlogTag, BlogPostStatus } from "@/types/blog";
import { routes } from "@/lib/routes";
import { useToast } from "@/components/ui/Toast";

export default function AdminBlogListPage() {
  const { showToast } = useToast();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const loadData = () => {
    const cats = blogService.getCategories();
    setCategories(cats);

    const allTags = blogService.getTags();
    setTags(allTags);

    const result = blogService.getAdminPosts({
      status: statusFilter === "all" ? undefined : (statusFilter as BlogPostStatus),
      categoryId: categoryFilter === "all" ? undefined : categoryFilter,
      searchQuery: searchQuery.trim() || undefined,
      pageSize: 100,
    });
    setPosts(result.posts);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = blogService.subscribe(loadData);
    return () => unsubscribe();
  }, [statusFilter, categoryFilter, searchQuery]);

  const categoryMap = new Map(categories.map((c) => [c.id, c.title]));
  const tagMap = new Map(tags.map((t) => [t.id, t.title]));

  const handleStatusToggle = (post: BlogPost) => {
    try {
      const nextStatus = post.status === "published" ? "draft" : "published";
      blogService.updatePost(post.id, { status: nextStatus });
      showToast(
        nextStatus === "published" ? "مقاله منتشر شد." : "مقاله به پیش‌نویس تغییر یافت.",
        "success"
      );
    } catch (err: any) {
      showToast(err?.message || "خطا در تغییر وضعیت مقاله", "error");
    }
  };

  const handleArchive = (id: string) => {
    try {
      blogService.archivePost(id);
      showToast("مقاله آرشیو شد.", "success");
    } catch (err: any) {
      showToast(err?.message || "خطا در آرشیو مقاله", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span>مدیریت مقالات وبلاگ</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            ایجاد، ویرایش، دسته بندی و انتشار مقالات فروشگاه
          </p>
        </div>

        <Link
          href={routes.admin.blogNew}
          className="h-9 px-4 rounded-lg bg-primary text-primary-foreground font-bold text-xs hover:bg-primary-hover flex items-center justify-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن مقاله جدید</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-background border border-border rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="جستجو در عنوان مقاله..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pr-9 pl-3 bg-surface-subtle border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
            />
            <Search className="w-4 h-4 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: "all", title: "همه" },
              { id: "published", title: "منتشر شده" },
              { id: "draft", title: "پیش‌نویس" },
              { id: "archived", title: "آرشیو شده" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-surface-subtle text-foreground hover:bg-neutral-200/60"
                }`}
              >
                {tab.title}
              </button>
            ))}
          </div>

          {/* Category Filter Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 px-3 bg-surface-subtle border border-border rounded-lg text-xs font-bold text-foreground"
          >
            <option value="all">همه دسته‌بندی‌ها</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ARTICLES LIST (TABLE ON DESKTOP, CARDS ON MOBILE) */}
      {posts.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-xl bg-surface-subtle/40">
          <BookOpen className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm font-bold text-foreground">هیچ مقاله‌ای یافت نشد.</p>
          <p className="text-xs text-muted-foreground mt-1">
            می‌توانید با دکمه بالا یک مقاله جدید ایجاد کنید.
          </p>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden md:block border border-border rounded-xl overflow-hidden bg-background">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-surface-subtle border-b border-border text-foreground font-bold">
                  <th className="p-3.5">تصویر</th>
                  <th className="p-3.5">عنوان مقاله</th>
                  <th className="p-3.5">دسته‌بندی</th>
                  <th className="p-3.5">تگ‌ها</th>
                  <th className="p-3.5">وضعیت</th>
                  <th className="p-3.5">تاریخ انتشار</th>
                  <th className="p-3.5 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {posts.map((post) => {
                  const categoryTitle = categoryMap.get(post.categoryId) || "دسته‌بندی نشده";
                  const postTags = post.tagIds.map((tid) => tagMap.get(tid)).filter(Boolean);
                  const publishedDate = post.publishedAt || post.createdAt;
                  const formattedDate = new Date(publishedDate).toLocaleDateString("fa-IR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <tr key={post.id} className="hover:bg-surface-subtle/50 transition-colors">
                      {/* Image */}
                      <td className="p-3.5 w-16">
                        <div className="relative w-12 h-12 rounded-lg bg-surface-subtle border border-border overflow-hidden">
                          <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </td>

                      {/* Title & Slug */}
                      <td className="p-3.5">
                        <div className="font-bold text-foreground text-xs line-clamp-1">
                          {post.title}
                        </div>
                        <div className="text-[10px] text-muted-foreground dir-ltr text-right truncate max-w-[200px]">
                          /{post.slug}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3.5 font-medium text-foreground">
                        {categoryTitle}
                      </td>

                      {/* Tags */}
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {postTags.slice(0, 2).map((t, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-surface-subtle text-[10px] font-semibold text-muted-foreground"
                            >
                              #{t}
                            </span>
                          ))}
                          {postTags.length > 2 && (
                            <span className="text-[10px] text-neutral-400">
                              +{postTags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="p-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            post.status === "published"
                              ? "bg-emerald-100 text-emerald-800"
                              : post.status === "draft"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-neutral-200 text-neutral-700"
                          }`}
                        >
                          {post.status === "published" && "منتشر شده"}
                          {post.status === "draft" && "پیش‌نویس"}
                          {post.status === "archived" && "آرشیو شده"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="p-3.5 text-muted-foreground font-mono text-[11px]">
                        {formattedDate}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          {post.status === "published" && (
                            <Link
                              href={routes.blog.detail(post.slug)}
                              target="_blank"
                              className="p-1.5 rounded-lg border border-border bg-background hover:bg-surface-subtle text-foreground transition-colors"
                              title="مشاهده در سایت"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                          )}

                          <Link
                            href={routes.admin.blogEdit(post.id)}
                            className="p-1.5 rounded-lg border border-border bg-background hover:border-primary text-primary transition-colors"
                            title="ویرایش مقاله"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => handleStatusToggle(post)}
                            className="p-1.5 rounded-lg border border-border bg-background hover:bg-surface-subtle text-foreground transition-colors cursor-pointer"
                            title={post.status === "published" ? "تغییر به پیش‌نویس" : "انتشار فوری"}
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>

                          {post.status !== "archived" && (
                            <button
                              onClick={() => handleArchive(post.id)}
                              className="p-1.5 rounded-lg border border-border bg-background hover:bg-error/10 text-error transition-colors cursor-pointer"
                              title="آرشیو مقاله"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARD VIEW */}
          <div className="md:hidden space-y-3">
            {posts.map((post) => {
              const categoryTitle = categoryMap.get(post.categoryId) || "دسته‌بندی نشده";

              return (
                <div
                  key={post.id}
                  className="p-3.5 bg-background border border-border rounded-xl space-y-3"
                >
                  <div className="flex gap-3">
                    <div className="relative w-16 h-16 rounded-lg bg-surface-subtle border border-border overflow-hidden shrink-0">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-primary block mb-0.5">
                        {categoryTitle}
                      </span>
                      <h3 className="font-bold text-xs text-foreground line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold mt-1.5 ${
                          post.status === "published"
                            ? "bg-emerald-100 text-emerald-800"
                            : post.status === "draft"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-neutral-200 text-neutral-700"
                        }`}
                      >
                        {post.status === "published" && "منتشر شده"}
                        {post.status === "draft" && "پیش‌نویس"}
                        {post.status === "archived" && "آرشیو شده"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <Link
                      href={routes.admin.blogEdit(post.id)}
                      className="h-8 px-3 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>ویرایش</span>
                    </Link>

                    {post.status === "published" && (
                      <Link
                        href={routes.blog.detail(post.slug)}
                        target="_blank"
                        className="h-8 px-3 rounded-lg border border-border text-foreground font-bold text-xs flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>مشاهده</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
