"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CartItem as CartItemType } from "@/store/cart/cart.types";
import { formatPrice } from "@/lib/formatting/currency";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";

interface CheckoutCartItemsProps {
  items: CartItemType[];
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
}

export function CheckoutCartItems({
  items,
  onUpdateQuantity,
  onRemoveItem,
}: CheckoutCartItemsProps) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xs font-bold text-foreground pb-2 border-b border-border-subtle flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <ShoppingBag className="w-4 h-4 text-primary shrink-0" />
          <span>اقلام سفارش ({items.length})</span>
        </span>
      </h3>

      <div className="flex flex-col gap-3">
        {items.map((item) => {
          const productHref = `/products/${item.productSlug || item.productId}`;

          return (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-surface-subtle/50 border border-border-subtle"
            >
              {/* Product Thumbnail */}
              <Link href={productHref} className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-border-subtle bg-background">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full bg-surface-subtle flex items-center justify-center text-muted text-[10px]">
                    بدون تصویر
                  </div>
                )}
              </Link>

              {/* Product Details */}
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <Link
                  href={productHref}
                  className="text-xs font-bold text-foreground truncate hover:text-primary transition-colors"
                >
                  {item.name}
                </Link>

                {/* Selected Options/Variants */}
                {item.selectedVariants && item.selectedVariants.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 text-[11px] text-muted">
                    {item.selectedVariants.map((sv) => (
                      <span key={sv.attributeId} className="bg-background px-1.5 py-0.5 rounded border border-border-subtle">
                        {sv.attributeName}: {sv.valueLabel}
                      </span>
                    ))}
                  </div>
                )}

                {/* Price */}
                <span className="text-xs font-extrabold text-foreground pt-0.5">
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>
              </div>

              {/* Quantity Controls & Remove */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center bg-background border border-border-subtle rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.availableStock}
                    className="p-1 text-foreground hover:text-primary disabled:opacity-30 disabled:hover:text-foreground cursor-pointer"
                    aria-label="افزایش تعداد"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-foreground">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="p-1 text-foreground hover:text-primary disabled:opacity-30 disabled:hover:text-foreground cursor-pointer"
                    aria-label="کاهش تعداد"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  className="p-1.5 text-muted hover:text-error transition-colors cursor-pointer"
                  aria-label="حذف کالا"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
