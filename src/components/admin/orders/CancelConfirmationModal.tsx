"use client";

import React from "react";
import { AlertTriangle, X, Ban } from "lucide-react";

interface CancelConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemCount?: number;
}

export function CancelConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "تأیید لغو سفارش",
  description = "آیا از لغو این سفارش اطمینان دارید؟ این عملیات وضعیت سفارش را به «لغو شده» تغییر می‌دهد.",
  itemCount,
}: CancelConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl z-50 p-6 space-y-4 text-foreground dir-rtl animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-subtle rounded-lg transition-colors"
          title="بستن"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 text-rose-600">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">{title}</h3>
            {itemCount && itemCount > 1 && (
              <span className="text-xs text-rose-600 font-semibold">
                تعداد {itemCount} سفارش انتخاب شده است
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-surface-subtle hover:bg-surface-muted text-foreground text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Ban className="w-4 h-4" />
            <span>تأیید و لغو سفارش</span>
          </button>
        </div>
      </div>
    </div>
  );
}
