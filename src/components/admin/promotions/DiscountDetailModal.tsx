"use client";

import React from "react";
import { ProductDiscount, getPromotionStatus } from "@/types/promotion";
import { PromotionStatusBadge } from "./PromotionStatusBadge";
import { PromotionUsageBar } from "./PromotionUsageBar";
import { products as ALL_PRODUCTS } from "@/data/products";
import { formatPrice } from "@/lib/formatting/currency";
import { X, Calendar, Percent, Package, Tag, Edit, Trash2, Power } from "lucide-react";

interface DiscountDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  discount: ProductDiscount | null;
  onEdit: (discount: ProductDiscount) => void;
  onDeactivate: (discount: ProductDiscount) => void;
  onDelete: (discount: ProductDiscount) => void;
}

export function DiscountDetailModal({
  isOpen,
  onClose,
  discount,
  onEdit,
  onDeactivate,
  onDelete,
}: DiscountDetailModalProps) {
  if (!isOpen || !discount) return null;

  const status = getPromotionStatus(
    discount.isActive,
    discount.startsAt,
    discount.endsAt
  );

  // Representative affected products calculation
  const affectedProducts = ALL_PRODUCTS.filter((p) =>
    discount.productIds?.includes(p.id)
  ).slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-background border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden dir-rtl">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface-subtle shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg text-foreground">
                {discount.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                شناسه: {discount.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PromotionStatusBadge status={status} />
            <button
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-muted rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 no-scrollbar">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-surface-subtle border border-border rounded-xl">
              <span className="text-xs text-muted-foreground font-medium block">
                مقدار تخفیف
              </span>
              <span className="text-lg font-bold text-primary mt-1 block">
                {discount.type === "percentage"
                  ? `٪${discount.value.toLocaleString("fa-IR")}`
                  : `${formatPrice(discount.value)} تومان`}
              </span>
            </div>

            <div className="p-3.5 bg-surface-subtle border border-border rounded-xl">
              <span className="text-xs text-muted-foreground font-medium block">
                محدوده اعمال
              </span>
              <span className="text-sm font-bold text-foreground mt-1 block truncate">
                {discount.campaignId
                  ? "کمپین تخصیص‌یافته"
                  : `${(discount.productIds?.length || 0).toLocaleString("fa-IR")} محصول`}
              </span>
            </div>

            <div className="p-3.5 bg-surface-subtle border border-border rounded-xl col-span-2 sm:col-span-1">
              <span className="text-xs text-muted-foreground font-medium block mb-1">
                میزان استفاده
              </span>
              <PromotionUsageBar
                usedCount={discount.usedCount}
                usageLimit={discount.usageLimit}
                compact
              />
            </div>
          </div>

          {discount.description && (
            <div className="p-3 bg-surface-subtle border border-border rounded-xl text-xs text-muted-foreground leading-relaxed">
              <span className="font-bold text-foreground block mb-0.5">
                توضیحات:
              </span>
              {discount.description}
            </div>
          )}

          {/* Time validity */}
          <div className="p-4 border border-border rounded-xl bg-background space-y-2">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" />
              <span>زمان‌بندی و اعتبار</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
              <div>
                شروع:{" "}
                <strong className="text-foreground font-medium dir-ltr inline-block">
                  {new Date(discount.startsAt).toLocaleString("fa-IR")}
                </strong>
              </div>
              <div>
                پایان:{" "}
                <strong className="text-foreground font-medium dir-ltr inline-block">
                  {new Date(discount.endsAt).toLocaleString("fa-IR")}
                </strong>
              </div>
            </div>
          </div>

          {/* Pricing Impact Simulation */}
          {affectedProducts.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>نمونه تاثیر تخفیف روی قیمت محصولات</span>
                <span className="text-[11px] text-muted-foreground font-normal">
                  محاسبه شده روی اولین متغیر
                </span>
              </h4>

              <div className="space-y-2">
                {affectedProducts.map((prod) => {
                  const origPrice = prod.pricing.minPrice;
                  let saving = 0;
                  if (discount.type === "percentage") {
                    saving = Math.round(origPrice * (discount.value / 100));
                  } else {
                    saving = Math.min(origPrice, discount.value);
                  }
                  const finalPrice = Math.max(0, origPrice - saving);

                  return (
                    <div
                      key={prod.id}
                      className="p-3 border border-border rounded-xl flex items-center justify-between bg-background text-xs"
                    >
                      <span className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-[260px]">
                        {prod.title}
                      </span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="line-through text-muted-foreground">
                          {formatPrice(origPrice)}
                        </span>
                        <span className="text-rose-600 font-bold">
                          -{formatPrice(saving)}
                        </span>
                        <span className="text-primary font-bold">
                          {formatPrice(finalPrice)} تومان
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-border bg-surface-subtle flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onDelete(discount);
              }}
              className="px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف</span>
            </button>

            {discount.isActive && (
              <button
                onClick={() => {
                  onClose();
                  onDeactivate(discount);
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
                onEdit(discount);
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
