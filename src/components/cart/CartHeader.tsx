"use client";

import React from "react";
import { X } from "lucide-react";

export interface CartHeaderProps {
  itemCount: number;
  onClose: () => void;
}

export function CartHeader({ itemCount, onClose }: CartHeaderProps) {
  return (
    <div className="flex items-center justify-between p-3  bg-background shrink-0">
      <div className="flex items-center gap-2">
        <h2 className="text-base sm:text-lg font-bold text-foreground">
          سبد خرید شما
        </h2>
        {itemCount > 0 && (
          <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
            {itemCount} کالا
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="بستن"
        className="w-9 h-9 rounded-full flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-surface-subtle transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
