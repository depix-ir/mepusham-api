"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface DeactivateConfirmationModalProps {
  isOpen: boolean;
  customerName: string;
  currentStatus: "active" | "inactive";
  onClose: () => void;
  onConfirm: () => void;
}

export function DeactivateConfirmationModal({
  isOpen,
  customerName,
  currentStatus,
  onClose,
  onConfirm,
}: DeactivateConfirmationModalProps) {
  if (!isOpen) return null;

  const isDeactivating = currentStatus === "active";
  const actionTitle = isDeactivating ? "غیرفعال‌سازی حساب مشتری" : "فعال‌سازی حساب مشتری";
  const confirmButtonLabel = isDeactivating ? "غیرفعال کردن" : "فعال کردن";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-surface border border-border rounded-2xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="deactivate-modal-title"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 text-foreground font-bold text-base" id="deactivate-modal-title">
            <AlertTriangle className={`w-5 h-5 ${isDeactivating ? "text-amber-500" : "text-emerald-500"}`} />
            <span>{actionTitle}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors cursor-pointer"
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs text-foreground/80 leading-relaxed">
          <p>
            آیا از {isDeactivating ? "غیرفعال‌سازی" : "فعال‌سازی"} حساب کاربر <strong className="text-foreground font-bold">«{customerName}»</strong> اطمینان دارید؟
          </p>
          {isDeactivating && (
            <p className="text-muted-foreground">
              توضیح: تاریخچه سفارش‌ها، مرجوعی‌ها و تیکت‌های این مشتری حفظ خواهد شد و هیچ داده‌ای پاک نمی‌شود.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-foreground bg-surface-subtle hover:bg-surface-muted rounded-xl transition-colors cursor-pointer"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              isDeactivating
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {confirmButtonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
