"use client";

import React, { useState } from "react";
import { X, Bell, Check } from "lucide-react";

export interface NotifyMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
  variantLabel?: string;
}

export function NotifyMeModal({
  isOpen,
  onClose,
  productTitle,
  variantLabel,
}: NotifyMeModalProps) {
  const [contact, setContact] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setContact("");
      onClose();
    }, 2200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-background border border-border-product rounded-2xl shadow-xl w-full max-w-md flex flex-col p-5 sm:p-6 relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-border-product">
          <div className="flex items-center gap-2 text-primary font-bold text-base sm:text-lg">
            <Bell className="w-5 h-5" />
            <span>اطلاع‌رسانی موجودی</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="w-8 h-8 rounded-full bg-surface-subtle hover:bg-border-product text-foreground flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Check className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-foreground">
              درخواست شما با موفقیت ثبت شد!
            </p>
            <p className="text-xs text-muted">
              به محض موجود شدن {productTitle} به شما اطلاع خواهیم داد.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="py-4 flex flex-col gap-4">
            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
              با ثبت شماره موبایل یا ایمیل خود، به محض موجود شدن{" "}
              <span className="font-bold text-foreground">{productTitle}</span>
              {variantLabel ? ` (تنوع: ${variantLabel})` : ""} با پیامک به شما اطلاع‌رسانی می‌شود.
            </p>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="notify-input" className="text-xs font-semibold text-foreground">
                شماره همراه یا ایمیل
              </label>
              <input
                id="notify-input"
                type="text"
                required
                placeholder="مثال: 09123456789"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-border-product bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors text-left dir-ltr"
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all active:scale-98 shadow-md mt-1 cursor-pointer"
            >
              ثبت درخواست اطلاع‌رسانی
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
