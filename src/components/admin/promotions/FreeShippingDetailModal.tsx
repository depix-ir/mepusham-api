"use client";

import React from "react";
import { FreeShippingRule, freeShippingScopeLabels, getPromotionStatus } from "@/types/promotion";
import { PromotionStatusBadge } from "./PromotionStatusBadge";
import { PromotionUsageBar } from "./PromotionUsageBar";
import { formatPrice } from "@/lib/formatting/currency";
import { X, Calendar, Truck, Edit, Trash2, Power } from "lucide-react";

interface FreeShippingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  rule: FreeShippingRule | null;
  onEdit: (rule: FreeShippingRule) => void;
  onDeactivate: (rule: FreeShippingRule) => void;
  onDelete: (rule: FreeShippingRule) => void;
}

export function FreeShippingDetailModal({
  isOpen,
  onClose,
  rule,
  onEdit,
  onDeactivate,
  onDelete,
}: FreeShippingDetailModalProps) {
  if (!isOpen || !rule) return null;

  const status = getPromotionStatus(
    rule.isActive,
    rule.startsAt,
    rule.endsAt
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-background border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden dir-rtl">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface-subtle shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg text-foreground">
                {rule.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                شناسه: {rule.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PromotionStatusBadge status={status} />
            <button
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 no-scrollbar">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-surface-subtle border border-border rounded-xl">
              <span className="text-xs text-muted-foreground font-medium block">
                محدوده شمول
              </span>
              <span className="text-sm font-bold text-foreground mt-1 block">
                {freeShippingScopeLabels[rule.scope]}
              </span>
            </div>

            <div className="p-3.5 bg-surface-subtle border border-border rounded-xl">
              <span className="text-xs text-muted-foreground font-medium block">
                شرط حداقل خرید
              </span>
              <span className="text-sm font-bold text-primary mt-1 block">
                {rule.minPurchaseAmount
                  ? `${formatPrice(rule.minPurchaseAmount)} تومان`
                  : "بدون حداقل"}
              </span>
            </div>

            <div className="p-3.5 bg-surface-subtle border border-border rounded-xl col-span-2 sm:col-span-1">
              <span className="text-xs text-muted-foreground font-medium block mb-1">
                میزان استفاده
              </span>
              <PromotionUsageBar
                usedCount={rule.usedCount}
                usageLimit={rule.usageLimit}
                compact
              />
            </div>
          </div>

          {rule.description && (
            <div className="p-3 bg-surface-subtle border border-border rounded-xl text-xs text-muted-foreground leading-relaxed">
              <span className="font-bold text-foreground block mb-0.5">
                توضیحات:
              </span>
              {rule.description}
            </div>
          )}

          {/* Time & Bounds Detail */}
          <div className="p-4 border border-border rounded-xl bg-background space-y-3">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" />
              <span>شرایط و بازه اعتبار</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground pt-1">
              <div>
                حداکثر مبلغ خرید:{" "}
                <strong className="text-foreground font-medium">
                  {rule.maxPurchaseAmount
                    ? `${formatPrice(rule.maxPurchaseAmount)} تومان`
                    : "نامحدود"}
                </strong>
              </div>
              <div>
                تعداد دفعات استفاده:{" "}
                <strong className="text-foreground font-medium">
                  {rule.usedCount.toLocaleString("fa-IR")} بار
                </strong>
              </div>
              <div>
                تاریخ شروع:{" "}
                <strong className="text-foreground font-medium dir-ltr inline-block">
                  {new Date(rule.startsAt).toLocaleString("fa-IR")}
                </strong>
              </div>
              <div>
                تاریخ پایان:{" "}
                <strong className="text-foreground font-medium dir-ltr inline-block">
                  {new Date(rule.endsAt).toLocaleString("fa-IR")}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface-subtle flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onDelete(rule);
              }}
              className="px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف</span>
            </button>

            {rule.isActive && (
              <button
                onClick={() => {
                  onClose();
                  onDeactivate(rule);
                }}
                className="px-3 py-2 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors flex items-center gap-1.5"
              >
                <Power className="w-3.5 h-3.5" />
                <span>غیرفعال‌سازی</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-foreground bg-background border border-border rounded-xl hover:bg-surface-muted transition-colors"
            >
              بستن
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(rule);
              }}
              className="px-5 py-2 text-xs font-bold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>ویرایش</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
