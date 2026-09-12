"use client";

import React from "react";
import { Plus, Minus } from "lucide-react";

export interface QuantityControlProps {
  quantity: number;
  maxStock: number;
  onIncrease: () => void;
  onDecrease: () => void;
  disabled?: boolean;
}

export function QuantityControl({
  quantity,
  maxStock,
  onIncrease,
  onDecrease,
  disabled = false,
}: QuantityControlProps) {
  const isMinusDisabled = disabled || quantity <= 1;
  const isPlusDisabled = disabled || (maxStock > 0 && quantity >= maxStock);

  return (
    <div className="flex items-center gap-1   rounded-lg p-1 select-none">
      <button
        type="button"
        onClick={onDecrease}
        disabled={isMinusDisabled}
        aria-label="کاهش تعداد"
        className="w-7 h-7 flex items-center border border-subtitle justify-center rounded-md bg-background text-foreground hover:bg-surface-muted disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <span className="w-7 text-center font-bold text-xs text-foreground font-mono">
        {quantity}
      </span>

      <button
        type="button"
        onClick={onIncrease}
        disabled={isPlusDisabled}
        aria-label="افزایش تعداد"
        className="w-7 h-7 flex items-center border border-subtitle justify-center rounded-md bg-background text-foreground hover:bg-surface-muted disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
