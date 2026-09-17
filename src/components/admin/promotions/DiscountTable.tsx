"use client";

import React, { useState } from "react";
import { ProductDiscount, getPromotionStatus } from "@/types/promotion";
import { PromotionStatusBadge } from "./PromotionStatusBadge";
import { PromotionUsageBar } from "./PromotionUsageBar";
import { formatPrice } from "@/lib/formatting/currency";
import { Edit, Eye, Trash2, Power, MoreVertical, Tag, Calendar, Percent } from "lucide-react";

interface DiscountTableProps {
  discounts: ProductDiscount[];
  onView: (discount: ProductDiscount) => void;
  onEdit: (discount: ProductDiscount) => void;
  onDeactivate: (discount: ProductDiscount) => void;
  onDelete: (discount: ProductDiscount) => void;
}

export function DiscountTable({
  discounts,
  onView,
  onEdit,
  onDeactivate,
  onDelete,
}: DiscountTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  if (discounts.length === 0) {
    return (
      <div className="bg-background border border-border rounded-2xl p-8 text-center text-muted-foreground my-4">
        <Percent className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
        <h4 className="font-bold text-base text-foreground">هیچ تخفیفی یافت نشد</h4>
        <p className="text-xs mt-1">
          برای افزودن تخفیف جدید روی دکمه «ایجاد تخفیف» کلیک کنید.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop Data Table (md and above) */}
      <div className="hidden md:block bg-background border border-border rounded-2xl overflow-hidden shadow-2xs my-4">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-surface-subtle border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="p-3.5 pr-4">عنوان تخفیف</th>
                <th className="p-3.5">نوع</th>
                <th className="p-3.5">مقدار</th>
                <th className="p-3.5">محدوده</th>
                <th className="p-3.5">بازه زمانی</th>
                <th className="p-3.5">استفاده</th>
                <th className="p-3.5">وضعیت</th>
                <th className="p-3.5 pl-4 text-left">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {discounts.map((discount) => {
                const status = getPromotionStatus(
                  discount.isActive,
                  discount.startsAt,
                  discount.endsAt
                );

                return (
                  <tr
                    key={discount.id}
                    className="hover:bg-surface-subtle/50 transition-colors group"
                  >
                    {/* Title & Description */}
                    <td className="p-3.5 pr-4 max-w-[200px]">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-sm text-foreground truncate">
                          {discount.title}
                        </span>
                        {discount.description && (
                          <span className="text-[11px] text-muted-foreground truncate">
                            {discount.description}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 font-medium text-foreground">
                        {discount.type === "percentage" ? "درصدی" : "مبلغ ثابت"}
                      </span>
                    </td>

                    {/* Amount / Value */}
                    <td className="p-3.5">
                      <span className="font-bold text-primary">
                        {discount.type === "percentage"
                          ? `٪${discount.value.toLocaleString("fa-IR")}`
                          : `${formatPrice(discount.value)} تومان`}
                      </span>
                    </td>

                    {/* Scope */}
                    <td className="p-3.5">
                      <span className="px-2 py-1 bg-surface-subtle border border-border-subtle rounded-lg text-[11px] font-semibold text-foreground">
                        {discount.campaignId
                          ? "کمپین"
                          : `${(discount.productIds?.length || 0).toLocaleString("fa-IR")} محصول`}
                      </span>
                    </td>

                    {/* Time */}
                    <td className="p-3.5 text-[11px] text-muted-foreground">
                      <div className="flex flex-col gap-0.5 dir-ltr text-right">
                        <span>
                          {new Date(discount.startsAt).toLocaleDateString("fa-IR")}
                        </span>
                        <span>
                          تا {new Date(discount.endsAt).toLocaleDateString("fa-IR")}
                        </span>
                      </div>
                    </td>

                    {/* Usage */}
                    <td className="p-3.5 min-w-[110px]">
                      <PromotionUsageBar
                        usedCount={discount.usedCount}
                        usageLimit={discount.usageLimit}
                        compact
                      />
                    </td>

                    {/* Status Badge */}
                    <td className="p-3.5">
                      <PromotionStatusBadge status={status} />
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 pl-4 text-left">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onView(discount)}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-muted rounded-lg transition-colors"
                          title="مشاهده جزییات"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(discount)}
                          className="px-2.5 py-1 text-xs font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                        >
                          ویرایش
                        </button>
                        {discount.isActive && (
                          <button
                            onClick={() => onDeactivate(discount)}
                            className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                            title="غیرفعال کردن"
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(discount)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Responsive Cards (under md) */}
      <div className="md:hidden space-y-3 my-4">
        {discounts.map((discount) => {
          const status = getPromotionStatus(
            discount.isActive,
            discount.startsAt,
            discount.endsAt
          );

          return (
            <div
              key={discount.id}
              className="bg-background border border-border rounded-2xl p-4 shadow-2xs flex flex-col gap-3 relative"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-foreground">
                    {discount.title}
                  </h4>
                  {discount.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {discount.description}
                    </p>
                  )}
                </div>
                <PromotionStatusBadge status={status} />
              </div>

              {/* Amount & Scope */}
              <div className="grid grid-cols-2 gap-2 bg-surface-subtle p-2.5 rounded-xl text-xs">
                <div>
                  <span className="text-[11px] text-muted-foreground block">
                    مقدار تخفیف
                  </span>
                  <span className="font-bold text-primary text-sm">
                    {discount.type === "percentage"
                      ? `٪${discount.value.toLocaleString("fa-IR")}`
                      : `${formatPrice(discount.value)} تومان`}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">
                    محدوده
                  </span>
                  <span className="font-bold text-foreground">
                    {discount.campaignId
                      ? "کمپین"
                      : `${(discount.productIds?.length || 0).toLocaleString("fa-IR")} محصول`}
                  </span>
                </div>
              </div>

              {/* Dates & Usage */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/60">
                <div className="flex items-center gap-1 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>
                    {new Date(discount.startsAt).toLocaleDateString("fa-IR")} تا{" "}
                    {new Date(discount.endsAt).toLocaleDateString("fa-IR")}
                  </span>
                </div>

                <div className="min-w-[100px]">
                  <PromotionUsageBar
                    usedCount={discount.usedCount}
                    usageLimit={discount.usageLimit}
                    compact
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-border gap-2">
                <button
                  onClick={() => onView(discount)}
                  className="px-3 py-1.5 text-xs font-semibold text-foreground bg-surface-subtle border border-border rounded-xl hover:bg-surface-muted transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>مشاهده</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEdit(discount)}
                    className="px-4 py-1.5 text-xs font-bold text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors"
                  >
                    ویرایش
                  </button>

                  <button
                    onClick={() => onDelete(discount)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
