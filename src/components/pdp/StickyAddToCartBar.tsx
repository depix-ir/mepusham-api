"use client";

import React, { useState } from "react";
import { formatPrice } from "@/lib/formatting/currency";
import { CartIcon, BellIcon, CheckIcon } from "@/components/icons";

export interface StickyAddToCartBarProps {
  price: number;
  compareAtPrice?: number;
  hasDiscount?: boolean;
  isAvailable: boolean;
  onAddToCart: () => void;
  onOpenNotifyModal?: () => void;
  selectedVariantSummary?: string;
}

export function StickyAddToCartBar({
  price,
  compareAtPrice,
  hasDiscount,
  isAvailable,
  onAddToCart,
  onOpenNotifyModal,
  selectedVariantSummary,
}: StickyAddToCartBarProps) {
  const [addedToast, setAddedToast] = useState(false);

  const handleAdd = () => {
    onAddToCart();
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border-product p-3 px-4 shadow-2xl md:hidden animate-slide-up">
        <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
          {/* Price Block */}
          <div className="flex flex-col justify-center">
            {selectedVariantSummary && (
              <span className="text-[10px] text-muted truncate max-w-[110px]">
                {selectedVariantSummary}
              </span>
            )}
            <div className="flex items-center gap-1.5">
              {hasDiscount && compareAtPrice && (
                <span className="text-[10px] text-muted line-through font-medium">
                  {formatPrice(compareAtPrice, false)}
                </span>
              )}
              <span className="text-sm font-bold text-foreground">
                {formatPrice(price)}
              </span>
            </div>
          </div>

          {/* Action CTA Button */}
          {isAvailable ? (
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 h-11 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-98 shadow-md cursor-pointer"
            >
              <CartIcon size={18} />
              <span>افزودن به سبد خرید</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenNotifyModal}
              className="flex-1 h-11 px-4 rounded-xl bg-amber-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-amber-600 transition-all active:scale-98 shadow-md cursor-pointer"
            >
              <BellIcon size={18} />
              <span>موجود شد اطلاع بده</span>
            </button>
          )}
        </div>
      </div>

      {/* Added Toast Notification */}
      {addedToast && (
        <div className="fixed bottom-18 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 animate-bounce md:hidden">
          <CheckIcon size={16} />
          <span>محصول به سبد خرید اضافه شد</span>
        </div>
      )}
    </>
  );
}
