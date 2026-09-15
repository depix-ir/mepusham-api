"use client";

import React, { useState, useEffect, useId } from "react";
import Image from "next/image";
import { X, Check, Image as ImageIcon, Plus, Trash2, ChevronDown, AlertCircle, Loader2 } from "lucide-react";
import { useProducts } from "@/context/ProductContext";
import { ProductCategory } from "@/types/product";
import { useToast } from "@/components/ui/Toast";

// Catalog of existing gallery images for category selection
const GALLERY_IMAGES = [
  { id: "cat-img-1", url: "/images/category-1.webp", title: "لباس و پوشاک" },
  { id: "cat-img-2", url: "/images/category-2.webp", title: "کفش و صندل" },
  { id: "cat-img-3", url: "/images/category-3.webp", title: "کیف و کوله" },
  { id: "cat-img-4", url: "/images/category-4.webp", title: "اکسسوری" },
  { id: "cat-img-5", url: "/images/bag-1.webp", title: "کیف چرم 1" },
  { id: "cat-img-6", url: "/images/bag-2.webp", title: "کیف چرم 2" },
  { id: "cat-img-7", url: "/images/sandal-1.webp", title: "صندل تابستانه" },
  { id: "cat-img-8", url: "/images/watch-1.webp", title: "ساعت مچی" },
  { id: "cat-img-9", url: "/images/woman-high-heels-1.webp", title: "کفش مجلسی" },
  { id: "cat-img-10", url: "/images/tag-1.webp", title: "کالکشن ویژه" },
  { id: "cat-img-11", url: "/images/tag-2.webp", title: "استایل روزانه" },
];

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
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setName("");
      setSelectedImageUrl("");
      setParentId("");
      setIsGalleryOpen(false);
      setIsSubmitting(false);
      setShowCustomInput(false);
      setCustomUrlInput("");
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
        if (isGalleryOpen) {
          setIsGalleryOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isGalleryOpen, onClose]);

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
    validationError = "تصویر دسته‌بندی را انتخاب کنید.";
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

  const handleSelectGalleryImage = (url: string) => {
    setSelectedImageUrl(url);
    setIsGalleryOpen(false);
  };

  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    setSelectedImageUrl(customUrlInput.trim());
    setCustomUrlInput("");
    setShowCustomInput(false);
    setIsGalleryOpen(false);
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

          {/* Category Image Picker Box */}
          <div>
            <label className="block font-bold text-foreground mb-1.5">
              تصویر دسته‌بندی <span className="text-error">*</span>
            </label>

            {selectedImageUrl ? (
              <div className="p-3 bg-surface-subtle border border-border rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg border border-border bg-background relative overflow-hidden shrink-0">
                    <Image
                      src={selectedImageUrl}
                      alt="تصویر دسته‌بندی"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground text-xs">تصویر انتخاب‌شده</span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[180px] sm:max-w-[220px]">
                      {selectedImageUrl}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsGalleryOpen(true)}
                    className="h-8 px-3 rounded-md bg-background border border-border hover:border-primary text-primary font-bold text-[11px] transition-colors"
                  >
                    تغییر تصویر
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedImageUrl("")}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-error hover:bg-error/10 transition-colors"
                    title="حذف تصویر"
                    aria-label="حذف تصویر"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsGalleryOpen(true)}
                className="border-2 border-dashed border-border hover:border-primary/60 rounded-xl p-6 text-center bg-surface-subtle/50 hover:bg-surface-subtle transition-colors cursor-pointer flex flex-col items-center justify-center space-y-2 group"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <span className="font-bold text-xs text-foreground">
                  + انتخاب تصویر از گالری
                </span>
                <span className="text-[11px] text-muted-foreground">
                  برای شروع کلیک کنید
                </span>
              </div>
            )}
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

      {/* GALLERY PICKER MODAL OVERLAY */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setIsGalleryOpen(false)}
          />
          <div className="relative bg-background border border-border rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col z-10 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Gallery Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <ImageIcon className="w-4 h-4 text-primary" />
                <span>انتخاب تصویر از گالری</span>
              </div>
              <button
                type="button"
                onClick={() => setIsGalleryOpen(false)}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface-subtle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Gallery Content */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              <p className="text-muted-foreground">
                یکی از تصاویر زیر را برای دسته‌بندی انتخاب کنید:
              </p>

              {/* Grid of images */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {GALLERY_IMAGES.map((img) => {
                  const isSelected = selectedImageUrl === img.url;
                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => handleSelectGalleryImage(img.url)}
                      className={`group relative aspect-square rounded-xl border-2 overflow-hidden bg-surface-subtle text-right transition-all ${
                        isSelected
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={img.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                      <span className="absolute bottom-2 right-2 left-2 text-[10px] font-bold text-white truncate">
                        {img.title}
                      </span>
                      {isSelected && (
                        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Image URL Accordion */}
              <div className="pt-2 border-t border-border">
                {!showCustomInput ? (
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(true)}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ورود آدرس مستقیم تصویر (URL)</span>
                  </button>
                ) : (
                  <div className="p-3 bg-surface-subtle border border-border rounded-xl space-y-2">
                    <label className="block font-bold text-foreground text-[11px]">
                      آدرس تصویر (URL):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="مثلاً: /images/category-1.webp یا لینک عکس"
                        value={customUrlInput}
                        onChange={(e) => setCustomUrlInput(e.target.value)}
                        className="flex-1 h-9 px-3 bg-background border border-border rounded-lg text-foreground text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCustomUrl}
                        disabled={!customUrlInput.trim()}
                        className="h-9 px-4 bg-primary text-primary-foreground font-bold rounded-lg text-xs hover:bg-primary-hover disabled:opacity-50"
                      >
                        تأیید
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Gallery Footer */}
            <div className="p-3 border-t border-border bg-surface-subtle/40 flex justify-end">
              <button
                type="button"
                onClick={() => setIsGalleryOpen(false)}
                className="h-9 px-4 rounded-lg bg-background border border-border font-bold text-foreground text-xs hover:bg-surface-subtle"
              >
                بستن گالری
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
