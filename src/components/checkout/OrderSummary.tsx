"use client";

import React from "react";
import { ShippingOption } from "@/data/shipping";
import { formatPrice } from "@/lib/formatting/currency";
import { TomanIcon } from "@/components/icons";
import { ShieldCheck, Loader2, ArrowLeft } from "lucide-react";

interface OrderSummaryProps {
  itemsSubtotal: number;
  shippingOption: ShippingOption;
  payableTotal: number;
  onSubmit: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function OrderSummary({
  itemsSubtotal,
  shippingOption,
  payableTotal,
  onSubmit,
  isLoading,
  disabled = false,
}: OrderSummaryProps) {
  return (
    <div className="bg-background border border-border-subtle rounded-2xl p-5 sm:p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <h2 className="text-base font-bold text-foreground tracking-tight">
          خلاصه سفارش
        </h2>
        <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>پیش‌فاکتور معتبر</span>
        </span>
      </div>

      {/* Breakdown */}
      <div className="flex flex-col gap-3 text-xs sm:text-sm">
        <div className="flex items-center justify-between text-muted">
          <span>مجموع قیمت کالاها:</span>
          <div className="flex items-center gap-1 font-semibold text-foreground">
            <span>{formatPrice(itemsSubtotal)}</span>
            <TomanIcon size={14} className="text-muted shrink-0" />
          </div>
        </div>

        <div className="flex items-center justify-between text-muted pb-3 border-b border-border-subtle">
          <span>هزینه ارسال ({shippingOption.title}):</span>
          <div className="flex items-center gap-1 font-semibold text-foreground">
            <span>{formatPrice(shippingOption.price)}</span>
            <TomanIcon size={14} className="text-muted shrink-0" />
          </div>
        </div>

        {/* Payable Total */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-bold text-foreground">مبلغ قابل پرداخت:</span>
          <div className="flex items-center gap-1 text-lg sm:text-xl font-extrabold text-primary">
            <span>{formatPrice(payableTotal)}</span>
            <TomanIcon size={16} className="text-primary/70 shrink-0" />
          </div>
        </div>
      </div>

      {/* Desktop Submit CTA */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={isLoading || disabled}
        className="w-full h-11 sm:h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-hover active:bg-primary-active disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>در حال انتقال...</span>
          </>
        ) : (
          <>
            <span>انتقال به صفحه پرداخت</span>
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          </>
        )}
      </button>

      <div className="text-[11px] text-center text-muted leading-relaxed">
        با ثبت سفارش، قوانین و مقررات فروشگاه را می‌پذیرید.
      </div>
    </div>
  );
}
