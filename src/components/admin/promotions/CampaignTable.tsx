"use client";

import React from "react";
import { Campaign, getPromotionStatus } from "@/types/promotion";
import { PromotionStatusBadge } from "./PromotionStatusBadge";
import { PromotionUsageBar } from "./PromotionUsageBar";
import { formatPrice } from "@/lib/formatting/currency";
import {
  Eye,
  Edit,
  Power,
  Trash2,
  Calendar,
  Package,
  Sparkles,
  ShoppingBag,
  MoreVertical,
} from "lucide-react";

interface CampaignTableProps {
  campaigns: Campaign[];
  onView: (campaign: Campaign) => void;
  onEdit: (campaign: Campaign) => void;
  onDeactivate: (campaign: Campaign) => void;
  onDelete: (campaign: Campaign) => void;
}

export function CampaignTable({
  campaigns,
  onView,
  onEdit,
  onDeactivate,
  onDelete,
}: CampaignTableProps) {
  if (campaigns.length === 0) {
    return (
      <div className="bg-background border border-border rounded-2xl p-8 md:p-12 text-center dir-rtl">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6 md:w-8 md:h-8" />
        </div>
        <h3 className="text-base md:text-lg font-bold text-foreground">
          هنوز کمپینی ایجاد نشده
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto mt-1">
          برای برنامه‌ریزی جشنواره‌ها و کمپین‌های فروش گروهی محصولات، اولین کمپین خود را ایجاد کنید.
        </p>
      </div>
    );
  }

  return (
    <div className="dir-rtl">
      {/* Desktop Data Table (hidden on mobile/tablet) */}
      <div className="hidden lg:block bg-background border border-border rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs md:text-sm">
            <thead className="bg-surface-subtle border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="py-3.5 px-4">کمپین</th>
                <th className="py-3.5 px-4">محصولات</th>
                <th className="py-3.5 px-4">شرایط خرید</th>
                <th className="py-3.5 px-4">زمان برگزاری</th>
                <th className="py-3.5 px-4">استفاده</th>
                <th className="py-3.5 px-4">وضعیت</th>
                <th className="py-3.5 px-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {campaigns.map((camp) => {
                const status = getPromotionStatus(
                  camp.isActive,
                  camp.startsAt,
                  camp.endsAt
                );

                const startDateStr = new Date(camp.startsAt).toLocaleDateString("fa-IR");
                const endDateStr = new Date(camp.endsAt).toLocaleDateString("fa-IR");

                return (
                  <tr
                    key={camp.id}
                    className="hover:bg-surface-subtle/50 transition-colors group"
                  >
                    {/* Title & Desc */}
                    <td className="py-4 px-4 max-w-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-foreground block truncate">
                            {camp.title}
                          </span>
                          {camp.description && (
                            <span className="text-xs text-muted-foreground truncate block">
                              {camp.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Product count */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-subtle text-foreground text-xs font-semibold">
                        <Package className="w-3.5 h-3.5 text-primary" />
                        <span>{camp.productIds.length.toLocaleString("fa-IR")} محصول</span>
                      </span>
                    </td>

                    {/* Purchase conditions */}
                    <td className="py-4 px-4 whitespace-nowrap text-xs">
                      {camp.minPurchaseAmount || camp.maxPurchaseAmount ? (
                        <div className="space-y-0.5">
                          {camp.minPurchaseAmount && (
                            <div className="text-foreground">
                              <span className="text-muted-foreground">حداقل: </span>
                              <span className="font-semibold">{formatPrice(camp.minPurchaseAmount)}</span> تومان
                            </div>
                          )}
                          {camp.maxPurchaseAmount && (
                            <div className="text-foreground">
                              <span className="text-muted-foreground">حداکثر: </span>
                              <span className="font-semibold">{formatPrice(camp.maxPurchaseAmount)}</span> تومان
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">بدون محدودیت مبلغ</span>
                      )}
                    </td>

                    {/* Time window */}
                    <td className="py-4 px-4 whitespace-nowrap text-xs text-foreground">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span>{startDateStr}</span>
                        <span className="text-muted-foreground">←</span>
                        <span>{endDateStr}</span>
                      </div>
                    </td>

                    {/* Usage bar */}
                    <td className="py-4 px-4 whitespace-nowrap w-36">
                      <PromotionUsageBar
                        usedCount={camp.usedCount}
                        usageLimit={camp.usageLimit}
                      />
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <PromotionStatusBadge status={status} />
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onView(camp)}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="مشاهده جزئیات"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onEdit(camp)}
                          className="p-1.5 text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10 rounded-lg transition-colors"
                          title="ویرایش کمپین"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {camp.isActive && (
                          <button
                            type="button"
                            onClick={() => onDeactivate(camp)}
                            className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="غیرفعال کردن"
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onDelete(camp)}
                          className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="حذف کمپین"
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

      {/* Mobile & Tablet Card Layout (hidden on lg screens) */}
      <div className="lg:hidden space-y-3">
        {campaigns.map((camp) => {
          const status = getPromotionStatus(
            camp.isActive,
            camp.startsAt,
            camp.endsAt
          );

          const startDateStr = new Date(camp.startsAt).toLocaleDateString("fa-IR");
          const endDateStr = new Date(camp.endsAt).toLocaleDateString("fa-IR");

          return (
            <div
              key={camp.id}
              className="bg-background border border-border rounded-2xl p-4 shadow-2xs space-y-3"
            >
              {/* Header: Title & Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-foreground truncate">
                      {camp.title}
                    </h4>
                    {camp.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {camp.description}
                      </p>
                    )}
                  </div>
                </div>
                <PromotionStatusBadge status={status} />
              </div>

              {/* Info Badges Row */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border/60">
                <div className="flex items-center gap-1.5 text-foreground bg-surface-subtle p-2 rounded-xl">
                  <Package className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="font-semibold">
                    {camp.productIds.length.toLocaleString("fa-IR")} محصول
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-foreground bg-surface-subtle p-2 rounded-xl">
                  <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="font-medium text-[11px] truncate">
                    {startDateStr} تا {endDateStr}
                  </span>
                </div>
              </div>

              {/* Conditions & Usage */}
              <div className="space-y-1.5 bg-surface-subtle/40 p-2.5 rounded-xl border border-border-subtle text-xs">
                {(camp.minPurchaseAmount || camp.maxPurchaseAmount) ? (
                  <div className="flex justify-between items-center text-muted-foreground text-[11px]">
                    <span>شرایط خرید:</span>
                    <span className="font-semibold text-foreground">
                      {camp.minPurchaseAmount ? `از ${formatPrice(camp.minPurchaseAmount)}` : ""}
                      {camp.maxPurchaseAmount ? ` تا ${formatPrice(camp.maxPurchaseAmount)}` : ""} تومان
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-muted-foreground text-[11px]">
                    <span>شرایط خرید:</span>
                    <span className="font-semibold text-foreground">بدون محدودیت مبلغ</span>
                  </div>
                )}

                <div className="pt-1">
                  <PromotionUsageBar
                    usedCount={camp.usedCount}
                    usageLimit={camp.usageLimit}
                  />
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-border">
                <button
                  type="button"
                  onClick={() => onView(camp)}
                  className="px-3 py-1.5 text-xs font-semibold text-foreground bg-surface-subtle rounded-xl hover:bg-surface-muted transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>مشاهده</span>
                </button>

                <button
                  type="button"
                  onClick={() => onEdit(camp)}
                  className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>ویرایش</span>
                </button>

                {camp.isActive && (
                  <button
                    type="button"
                    onClick={() => onDeactivate(camp)}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors flex items-center gap-1"
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>غیرفعال</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onDelete(camp)}
                  className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="حذف کمپین"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
