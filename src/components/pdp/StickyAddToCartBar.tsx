"use client";

import React, { useMemo } from "react";
import { formatPrice } from "@/lib/formatting/currency";
import { TomanIcon } from "@/components/icons";
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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border-product p-2.5 px-4 shadow-lg md:hidden animate-slide-up pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
        {/* Price Block */}
        <div className="flex flex-col justify-center shrink-0">
          {selectedVariantSummary && (
            <span className="text-[10px] text-muted truncate max-w-[100px]">
              {selectedVariantSummary}
            </span>
          )}
          <div className="flex items-center gap-1">
            {hasDiscount && compareAtPrice && (
              <span className="text-[10px] text-muted line-through font-medium">
                {formatPrice(compareAtPrice)}
              </span>
            )}
            <div className="flex items-center gap-0.5 text-sm font-bold text-foreground">
              <span>{formatPrice(price)}</span>
              <TomanIcon size={12} className="text-muted shrink-0" />
            </div>
          </div>
        </div>

        {/* Action Button or Quantity Control */}
        {!isAvailable ? (
          <button
            type="button"
            onClick={onOpenNotifyModal}
            className="flex-1 h-10 px-3 rounded-lg bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-amber-600 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span>موجود شد اطلاع بده</span>
          </button>
        ) : cartQuantity > 0 ? (
          <div className="flex-1 h-10 px-2 rounded-lg border border-primary/30 bg-primary/5 flex items-center justify-between gap-2 transition-all">
            <button
              type="button"
              onClick={handleDecrement}
              aria-label={cartQuantity === 1 ? "حذف از سبد خرید" : "کاهش تعداد"}
              title={cartQuantity === 1 ? "حذف از سبد خرید" : "کاهش تعداد"}
              className="w-8 h-8 rounded-md flex items-center justify-center bg-background border border-border-product hover:bg-rose-50 hover:border-rose-200 text-foreground cursor-pointer"
            >
              {cartQuantity === 1 ? (
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              ) : (
                <Minus className="w-3.5 h-3.5 text-foreground" />
              )}
            </button>

            <div className="flex items-center gap-1 select-none text-xs">
              <span className="font-extrabold text-primary">
                {cartQuantity}
              </span>

            </div>

            <button
              type="button"
              onClick={handleIncrement}
              disabled={maxStock > 0 && cartQuantity >= maxStock}
              aria-label="افزایش تعداد"
              title="افزایش تعداد"
              className="w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-30 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onAddToCart}
            className="flex-1 h-10 px-3 rounded-lg bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>افزودن به سبد خرید</span>
          </button>
        )}
      </div>
    </div>
  );
}
