"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CartItem as CartItemType } from "@/store/cart/cart.types";
import { formatPrice } from "@/lib/formatting/currency";
import { TomanIcon } from "@/components/icons";
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
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2.5  ">
        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
          ۳
        </div>
        <h2 className="text-base font-bold text-foreground tracking-tight">
          بررسی اقلام سفارش ({items.length})
        </h2>
      </div>

      <div className="p-4 bg-surface-subtle  border-border-subtle rounded-xl ">
        {items.map((item) => {
          const productHref = `/products/${item.productSlug || item.productId}`;

          return (
            <div
              key={item.id}
              className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 sm:gap-4"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Product Thumbnail */}
                <Link href={productHref} className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden shrink-0  bg-surface-subtle/30">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted text-[10px]">
                      بدون تصویر
                    </div>
                  )}
                </Link>

                {/* Product Details */}
                <div className="flex flex-col gap-1 min-w-0">
                  <Link
                    href={productHref}
                    className="text-xs sm:text-sm font-bold text-foreground truncate hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>

                  {/* Selected Options/Variants */}
                  {item.selectedVariants && item.selectedVariants.length > 0 && (
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-muted">
                      {item.selectedVariants.map((sv) => (
                        <span key={sv.attributeId}>
                          {sv.attributeName}: {sv.valueLabel}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Unit Price */}
                  <div className="flex items-center gap-1 text-xs font-bold text-foreground sm:hidden pt-0.5">
                    <span>{formatPrice(item.unitPrice * item.quantity)}</span>
                    <TomanIcon size={12} className="text-muted shrink-0" />
                  </div>
                </div>
              </div>

              {/* Desktop Price */}
              <div className="hidden sm:flex items-center gap-1 text-sm font-bold text-foreground shrink-0 px-2">
                <span>{formatPrice(item.unitPrice * item.quantity)}</span>
                <TomanIcon size={13} className="text-muted shrink-0" />
              </div>

              {/* Quantity Controls & Remove */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center bg-background border border-border-subtle rounded-md h-8 px-1">
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.availableStock}
                    className="px-1 text-foreground hover:text-primary disabled:opacity-30 cursor-pointer"
                    aria-label="افزایش تعداد"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-5 text-center text-xs font-bold text-foreground">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="px-1 text-foreground hover:text-primary disabled:opacity-30 cursor-pointer"
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
