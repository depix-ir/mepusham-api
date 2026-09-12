"use client";

import React, { useMemo } from "react";
import { formatPrice } from "@/lib/formatting/currency";
import { ShoppingCart, Bell, Plus, Minus, Trash2 } from "lucide-react";
import { Product } from "@/types/product";
import { getVariantDetails } from "@/lib/product/domain";
import { useCart } from "@/store/cart/cart.store";

export interface StickyAddToCartBarProps {
  product: Product;
  selectedOptions: Record<string, string>;
  price: number;
  compareAtPrice?: number;
  hasDiscount?: boolean;
  isAvailable: boolean;
  stock?: number;
  onAddToCart: () => void;
  onOpenNotifyModal?: () => void;
  selectedVariantSummary?: string;
}

export function StickyAddToCartBar({
  product,
  selectedOptions,
  price,
  compareAtPrice,
  hasDiscount,
  isAvailable,
  stock = 0,
  onAddToCart,
  onOpenNotifyModal,
  selectedVariantSummary,
}: StickyAddToCartBarProps) {
  const { items, updateQuantity, removeItem } = useCart();

  const variantDetails = useMemo(() => {
    if (!product) return null;
    return getVariantDetails(product, selectedOptions || {});
  }, [product, selectedOptions]);

  const cartItem = useMemo(() => {
    if (!product) return undefined;
    return items.find((item) => {
      if (item.productId !== product.id) return false;
      if (variantDetails?.selectedVariant?.id) {
        return item.variantId === variantDetails.selectedVariant.id;
      }
      if (item.selectedVariants && item.selectedVariants.length > 0) {
        return item.selectedVariants.every(
          (sv) => selectedOptions?.[sv.attributeId] === sv.valueId
        );
      }
      return true;
    });
  }, [items, product, selectedOptions, variantDetails]);

  const cartQuantity = cartItem?.quantity || 0;
  const maxStock = stock || variantDetails?.stock || 0;

  const handleIncrement = () => {
    if (!cartItem) return;
    if (maxStock > 0 && cartQuantity >= maxStock) return;
    updateQuantity(cartItem.id, cartQuantity + 1);
  };

  const handleDecrement = () => {
    if (!cartItem) return;
    if (cartQuantity <= 1) {
      removeItem(cartItem.id);
    } else {
      updateQuantity(cartItem.id, cartQuantity - 1);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border-product p-3 px-4 shadow-2xl md:hidden animate-slide-up">
      <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
        {/* Price Block */}
        <div className="flex flex-col justify-center shrink-0">
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

        {/* Action Button or Quantity Control */}
        {!isAvailable ? (
          <button
            type="button"
            onClick={onOpenNotifyModal}
            className="flex-1 h-11 px-4 rounded-xl bg-amber-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-amber-600 transition-all active:scale-98 shadow-md cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span>موجود شد اطلاع بده</span>
          </button>
        ) : cartQuantity > 0 ? (
          <div className="flex-1 h-11 px-2 rounded-xl border-2 border-primary bg-primary/5 flex items-center justify-between gap-1 shadow-xs">
            <button
              type="button"
              onClick={handleDecrement}
              aria-label={cartQuantity === 1 ? "حذف از سبد" : "کاهش تعداد"}
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-primary/10 text-primary active:scale-95 transition-all cursor-pointer"
            >
              {cartQuantity === 1 ? (
                <Trash2 className="w-4 h-4 text-red-500" />
              ) : (
                <Minus className="w-4 h-4" />
              )}
            </button>

            <span className="font-extrabold text-sm text-foreground select-none px-2">
              {cartQuantity} عدد در سبد
            </span>

            <button
              type="button"
              onClick={handleIncrement}
              disabled={maxStock > 0 && cartQuantity >= maxStock}
              aria-label="افزایش تعداد"
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-primary/10 text-primary disabled:opacity-30 disabled:hover:bg-transparent active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onAddToCart}
            className="flex-1 h-11 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-98 shadow-md cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>افزودن به سبد خرید</span>
          </button>
        )}
      </div>
    </div>
  );
}
