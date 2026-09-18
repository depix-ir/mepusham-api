"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  Upload,
  Image as ImageIcon,
  X,
  Check,
  Trash2,
  MoveRight,
  MoveLeft,
  Star,
  Loader2,
  AlertCircle,
  Plus,
} from "lucide-react";
import { uploadMediaFile, revokeMediaObjectUrl } from "@/lib/media/uploadService";
import { useToast } from "@/components/ui/Toast";

export const PRESET_GALLERY_IMAGES = [
  { id: "img-1", url: "/images/bag-1.webp", title: "کیف چرم 1" },
  { id: "img-2", url: "/images/bag-2.webp", title: "کیف چرم 2" },
  { id: "img-3", url: "/images/sandal-1.webp", title: "صندل تابستانه" },
  { id: "img-4", url: "/images/watch-1.webp", title: "ساعت مچی" },
  { id: "img-5", url: "/images/woman-high-heels-1.webp", title: "کفش مجلسی" },
  { id: "img-6", url: "/images/category-1.webp", title: "کاور پوشاک" },
  { id: "img-7", url: "/images/category-2.webp", title: "کاور کفش" },
  { id: "img-8", url: "/images/category-3.webp", title: "کاور کیف" },
  { id: "img-9", url: "/images/category-4.webp", title: "کاور اکسسوری" },
  { id: "img-10", url: "/images/tag-1.webp", title: "تگ تخفیف" },
  { id: "img-11", url: "/images/tag-2.webp", title: "تگ جدید" },
];

export interface ImagePickerSingleProps {
  multiple?: false;
  value: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
}

export interface ImagePickerMultipleProps {
  multiple: true;
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  required?: boolean;
}

export type ImagePickerProps = ImagePickerSingleProps | ImagePickerMultipleProps;

