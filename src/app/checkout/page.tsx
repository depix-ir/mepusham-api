"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/store/cart/cart.store";
import { formatPrice } from "@/lib/formatting/currency";
import { CheckCircle2, ShoppingBag, ShieldCheck, ArrowRight } from "lucide-react";

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCart();
  const [isOrdered, setIsOrdered] = useState(false);

  const total = getTotal();

  const handleCompleteOrder = () => {
    clearCart();
    setIsOrdered(true);
  };

  if (isOrdered) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-16 text-center flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-black text-foreground">
            سفارش شما با موفقیت ثبت شد!
          </h1>
          <p className="text-sm text-muted">
            این یک صفحه پرداخت آزمایشی (Stub Checkout) است. سبد خرید شما با موفقیت خالی شد.
          </p>
        </div>
        <Link
          href="/products"
          className="mt-4 inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary-hover transition-all shadow-md"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به فروشگاه</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2 border-b border-border-subtle pb-6">
        <div className="flex items-center gap-2 text-primary font-bold text-xs bg-primary/10 px-3 py-1 rounded-full w-fit">
          <ShieldCheck className="w-4 h-4" />
          <span>درگاه پرداخت امن (نمونه اولیه)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground">
          تکمیل سفارش و پرداخت
        </h1>
        <p className="text-xs sm:text-sm text-muted">
          این صفحه به عنوان استاب نهایی تکمیل سفارش آماده شده است.
        </p>
      </div>

      {/* Main Checkout Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Order Details Panel */}
        <div className="md:col-span-7 bg-background border border-border-subtle rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground pb-3 border-b border-border-subtle flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <span>خلاصه اقلام سفارش</span>
          </h2>

          {items.length === 0 ? (
            <div className="text-center py-8 text-muted text-sm">
              هیچ کالا یا آیتمی در سبد خرید شما یافت نشد.
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-subtle/60 border border-border-subtle text-xs"
                >
                  <div className="flex flex-col gap-1 min-w-0 flex-1 pr-2">
                    <span className="font-bold text-foreground truncate">{item.name}</span>
                    <span className="text-[11px] text-muted">تعداد: {item.quantity}</span>
                  </div>
                  <span className="font-extrabold text-foreground shrink-0">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Summary & CTA */}
        <div className="md:col-span-5 bg-background border border-border shadow-md rounded-2xl p-6 flex flex-col gap-5">
          <h2 className="text-base font-bold text-foreground pb-3 border-b border-border-subtle">
            مبلغ قابل پرداخت
          </h2>

          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-muted">جمع کل:</span>
            <span className="text-xl font-black text-foreground">{formatPrice(total)}</span>
          </div>

          <button
            type="button"
            onClick={handleCompleteOrder}
            disabled={items.length === 0}
            className="w-full h-12 rounded-xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>ثبت سفارش آزمایشی</span>
          </button>

          <Link
            href="/cart"
            className="text-center text-xs font-medium text-muted hover:text-primary transition-colors"
          >
            بازگشت به سبد خرید
          </Link>
        </div>
      </div>
    </div>
  );
}
