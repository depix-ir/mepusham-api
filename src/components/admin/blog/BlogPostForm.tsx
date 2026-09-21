"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Save, Send, Archive, AlertTriangle } from "lucide-react";
import { BlogPost, BlogCategory, BlogTag, BlogPostStatus, BlogContentBlock } from "@/types/blog";
import { blogService } from "@/lib/blog/blogService";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { BlogCategoryPicker } from "./BlogCategoryPicker";
import { BlogTagPicker } from "./BlogTagPicker";
import { BlogBlockEditor } from "./BlogBlockEditor";
import { useToast } from "@/components/ui/Toast";
import { routes } from "@/lib/routes";

interface BlogPostFormProps {
  initialData?: BlogPost | null;
}

export function BlogPostForm({ initialData }: BlogPostFormProps) {
  const router = RouterHook();
  const { showToast } = useToast();

  const isEdit = !!initialData;

  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);

  // Form Fields
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [tagIds, setTagIds] = useState<string[]>(initialData?.tagIds || []);
  const [authorName, setAuthorName] = useState(initialData?.authorName || "تیم محتوای مپوشــــم");
  const [status, setStatus] = useState<BlogPostStatus>(initialData?.status || "draft");
  const [publishedAt, setPublishedAt] = useState(
    initialData?.publishedAt
      ? new Date(initialData.publishedAt).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);
  const [content, setContent] = useState<BlogContentBlock[]>(
    initialData?.content || [{ type: "paragraph", text: "" }]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  const loadData = () => {
    setCategories(blogService.getCategories());
    setTags(blogService.getTags());
  };

  useEffect(() => {
    loadData();
  }, []);

  function RouterHook() {
    return useRouter();
  }

  const slugify = (text: string) => {
    return text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\u0600-\u06FF-]+/g, "");
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit && (!slug || slug === slugify(title))) {
      setSlug(slugify(val));
    }
  };

  const handleSubmit = (targetStatus?: BlogPostStatus) => {
    const finalStatus = targetStatus || status;

    if (!title.trim()) {
      showToast("عنوان مقاله الزامی است.", "error");
      return;
    }
    if (!slug.trim()) {
      showToast("نام مستعار (Slug) الزامی است.", "error");
      return;
    }
    if (!coverImage) {
      showToast("انتخاب تصویر اصلی مقاله الزامی است.", "error");
      return;
    }
    if (!categoryId) {
      showToast("انتخاب دسته‌بندی مقاله الزامی است.", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEdit && initialData) {
        blogService.updatePost(initialData.id, {
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim(),
          coverImage,
          categoryId,
          tagIds,
          authorName: authorName.trim() || undefined,
          status: finalStatus,
          publishedAt: new Date(publishedAt).toISOString(),
          isFeatured,
          content,
        });

        showToast("تغییرات مقاله با موفقیت ذخیره شد.", "success");
        router.push(routes.admin.blog);
      } else {
        blogService.createPost({
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim(),
          coverImage,
          categoryId,
          tagIds,
          authorName: authorName.trim() || undefined,
          status: finalStatus,
          publishedAt: new Date(publishedAt).toISOString(),
          isFeatured,
          content,
        });

        showToast("مقاله جدید با موفقیت ایجاد شد.", "success");
        router.push(routes.admin.blog);
      }
    } catch (err: any) {
      showToast(err?.message || "خطا در ثبت مقاله", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = () => {
    if (!initialData) return;
    try {
      blogService.archivePost(initialData.id);
      showToast("مقاله آرشیو شد.", "success");
      router.push(routes.admin.blog);
    } catch (err: any) {
      showToast(err?.message || "خطا در آرشیو مقاله", "error");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Page Header Bar */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(routes.admin.blog)}
            className="p-2 rounded-lg border border-border bg-background hover:bg-surface-subtle text-foreground transition-colors cursor-pointer"
            title="بازگشت به لیست مقالات"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-foreground">
              {isEdit ? `ویرایش مقاله: ${initialData?.title}` : "ایجاد مقاله جدید"}
            </h1>
            <p className="text-xs text-muted-foreground">
              تکمیل فرم و بخش‌های مقاله وبلاگ
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {status !== "published" && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit("draft")}
              className="h-9 px-4 rounded-lg border border-border bg-background hover:bg-surface-subtle text-foreground text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>ذخیره پیش‌نویس</span>
            </button>
          )}

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit("published")}
            className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-hover flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isEdit ? "ذخیره و انتشار" : "انتشار مقاله"}</span>
          </button>

          {isEdit && status !== "archived" && (
            <button
              type="button"
              onClick={() => setShowArchiveConfirm(true)}
              className="h-9 px-3 rounded-lg border border-border bg-background hover:bg-error/10 text-error text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="آرشیو مقاله"
            >
              <Archive className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">آرشیو</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main Content Area (8 cols) */}
        <div className="md:col-span-8 space-y-6">
          {/* Title */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-foreground">
              عنوان مقاله <span className="text-error">*</span>
            </label>
            <input
              type="text"
              placeholder="مثلاً: راهنمای انتخاب بهترین ساعت زنانه"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full h-10 px-3 bg-surface-subtle border border-border rounded-lg text-xs font-bold text-foreground focus:outline-none focus:border-primary"
              required
            />
          </div>

          {/* Slug */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-foreground">
              نام مستعار پیوند (Slug) <span className="text-error">*</span>
            </label>
            <input
              type="text"
              placeholder="مثلاً: women-watch-guide"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full h-9 px-3 bg-surface-subtle border border-border rounded-lg text-xs text-foreground dir-ltr focus:outline-none focus:border-primary"
              required
            />
          </div>

          {/* Excerpt */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-foreground">
              خلاصه مقاله (Excerpt)
            </label>
            <textarea
              rows={3}
              placeholder="خلاصه‌ای جذاب و چند خطی از موضوع مقاله برای نمایش در کارت‌ها و نتیجه گوگل..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full p-3 bg-surface-subtle border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary leading-relaxed"
            />
          </div>

          {/* Block Content Editor */}
          <BlogBlockEditor value={content} onChange={setContent} />
        </div>

        {/* Sidebar Settings (4 cols) */}
        <div className="md:col-span-4 space-y-6">
          {/* Cover Image */}
          <div className="p-4 bg-background border border-border rounded-xl space-y-3">
            <ImagePicker
              value={coverImage}
              onChange={setCoverImage}
              label="تصویر اصلی مقاله (Cover Image)"
              required
            />
          </div>

          {/* Category & Tags */}
          <div className="p-4 bg-background border border-border rounded-xl space-y-4">
            <BlogCategoryPicker
              categories={categories}
              value={categoryId}
              onChange={setCategoryId}
              onCategoryCreated={loadData}
              required
            />

            <BlogTagPicker
              tags={tags}
              value={tagIds}
              onChange={setTagIds}
              onTagCreated={loadData}
            />
          </div>

          {/* Status & Settings */}
          <div className="p-4 bg-background border border-border rounded-xl space-y-4 text-xs">
            <h3 className="font-bold text-foreground border-b border-border pb-2">
              تنظیمات انتشار
            </h3>

            <div>
              <label className="block font-bold text-foreground mb-1">وضعیت مقاله</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BlogPostStatus)}
                className="w-full h-9 px-3 bg-surface-subtle border border-border rounded-lg text-foreground font-bold"
              >
                <option value="draft">پیش‌نویس (Draft)</option>
                <option value="published">منتشرشده (Published)</option>
                <option value="archived">آرشیو شده (Archived)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">تاریخ انتشار</label>
              <input
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full h-9 px-3 bg-surface-subtle border border-border rounded-lg text-foreground dir-ltr"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">نام نویسنده</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="نام نویسنده..."
                className="w-full h-9 px-3 bg-surface-subtle border border-border rounded-lg text-foreground"
              />
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <input
                type="checkbox"
                id="isFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              <label htmlFor="isFeatured" className="font-bold text-foreground cursor-pointer">
                نمایش در اسلایدر منتخب بالای وبلاگ
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ARCHIVE CONFIRMATION MODAL */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowArchiveConfirm(false)}
          />
          <div className="relative bg-background border border-border rounded-xl shadow-xl w-full max-w-md z-10 p-5 space-y-4 text-xs animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 font-bold text-sm text-error">
              <AlertTriangle className="w-5 h-5" />
              <span>تأیید آرشیو مقاله</span>
            </div>

            <p className="text-foreground leading-relaxed">
              آیا از آرشیو کردن مقاله «{initialData?.title}» اطمینان دارید؟ با آرشیو کردن، این مقاله دیگر در سایت نمایش داده نخواهد شد.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowArchiveConfirm(false)}
                className="h-9 px-4 rounded-lg bg-surface-subtle font-bold text-foreground hover:bg-neutral-200/70"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleArchive}
                className="h-9 px-4 rounded-lg bg-error text-white font-bold hover:bg-error/90"
              >
                تأیید و آرشیو
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
