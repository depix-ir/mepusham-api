"use client";

import React, { useState } from "react";
import { Plus, FolderPlus, X } from "lucide-react";
import { BlogCategory } from "@/types/blog";
import { blogService } from "@/lib/blog/blogService";
import { useToast } from "@/components/ui/Toast";

interface BlogCategoryPickerProps {
  categories: BlogCategory[];
  value: string;
  onChange: (categoryId: string) => void;
  onCategoryCreated?: () => void;
  required?: boolean;
}

export function BlogCategoryPicker({
  categories,
  value,
  onChange,
  onCategoryCreated,
  required = false,
}: BlogCategoryPickerProps) {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const handleTitleChange = (val: string) => {
    setNewTitle(val);
    if (!newSlug || newSlug === slugify(newTitle)) {
      setNewSlug(slugify(val));
    }
  };

  const slugify = (text: string) => {
    return text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\u0600-\u06FF-]+/g, "");
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSlug.trim()) {
      showToast("لطفاً عنوان و اسلاگ دسته‌بندی را وارد کنید.", "error");
      return;
    }

    try {
      const created = blogService.createCategory({
        title: newTitle.trim(),
        slug: newSlug.trim(),
        description: newDesc.trim() || undefined,
        isActive: true,
      });

      showToast("دسته‌بندی جدید با موفقیت ایجاد شد.", "success");
      onChange(created.id);
      setIsModalOpen(false);
      setNewTitle("");
      setNewSlug("");
      setNewDesc("");
      if (onCategoryCreated) onCategoryCreated();
    } catch (err: any) {
      showToast(err?.message || "خطا در ایجاد دسته‌بندی", "error");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-foreground">
          دسته‌بندی مقاله {required && <span className="text-error">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>افزودن دسته‌بندی جدید</span>
        </button>
      </div>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full h-10 px-3 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
      >
        <option value="">انتخاب دسته‌بندی...</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title} {!c.isActive ? "(غیرفعال)" : ""}
          </option>
        ))}
      </select>

      {/* CREATE CATEGORY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-background border border-border rounded-xl shadow-xl w-full max-w-md z-10 p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <FolderPlus className="w-4 h-4 text-primary" />
                <span>ایجاد دسته‌بندی جدید وبلاگ</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface-subtle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">
                  عنوان دسته‌بندی <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثلاً: راهنمای انتخاب ساعت"
                  value={newTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full h-9 px-3 bg-surface-subtle border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">
                  نام مستعار (Slug) <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثلاً: watch-guide"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  className="w-full h-9 px-3 bg-surface-subtle border border-border rounded-lg text-foreground dir-ltr focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">
                  توضیحات کوتاه
                </label>
                <textarea
                  rows={2}
                  placeholder="توضیح کوتاه درباره این دسته‌بندی..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2.5 bg-surface-subtle border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 px-4 rounded-lg bg-surface-subtle font-bold text-foreground hover:bg-neutral-200/70"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary-hover shadow-xs"
                >
                  ایجاد دسته‌بندی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