export function ImagePicker(props: ImagePickerProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);

  const isMultiple = props.multiple === true;
  const singleValue = !isMultiple ? (props.value as string) : "";
  const multipleValue = isMultiple ? (props.value as string[]) || [] : [];

  // Handle File Upload from Device
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMsg(null);
    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map((file) => uploadMediaFile(file));
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map((r) => r.url);

      if (isMultiple) {
        props.onChange([...multipleValue, ...newUrls]);
        showToast(`${newUrls.length} تصویر جدید آپلود شد.`, "success");
      } else {
        if (singleValue) {
          revokeMediaObjectUrl(singleValue);
        }
        props.onChange(newUrls[0]);
        showToast("تصویر با موفقیت آپلود شد.", "success");
      }
    } catch (err: any) {
      const msg = err?.message || "خطا در آپلود تصویر.";
      setErrorMsg(msg);
      showToast(msg, "error");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  // Remove Image
  const handleRemoveImage = (indexOrUrl: number | string) => {
    if (isMultiple) {
      const index = typeof indexOrUrl === "number" ? indexOrUrl : multipleValue.indexOf(indexOrUrl);
      if (index !== -1) {
        const removedUrl = multipleValue[index];
        revokeMediaObjectUrl(removedUrl);
        const updated = multipleValue.filter((_, i) => i !== index);
        props.onChange(updated);
      }
    } else {
      if (singleValue) {
        revokeMediaObjectUrl(singleValue);
      }
      props.onChange("");
    }
  };

  // Reorder Images (Move left / right)
  const handleMoveImage = (index: number, direction: "prev" | "next") => {
    if (!isMultiple) return;
    const targetIndex = direction === "prev" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= multipleValue.length) return;

    const newArr = [...multipleValue];
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;
    props.onChange(newArr);
  };

  // Set Primary Image
  const handleSetPrimary = (index: number) => {
    if (!isMultiple || index === 0) return;
    const newArr = [...multipleValue];
    const [primary] = newArr.splice(index, 1);
    newArr.unshift(primary);
    props.onChange(newArr);
  };

  // Gallery Select
  const handleSelectGallery = (url: string) => {
    if (isMultiple) {
      if (!multipleValue.includes(url)) {
        props.onChange([...multipleValue, url]);
      }
    } else {
      props.onChange(url);
      setIsGalleryModalOpen(false);
    }
  };

  // Custom URL Submit
  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    const url = customUrlInput.trim();
    if (isMultiple) {
      props.onChange([...multipleValue, url]);
    } else {
      props.onChange(url);
      setIsGalleryModalOpen(false);
    }
    setCustomUrlInput("");
    setShowCustomUrlInput(false);
  };

  return (
    <div className="space-y-3 text-xs">
      {props.label && (
        <label className="block font-bold text-foreground">
          {props.label} {props.required && <span className="text-error">*</span>}
        </label>
      )}

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml"
        multiple={isMultiple}
        className="hidden"
      />

      {/* SINGLE IMAGE MODE */}
      {!isMultiple && (
        <div>
          {singleValue ? (
            <div className="p-3 bg-surface-subtle border border-border rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-16 h-16 rounded-lg border border-border bg-background relative overflow-hidden shrink-0">
                  <Image src={singleValue} alt="Preview" fill className="object-cover" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-foreground text-xs">تصویر انتخاب‌شده</span>
                  <span className="text-[10px] text-muted-foreground truncate dir-ltr text-right">
                    {singleValue}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="h-8 px-2.5 rounded-lg bg-background border border-border hover:border-primary text-primary font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>فایل‌های دستگاه</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsGalleryModalOpen(true)}
                  className="h-8 px-2.5 rounded-lg bg-background border border-border hover:border-primary text-foreground font-semibold text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ImageIcon className="w-3 h-3 text-primary" />
                  <span>عکس‌های سایت</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(singleValue)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-border hover:border-primary/60 rounded-xl p-5 text-center bg-surface-subtle/50 hover:bg-surface-subtle transition-colors flex flex-col items-center justify-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
              </div>

              <p className="font-bold text-xs text-foreground">انتخاب یا آپلود تصویر</p>

              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="h-9 px-4 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary-hover flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>انتخاب از فایل‌های دستگاه</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsGalleryModalOpen(true)}
                  className="h-9 px-4 rounded-lg bg-background border border-border hover:border-primary text-foreground font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ImageIcon className="w-4 h-4 text-primary" />
                  <span>انتخاب از عکس‌های سایت</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MULTIPLE IMAGES MODE (Product Gallery) */}
      {isMultiple && (
        <div className="space-y-3">
          {/* Action buttons bar */}
          <div className="flex flex-wrap items-center gap-2.5 p-3 bg-surface-subtle border border-border rounded-xl">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="h-9 px-4 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary-hover flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>انتخاب از فایل‌های دستگاه</span>
            </button>

            <button
              type="button"
              onClick={() => setIsGalleryModalOpen(true)}
              className="h-9 px-4 rounded-lg bg-background border border-border hover:border-primary text-foreground font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ImageIcon className="w-4 h-4 text-primary" />
              <span>انتخاب از عکس‌های سایت</span>
            </button>
          </div>

          {/* Grid of Product Images */}
          {multipleValue.length === 0 ? (
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-surface-subtle/30 text-muted-foreground space-y-1">
              <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="font-bold text-xs">هنوز تصویری اضافه نشده است.</p>
              <p className="text-[11px]">با دکمه‌های بالا تصاویر محصول را اضافه کنید.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-1">
              {multipleValue.map((url, idx) => {
                const isPrimary = idx === 0;
                return (
                  <div
                    key={`${url}-${idx}`}
                    className={`group relative rounded-xl border-2 overflow-hidden bg-surface-subtle transition-all aspect-square flex flex-col justify-between ${
                      isPrimary
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <Image src={url} alt={`Product ${idx}`} fill className="object-cover" />

                    {/* Badge header */}
                    <div className="relative z-10 p-1.5 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
                      {isPrimary ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shadow-xs">
                          <Star className="w-3 h-3 fill-current" />
                          <span>اصلی</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(idx)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 hover:bg-black/80 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"
                        >
                          <span>اصلی شود</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-1 rounded-full bg-black/60 hover:bg-error text-white transition-colors"
                        title="حذف"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Footer controls for reordering */}
                    <div className="relative z-10 p-1.5 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleMoveImage(idx, "prev")}
                        disabled={idx === 0}
                        className="p-1 rounded bg-black/60 hover:bg-black/90 text-white disabled:opacity-30"
                        title="انتقال به جلو"
                      >
                        <MoveRight className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] text-white font-mono font-bold">
                        #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleMoveImage(idx, "next")}
                        disabled={idx === multipleValue.length - 1}
                        className="p-1 rounded bg-black/60 hover:bg-black/90 text-white disabled:opacity-30"
                        title="انتقال به عقب"
                      >
                        <MoveLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ERROR MESSAGE */}
      {errorMsg && (
        <div className="p-2.5 rounded-lg bg-error/10 border border-error/30 text-error flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SHARED GALLERY PICKER MODAL */}
      {isGalleryModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setIsGalleryModalOpen(false)}
          />
          <div className="relative bg-background border border-border rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col z-10 overflow-hidden animate-in zoom-in-95 duration-150 text-xs">
            {/* Gallery Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <ImageIcon className="w-4 h-4 text-primary" />
                <span>گالری تصاویر</span>
              </div>
              <button
                type="button"
                onClick={() => setIsGalleryModalOpen(false)}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface-subtle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Gallery Content */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <p className="text-muted-foreground">
                تصویر مورد نظر را از گالری آماده انتخاب کنید:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {PRESET_GALLERY_IMAGES.map((img) => {
                  const isSelected = isMultiple
                    ? multipleValue.includes(img.url)
                    : singleValue === img.url;
                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => handleSelectGallery(img.url)}
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
                {!showCustomUrlInput ? (
                  <button
                    type="button"
                    onClick={() => setShowCustomUrlInput(true)}
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
                        placeholder="مثلاً: /images/bag-1.webp"
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
                onClick={() => setIsGalleryModalOpen(false)}
                className="h-9 px-4 rounded-lg bg-background border border-border font-bold text-foreground hover:bg-surface-subtle"
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
