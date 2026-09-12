"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Check, ShoppingCart } from "lucide-react";

export interface AddToCartSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
  productImage?: string;
  selectedVariantSummary?: string;
  quantity: number;
}

export function AddToCartSuccessModal({
  isOpen,
  onClose,
  productTitle,
  productImage,
  selectedVariantSummary,
  quantity,
}: AddToCartSuccessModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Scroll Lock
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    // Focus close button
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    // Escape Key Listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-modal-title"
    >
      <div
        className="bg-background border border-border-product rounded-2xl shadow-2xl w-full max-w-md flex flex-col p-5 sm:p-6 relative animate-scale-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-border-product/60">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-base">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h2 id="cart-modal-title" className="text-foreground font-bold text-sm sm:text-base">
              افزوده شد به سبد خرید
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="w-8 h-8 rounded-full bg-surface-subtle hover:bg-border-product text-muted hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content / Product Summary */}
        <div className="py-4 flex flex-col gap-3.5">
          <p className="text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200/60 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>محصول با موفقیت به سبد خرید شما اضافه شد.</span>
          </p>

          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-surface-subtle/70 border border-border-product">
            {productImage && (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-border-product bg-background">
                <Image
                  src={productImage}
                  alt={productTitle}
                  fill
                  sizes="64px"
                  className="object-cover object-center"
                />
              </div>
            )}
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">
                {productTitle}
              </h3>
              {selectedVariantSummary && (
                <span className="text-[11px] text-muted truncate">
                  {selectedVariantSummary}
                </span>
              )}
              <span className="text-xs font-semibold text-muted">
                تعداد: <span className="text-foreground font-bold">{quantity}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action CTAs - Single Full-Width Primary CTA */}
        <div className="pt-2">
          <Link
            href="/cart"
            onClick={onClose}
            className="w-full h-12 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2.5 hover:bg-primary/90 transition-all active:scale-98 shadow-md cursor-pointer"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>مشاهده سبد خرید</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
