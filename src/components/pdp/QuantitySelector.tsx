"use client";

import React from "react";
import { PlusIcon, MinusIcon } from "@/components/icons";

export interface QuantitySelectorProps {
  quantity: number;
  maxStock: number;
  onChange: (newQuantity: number) => void;
  disabled?: boolean;
}

export function QuantitySelector({
  quantity,
  maxStock,
  onChange,
  disabled = false,
}: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (disabled || quantity <= 1) return;
    onChange(quantity - 1);
  };

  const handleIncrement = () => {
    if (disabled || (maxStock > 0 && quantity >= maxStock)) return;
    onChange(quantity + 1);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-foreground shrink-0">تعداد:</span>
      <div className={`flex items-center border border-border-product rounded-xl overflow-hidden bg-background shadow-xs ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || quantity <= 1}
          aria-label="کاهش تعداد"
          className="w-9 h-9 flex items-center justify-center hover:bg-surface-subtle text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
        >
          <MinusIcon size={16} />
        </button>
        <span className="w-10 text-center font-bold text-sm text-foreground select-none">
          {quantity}
        </span>
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || (maxStock > 0 && quantity >= maxStock)}
          aria-label="افزایش تعداد"
          className="w-9 h-9 flex items-center justify-center hover:bg-surface-subtle text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
        >
          <PlusIcon size={16} />
        </button>
      </div>
    </div>
  );
}
