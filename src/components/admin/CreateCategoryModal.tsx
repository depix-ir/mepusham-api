"use client";

import React, { useState, useEffect, useId } from "react";
import { X, Plus, ChevronDown, AlertCircle, Loader2 } from "lucide-react";
import { useProducts } from "@/context/ProductContext";
import { ProductCategory } from "@/types/product";
import { useToast } from "@/components/ui/Toast";
import { ImagePicker } from "@/components/admin/ImagePicker";

export interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCategory: ProductCategory) => void;
}

export function CreateCategoryModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCategoryModalProps) {
  const modalId = useId();
  const { categories, addCategory } = useProducts();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [parentId, setParentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setName("");
      setSelectedImageUrl("");
      setParentId("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmedName = name.trim();
  const isNameEmpty = trimmedName.length === 0;
  const isImageEmpty = !selectedImageUrl;
  const isDuplicateName = categories.some(
    (c) => c.name.trim().toLowerCase() === trimmedName.toLowerCase()
  );

  let validationError: string | null = null;
  if (isNameEmpty) {
    validationError = "نام دسته‌بندی را وارد کنید.";
  } else if (isDuplicateName) {
    validationError = "این دسته‌بندی قبلاً وجود دارد.";
  } else if (isImageEmpty) {
    validationError = "تصویر دسته‌بندی را انتخاب یا آپلود کنید.";
  }

  const isValid = !validationError && !isSubmitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const slug = trimmedName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\u0600-\u06FF-]/g, "");

      const newCat: ProductCategory = {
        id: `cat-${Date.now()}`,
        name: trimmedName,
        slug: slug || `cat-${Date.now()}`,
        imageUrl: selectedImageUrl,
        parentId: parentId || undefined,
        isActive: true,
      };

      const added = addCategory(newCat);
      showToast(`دسته‌بندی «${added.name}» با موفقیت ایجاد شد.`, "success");
      onSuccess(added);
      onClose();
    } catch (err) {
      showToast("خطا در ایجاد دسته‌بندی. لطفاً دوباره تلاش کنید.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${modalId}-title`}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Main Container / Bottom Sheet on mobile, Dialog on desktop */}
      <div className="relative bg-background border border-border sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col z-10 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-200 rounded-t-2xl sm:rounded-t-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 id={`${modalId}-title`} className="text-base font-bold text-foreground">
            ایجاد دسته‌بندی جدید
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Category Name */}
          <div>
            <label className="block font-bold text-foreground mb-1.5">
              نام دسته‌بندی <span className="text-error">*</span>
            </label>
            <input
              type="text"
              placeholder="مثلاً: ساعت زنانه"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full h-10 px-3.5 bg-surface-subtle border rounded-lg text-foreground focus:outline-none focus:border-primary text-xs font-medium transition-colors ${
                isDuplicateName ? "border-error focus:border-error" : "border-border/80"
              }`}
            />
            {isDuplicateName && (
              <p className="mt-1 text-[11px] text-error flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>این دسته‌بندی قبلاً وجود دارد.</span>
              </p>
            )}
          </div>

          {/* Category Image Picker using Shared ImagePicker (Single Upload / Gallery) */}
          <div>
            <ImagePicker
              multiple={false}
              value={selectedImageUrl}
              onChange={setSelectedImageUrl}
              label="تصویر دسته‌بندی"
              required
            />
          </div>

          {/* Parent Category (Optional) */}
          <div>
            <label className="block font-bold text-foreground mb-1.5">
              دسته‌بندی والد (اختیاری)
            </label>
            <div className="relative">
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full h-10 px-3.5 bg-surface-subtle border border-border/80 rounded-lg text-foreground focus:outline-none focus:border-primary font-medium text-xs appearance-none"
              >
                <option value="">بدون والد</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Validation Status Hint */}
          {validationError && (
            <div className="p-2.5 rounded-lg bg-surface-subtle border border-border text-[11px] text-muted-foreground flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 px-4 rounded-lg bg-surface-subtle hover:bg-surface-muted text-foreground font-bold transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className={`h-10 px-5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-xs ${
                isValid
                  ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                  : "bg-surface-muted text-muted-foreground opacity-60 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال ایجاد...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>ایجاد دسته‌بندی</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
