"use client";

import React from "react";
import { FreeShippingRule, freeShippingScopeLabels, getPromotionStatus } from "@/types/promotion";
import { PromotionStatusBadge } from "./PromotionStatusBadge";
import { PromotionUsageBar } from "./PromotionUsageBar";
import { formatPrice } from "@/lib/formatting/currency";
import { Edit, Eye, Trash2, Power, Truck, Calendar } from "lucide-react";

interface FreeShippingTableProps {
  rules: FreeShippingRule[];
  onView: (rule: FreeShippingRule) => void;
  onEdit: (rule: FreeShippingRule) => void;
  onDeactivate: (rule: FreeShippingRule) => void;
  onDelete: (rule: FreeShippingRule) => void;
}

export function FreeShippingTable({
  rules,
  onView,
  onEdit,
  onDeactivate,
  onDelete,
}: FreeShippingTableProps) {
  if (rules.length === 0) {
    return (
      <div className="bg-background border border-border rounded-2xl p-8 text-center text-muted-foreground my-4">
        <Truck className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
        <h4 className="font-bold text-base text-foreground">هیچ قانون ارسال رایگانی یافت نشد</h4>
        <p className="text-xs mt-1">
          برای افزودن قانون جدید روی دکمه «ایجاد قانون ارسال رایگان» کلیک کنید.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop Data Table */}
      <div className="hidden md:block bg-background border border-border rounded-2xl overflow-hidden shadow-2xs my-4">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-surface-subtle border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="p-3.5 pr-4">عنوان قانون</th>
                <th className="p-3.5">محدوده</th>
                <th className="p-3.5">حداقل خرید</th>
                <th className="p-3.5">حداکثر خرید</th>
                <th className="p-3.5">بازه زمانی</th>
                <th className="p-3.5">استفاده</th>
                <th className="p-3.5">وضعیت</th>
                <th className="p-3.5 pl-4 text-left">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rules.map((rule) => {
                const status = getPromotionStatus(
                  rule.isActive,
                  rule.startsAt,
                  rule.endsAt
                );

                return (
                  <tr
                    key={rule.id}
                    className="hover:bg-surface-subtle/50 transition-colors group"
                  >
                    {/* Title */}
                    <td className="p-3.5 pr-4 max-w-[200px]">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-sm text-foreground truncate">
                          {rule.title}
                        </span>
                        {rule.description && (
                          <span className="text-[11px] text-muted-foreground truncate">
                            {rule.description}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Scope */}
                    <td className="p-3.5">
                      <span className="px-2 py-1 bg-surface-subtle border border-border-subtle rounded-lg text-[11px] font-semibold text-foreground">
                        {freeShippingScopeLabels[rule.scope]}
                      </span>
                    </td>

                    {/* Min Purchase */}
                    <td className="p-3.5 font-semibold text-foreground">
                      {rule.minPurchaseAmount
                        ? `${formatPrice(rule.minPurchaseAmount)} تومان`
                        : "بدون حداقل"}
                    </td>

                    {/* Max Purchase */}
                    <td className="p-3.5 text-muted-foreground">
                      {rule.maxPurchaseAmount
                        ? `${formatPrice(rule.maxPurchaseAmount)} تومان`
                        : "نامحدود"}
                    </td>

                    {/* Time */}
                    <td className="p-3.5 text-[11px] text-muted-foreground">
                      <div className="flex flex-col gap-0.5 dir-ltr text-right">
                        <span>
                          {new Date(rule.startsAt).toLocaleDateString("fa-IR")}
                        </span>
                        <span>
                          تا {new Date(rule.endsAt).toLocaleDateString("fa-IR")}
                        </span>
                      </div>
                    </td>

                    {/* Usage */}
                    <td className="p-3.5 min-w-[110px]">
                      <PromotionUsageBar
                        usedCount={rule.usedCount}
                        usageLimit={rule.usageLimit}
                        compact
                      />
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      <PromotionStatusBadge status={status} />
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 pl-4 text-left">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onView(rule)}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-muted rounded-lg transition-colors"
                          title="مشاهده جزییات"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(rule)}
                          className="px-2.5 py-1 text-xs font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                        >
                          ویرایش
                        </button>
                        {rule.isActive && (
                          <button
                            onClick={() => onDeactivate(rule)}
                            className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                            title="غیرفعال کردن"
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(rule)}
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

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3 my-4">
        {rules.map((rule) => {
          const status = getPromotionStatus(
            rule.isActive,
            rule.startsAt,
            rule.endsAt
          );

          return (
            <div
              key={rule.id}
              className="bg-background border border-border rounded-2xl p-4 shadow-2xs flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-foreground">
                    {rule.title}
                  </h4>
                  <span className="text-[11px] text-muted-foreground mt-0.5 block">
                    محدوده: {freeShippingScopeLabels[rule.scope]}
                  </span>
                </div>
                <PromotionStatusBadge status={status} />
              </div>

              <div className="grid grid-cols-2 gap-2 bg-surface-subtle p-2.5 rounded-xl text-xs">
                <div>
                  <span className="text-[11px] text-muted-foreground block">
                    حداقل خرید
                  </span>
                  <span className="font-bold text-foreground">
                    {rule.minPurchaseAmount
                      ? `${formatPrice(rule.minPurchaseAmount)} تومان`
                      : "بدون حداقل"}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">
                    حداکثر خرید
                  </span>
                  <span className="font-bold text-foreground">
                    {rule.maxPurchaseAmount
                      ? `${formatPrice(rule.maxPurchaseAmount)} تومان`
                      : "نامحدود"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/60">
                <div className="flex items-center gap-1 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>
                    {new Date(rule.startsAt).toLocaleDateString("fa-IR")} تا{" "}
                    {new Date(rule.endsAt).toLocaleDateString("fa-IR")}
                  </span>
                </div>

                <div className="min-w-[100px]">
                  <PromotionUsageBar
                    usedCount={rule.usedCount}
                    usageLimit={rule.usageLimit}
                    compact
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border gap-2">
                <button
                  onClick={() => onView(rule)}
                  className="px-3 py-1.5 text-xs font-semibold text-foreground bg-surface-subtle border border-border rounded-xl hover:bg-surface-muted transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>مشاهده</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEdit(rule)}
                    className="px-4 py-1.5 text-xs font-bold text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors"
                  >
                    ویرایش
                  </button>

                  <button
                    onClick={() => onDelete(rule)}
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
