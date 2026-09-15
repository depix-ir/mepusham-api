"use client";

import React, { useState, useEffect, useId } from "react";
import { X, Plus, AlertCircle, Loader2 } from "lucide-react";
import { useProducts } from "@/context/ProductContext";
import { ProductBrand } from "@/types/product";
import { useToast } from "@/components/ui/Toast";
import { ImagePicker } from "@/components/admin/ImagePicker";

export interface CreateBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBrand: ProductBrand) => void;
}

export function CreateBrandModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateBrandModalProps) {
  const modalId = useId();
  const { brands, addBrand } = useProducts();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setLogoUrl("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  const trimmedName = name.trim();
  const isNameEmpty = trimmedName.length === 0;
  const isDuplicateName = brands.some(
    (b) => b.name.trim().toLowerCase() === trimmedName.toLowerCase()
  );

  let validationError: string | null = null;
  if (isNameEmpty) {
    validationError = "نام برند را وارد کنید.";
  } else if (isDuplicateName) {
    validationError = "برندی با این نام قبلاً ثبت شده است.";
  } else if (!logoUrl) {
    validationError = "تصویر برند را انتخاب یا آپلود کنید.";
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

      const newBrand: ProductBrand = {
        id: `brand-${Date.now()}`,
        name: trimmedName,
        slug: slug || `brand-${Date.now()}`,
        logo: logoUrl,
      };

      const added = addBrand(newBrand);
      showToast(`برند «${added.name}» با موفقیت ایجاد شد.`, "success");
      onSuccess(added);
      onClose();
    } catch (err) {
      showToast("خطا در ایجاد برند. لطفاً دوباره تلاش کنید.", "error");
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
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-background border border-border sm:rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col z-10 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-200 rounded-t-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 id={`${modalId}-title`} className="text-base font-bold text-foreground">
            ایجاد برند جدید
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          <div>
            <label className="block font-bold text-foreground mb-1.5">
              نام برند <span className="text-error">*</span>
            </label>
            <input
              type="text"
              placeholder="مثلاً: چرم مشهد"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full h-10 px-3.5 bg-surface-subtle border rounded-lg text-foreground focus:outline-none focus:border-primary text-xs font-medium transition-colors ${
                isDuplicateName ? "border-error" : "border-border/80"
              }`}
            />
            {isDuplicateName && (
              <p className="mt-1 text-[11px] text-error flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>این نام برند قبلاً استفاده شده است.</span>
              </p>
            )}
          </div>

          <div>
            <ImagePicker
              multiple={false}
              value={logoUrl}
              onChange={setLogoUrl}
              label="تصویر / لوگوی برند"
              required
            />
          </div>

          {validationError && (
            <div className="p-2.5 rounded-lg bg-surface-subtle border border-border text-[11px] text-muted-foreground flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

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
                  <span>ایجاد برند</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
