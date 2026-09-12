"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export interface CartEmptyStateProps {
  onClose?: () => void;
}

export function CartEmptyState({ onClose }: CartEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center h-full min-h-[300px] gap-4">
      <div className="w-20 h-20 rounded-full bg-surface-subtle flex items-center justify-center text-muted">
        <ShoppingBag className="w-10 h-10" />
      </div>

      <div className="flex flex-col gap-1.5 max-w-xs">
        <h3 className="text-base font-bold text-foreground">
          سبد خرید شما خالی است
        </h3>
        <p className="text-xs text-muted leading-relaxed">
          هنوز محصولی به سبد خرید خود اضافه نکرده‌اید. می‌توانید جدیدترین محصولات ما را بررسی کنید.
        </p>
      </div>

      <Link
        href="/products"
        onClick={onClose}
        className="mt-2 inline-flex items-center justify-center h-11 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm hover:bg-primary-hover active:bg-primary-active transition-all cursor-pointer shadow-sm"
      >
        مشاهده محصولات
      </Link>
    </div>
  );
}
