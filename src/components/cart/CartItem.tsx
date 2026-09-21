"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { CartItem as CartItemType } from "@/store/cart/cart.types";
import { formatPrice } from "@/lib/formatting/currency";
import { TomanIcon } from "@/components/icons";
import { QuantityControl } from "./QuantityControl";

export interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemove: (itemId: string) => void;
  onNavigate?: () => void;
}

export function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  onNavigate,
}: CartItemProps) {
  const productUrl = `/products/${item.productSlug}`;

  const isOutOfStock = item.availableStock <= 0;
  const isStockLimited = !isOutOfStock && item.quantity > item.availableStock;

  return (
    <div className="relative flex flex-col p-3  rounded-xl  bg-primary/10 border-border-subtle hover:border-border transition-all">
      {/* Top Header Row: Title/Specs on Right, Trash on Left (RTL) */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <Link
            href={productUrl}
            onClick={onNavigate}
            className="text-xs sm:text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 block leading-snug"
          >
            {item.name}
          </Link>

          {/* Variants info */}
          {item.selectedVariants && item.selectedVariants.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[11px] text-muted">
              {item.selectedVariants.map((sv) => (
                <span key={sv.attributeId} className="inline-flex items-center gap-1">
                  <span>{sv.attributeName}:</span>
                  <span className="font-medium text-foreground">{sv.valueLabel}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Trash / Remove Button */}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          aria-label="حذف محصول از سبد خرید"
          className="p-1.5 text-muted hover:text-error rounded-lg hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Bottom Section: Product Image + Controls & Pricing */}
      <div className="flex items-end gap-3 pt-1">
        {/* Square Product Image (1:1) */}
        <Link
          href={productUrl}
          onClick={onNavigate}
          className="relative w-20 h-20 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-surface-subtle border border-border-subtle shrink-0 aspect-square group"
        >
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 64px, 80px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted text-[10px]">
              بدون تصویر
            </div>
          )}
        </Link>

        {/* Quantity Controls & Price */}
        <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
          {/* Quantity Controls */}
          <QuantityControl
            quantity={item.quantity}
            maxStock={item.availableStock}
            onIncrease={() => onUpdateQuantity(item.id, item.quantity + 1)}
            onDecrease={() => onUpdateQuantity(item.id, item.quantity - 1)}
            disabled={isOutOfStock}
          />

          {/* Pricing Block */}
          <div className="flex flex-col items-end text-left shrink-0">
            {item.compareAtPrice && item.compareAtPrice > item.unitPrice && (
              <span className="text-[10px] sm:text-xs text-muted line-through font-medium">
                {formatPrice(item.compareAtPrice * item.quantity)}
              </span>
            )}
            <div className="flex items-center gap-1 text-md sm:text-sm font-bold text-foreground">
              <span>{formatPrice(item.unitPrice * item.quantity)}</span>
              <TomanIcon size={13} className="text-muted shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Stock warning messages */}
      {isOutOfStock && (
        <div className="text-[11px] font-medium text-error bg-red-50 p-1.5 rounded-md text-center mt-1">
          این محصول در حال حاضر ناموجود است
        </div>
      )}

      {isStockLimited && (
        <div className="text-[11px] font-medium text-amber-700 bg-amber-50 p-1.5 rounded-md text-center mt-1">
          تنها {item.availableStock} عدد در انبار موجود است
        </div>
      )}
    </div>
  );
}
