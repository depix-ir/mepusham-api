"use client";

import React from "react";
import { formatPrice } from "@/lib/formatting/currency";
import { Loader2, ArrowLeft } from "lucide-react";

interface MobileCheckoutBarProps {
  payableTotal: number;
  onSubmit: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function MobileCheckoutBar({
  payableTotal,
  onSubmit,
  isLoading,
  disabled = false,
}: MobileCheckoutBarProps) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-background/95 backdrop-blur-md border-t border-border-subtle p-3.5 sm:px-6 shadow-lg safe-area-bottom">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Total Price Display */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-medium text-muted">مبلغ قابل پرداخت</span>
          <span className="text-base font-black text-primary">
            {formatPrice(payableTotal)}
          </span>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading || disabled}
          className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-primary-hover active:bg-primary-active disabled:opacity-50 transition-all shadow-md cursor-pointer shrink-0"
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
      </div>
    </div>
  );
}
