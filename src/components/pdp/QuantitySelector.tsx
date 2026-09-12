"use client";

import React from "react";
import { Plus, Minus } from "lucide-react";

export interface QuantitySelectorProps {
  quantity: number;
  maxStock: number;
  onChange: (newQuantity: number) => void;
  disabled?: boolean;
  showLabel?: boolean;
  className?: string;
}

export function QuantitySelector({
  quantity,
  maxStock,
  onChange,
  disabled = false,
  showLabel = true,
  className = "",
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
    <div className={`flex items-center gap-2.5 ${className}`}>
      {showLabel && <span className="text-xs font-semibold text-foreground shrink-0">تعداد:</span>}
      <div className={`flex items-center h-12 border border-border-product rounded-xl overflow-hidden bg-background shadow-xs shrink-0 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || quantity <= 1}
          aria-label="کاهش تعداد"
          className="w-10 h-full flex items-center justify-center hover:bg-surface-subtle text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-11 text-center font-bold text-sm text-foreground select-none flex items-center justify-center h-full">
          {quantity}
        </span>
        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || (maxStock > 0 && quantity >= maxStock)}
          aria-label="افزایش تعداد"
          className="w-10 h-full flex items-center justify-center hover:bg-surface-subtle text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
