"use client";

import React from "react";
import { AlertTriangle, Power, Trash2, X } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  itemTitle: string;
  isActive?: boolean;
  usedCount?: number;
  onDeactivate?: () => void;
  onDelete: () => void;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  title,
  itemTitle,
  isActive = false,
  usedCount = 0,
  onDeactivate,
  onDelete,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-background border border-border rounded-2xl w-full max-w-md p-4 sm:p-6 shadow-2xl flex flex-col gap-4 dir-rtl">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="font-bold text-base md:text-lg text-foreground">
            {title}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground mt-1.5 leading-relaxed">
            آیا از حذف «<span className="font-semibold text-foreground">{itemTitle}</span>» اطمینان دارید؟ این عملیات قابل بازگشت نیست.
          </p>

          {isActive && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                این پروموشن در حال حاضر <strong className="font-bold">فعال</strong> است. پیشنهاد می‌شود به جای حذف، آن را غیرفعال کنید.
              </span>
            </div>
          )}

          {usedCount > 0 && (
            <div className="mt-2 p-2.5 bg-neutral-100 border border-neutral-200 rounded-xl text-xs text-neutral-700">
              این قانون قبلاً <strong className="font-bold">{usedCount.toLocaleString("fa-IR")} بار</strong> توسط کاربران استفاده شده است.
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-foreground bg-surface-subtle border border-border rounded-xl hover:bg-surface-muted transition-colors"
          >
            انصراف
          </button>

          {isActive && onDeactivate && (
            <button
              type="button"
              onClick={() => {
                onDeactivate();
                onClose();
              }}
              className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 rounded-xl hover:bg-amber-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <Power className="w-3.5 h-3.5" />
              <span>غیرفعال کردن</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-300 rounded-xl hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>حذف قطعی</span>
          </button>
        </div>
      </div>
    </div>
  );
}
