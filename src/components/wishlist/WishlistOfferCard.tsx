"use client";

import React from "react";
import { Sparkles, Truck, Gift } from "lucide-react";
import { formatPrice } from "@/lib/formatting/currency";

export interface WishlistOfferCardProps {
  productCount?: number;
  totalPrice?: number;
}

export function WishlistOfferCard({
  productCount = 0,
  totalPrice = 0,
}: WishlistOfferCardProps) {
  const hasFreeShipping = productCount > 2 || totalPrice > 10_000_000;
  const hasSpecialDiscount = totalPrice > 10_000_000;
  const specialDiscountAmount = hasSpecialDiscount ? Math.round(totalPrice * 0.1) : 0;

  if (hasSpecialDiscount) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
          <Gift size={18} />
        </div>
        <div className="flex flex-col gap-1">
          <h4 className="text-xs sm:text-sm font-bold text-emerald-900">
            پیشنهاد ویژه: ارسال رایگان + ۱۰٪ تخفیف
          </h4>
          <p className="text-[11px] sm:text-xs text-emerald-800 leading-relaxed">
            به دلیل خرید بالای ۱۰ میلیون تومان، ۱۰٪ تخفیف اضافه (به مبلغ {formatPrice(specialDiscountAmount)} تومان) و ارسال رایگان بر روی این سفارش فعال شد.
          </p>
        </div>
      </div>
    );
  }

  if (hasFreeShipping) {
    return (
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
          <Truck size={18} />
        </div>
        <div className="flex flex-col gap-1">
          <h4 className="text-xs sm:text-sm font-bold text-primary">
            ارسال رایگان فعال شد!
          </h4>
          <p className="text-[11px] sm:text-xs text-muted leading-relaxed">
            به دلیل داشتن بیش از ۲ محصول در لیست، ارسال این سفارش کاملاً رایگان است.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-subtle border border-border-product rounded-xl p-3.5 flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-surface-muted text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles size={18} />
      </div>
      <div className="flex flex-col gap-1">
        <h4 className="text-xs sm:text-sm font-bold text-foreground">
          مزایای سفارش لیست پسندیده‌ها
        </h4>
        <p className="text-[11px] sm:text-xs text-muted leading-relaxed">
          • بیشتر از ۲ محصول در لیست 👈 <strong>ارسال رایگان</strong>
          <br />
          • خرید بالای ۱۰ میلیون تومان 👈 <strong>ارسال رایگان + ۱۰٪ تخفیف ویژه</strong>
        </p>
      </div>
    </div>
  );
}
