"use client";

import React from "react";
import Image from "next/image";
import { OrderItem } from "@/types/account";
import { formatPrice } from "@/lib/formatting/currency";
import { TomanIcon } from "@/components/icons";

interface OrderItemRowProps {
  item: OrderItem;
}

export function OrderItemRow({ item }: OrderItemRowProps) {
  const variantParts: string[] = [];
  if (item.variant?.color) variantParts.push(`رنگ: ${item.variant.color}`);
  if (item.variant?.size) variantParts.push(`سایز: ${item.variant.size}`);

  return (
    <div className="flex items-center gap-3 py-2 border-b border-border-subtle/60 last:border-0">
      {/* Square Image Thumbnail */}
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-surface-subtle border border-border-subtle shrink-0">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover object-center"
          sizes="64px"
        />
      </div>

      {/* Title & Variants */}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs sm:text-sm font-medium text-foreground truncate leading-snug">
          {item.title}
        </h4>

        {variantParts.length > 0 && (
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {variantParts.join(" • ")}
          </p>
        )}

        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span>تعداد: <span className="font-bold text-foreground">{item.quantity}</span></span>
        </div>
      </div>

      {/* Price with Toman Icon */}
      <div className="text-left shrink-0">
        <div className="flex items-center justify-end gap-1 font-bold text-xs sm:text-sm text-foreground">
          <span>{formatPrice(item.finalUnitPrice * item.quantity)}</span>
          <TomanIcon className="w-3.5 h-3.5 text-foreground shrink-0" />
        </div>
        {item.quantity > 1 && (
          <span className="text-[10px] text-muted-foreground block text-left">
            هر عدد {formatPrice(item.finalUnitPrice)}
          </span>
        )}
      </div>
    </div>
  );
}
