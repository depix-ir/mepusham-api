"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { formatPrice } from "@/lib/formatting/currency";
import { CartValidationError } from "@/store/cart/cart.types";

export interface CartSummaryProps {
  total: number;
  itemCount: number;
  validationErrors?: CartValidationError[];
  onCheckoutValidation?: () => boolean;
  onCheckoutSuccess?: () => void;
}

export function CartSummary({
  total,
  itemCount,
  validationErrors = [],
  onCheckoutValidation,
  onCheckoutSuccess,
}: CartSummaryProps) {
  const router = useRouter();

  const handleCheckout = () => {
    if (onCheckoutValidation) {
      const isValid = onCheckoutValidation();
      if (!isValid) {
        return;
      }
    }

    if (onCheckoutSuccess) {
      onCheckoutSuccess();
    }

    router.push("/checkout");
  };

  const isDisabled = itemCount === 0;

  return (
    <div className=" bg-background p-3 flex flex-col gap-3 shrink-0 shadow-lg pb-[calc(1rem+env(safe-area-inset-bottom))]">
      {/* Inline Validation Error Banner */}
      {validationErrors.length > 0 && (
        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-red-50 border border-red-200 text-error text-xs animate-fadeIn">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>امکان ادامه خرید وجود ندارد:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] font-medium pr-1 text-red-700">
            {validationErrors.map((err, idx) => (
              <li key={`${err.itemId}-${idx}`}>{err.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Price Summary Row */}
      <div className="flex items-center justify-between py-1">
        <span className="text-xs sm:text-sm font-medium text-muted">
          مبلغ کل سبد خرید
        </span>
        <span className="text-base sm:text-lg font-black text-foreground">
          {formatPrice(total)}
        </span>
      </div>

      {/* Checkout CTA */}
      <button
        type="button"
        onClick={handleCheckout}
        disabled={isDisabled}
        className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-hover active:bg-primary-active disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer shadow-md"
      >
        <span>ادامه و پرداخت</span>
        <ArrowLeft className="w-4 h-4" />
      </button>
    </div>
  );
}
