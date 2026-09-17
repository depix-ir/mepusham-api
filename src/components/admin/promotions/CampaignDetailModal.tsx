"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { Campaign, getPromotionStatus } from "@/types/promotion";
import { PromotionStatusBadge } from "./PromotionStatusBadge";
import { PromotionUsageBar } from "./PromotionUsageBar";
import { products as ALL_PRODUCTS } from "@/data/products";
import { formatPrice } from "@/lib/formatting/currency";
import {
  X,
  Sparkles,
  Package,
  Calendar,
  Clock,
  Edit,
  Power,
  Trash2,
  DollarSign,
  Info,
} from "lucide-react";

interface CampaignDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign | null;
  onEdit: (campaign: Campaign) => void;
  onDeactivate: (campaign: Campaign) => void;
  onDelete: (campaign: Campaign) => void;
}

export function CampaignDetailModal({
  isOpen,
  onClose,
  campaign,
  onEdit,
  onDeactivate,
  onDelete,
}: CampaignDetailModalProps) {
  const affectedProducts = useMemo(() => {
    if (!campaign) return [];
    return ALL_PRODUCTS.filter((p) => campaign.productIds.includes(p.id));
  }, [campaign]);

  if (!isOpen || !campaign) return null;

  const status = getPromotionStatus(
    campaign.isActive,
    campaign.startsAt,
    campaign.endsAt
  );

  const startDateStr = new Date(campaign.startsAt).toLocaleString("fa-IR");
  const endDateStr = new Date(campaign.endsAt).toLocaleString("fa-IR");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-background border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden dir-rtl">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between shrink-0 bg-surface-subtle">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base md:text-lg text-foreground">
                  {campaign.title}
                </h3>
                <PromotionStatusBadge status={status} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                شناسه: {campaign.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-muted rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 no-scrollbar">
          {/* Top Description if exists */}
          {campaign.description && (
            <div className="p-3.5 bg-surface-subtle border border-border rounded-xl text-xs md:text-sm text-foreground flex items-start gap-2.5">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="leading-relaxed">{campaign.description}</p>
            </div>
          )}

          {/* Grid Information Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Purchase Conditions & Limits */}
            <div className="p-4 bg-surface-subtle border border-border rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-2 pb-2 border-b border-border">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>شرایط و سقف خرید</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">حداقل مبلغ خرید:</span>
                  <span className="font-bold text-foreground">
                    {campaign.minPurchaseAmount
                      ? `${formatPrice(campaign.minPurchaseAmount)} تومان`
                      : "بدون حداقل"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">حداکثر مبلغ خرید:</span>
                  <span className="font-bold text-foreground">
                    {campaign.maxPurchaseAmount
                      ? `${formatPrice(campaign.maxPurchaseAmount)} تومان`
                      : "بدون حداکثر"}
                  </span>
                </div>

                <div className="pt-2 border-t border-border-subtle">
                  <span className="text-muted-foreground block mb-1">
                    میزان استفاده از سقف:
                  </span>
                  <PromotionUsageBar
                    usedCount={campaign.usedCount}
                    usageLimit={campaign.usageLimit}
                  />
                </div>
              </div>
            </div>

            {/* Time Window */}
            <div className="p-4 bg-surface-subtle border border-border rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-2 pb-2 border-b border-border">
                <Calendar className="w-4 h-4 text-primary" />
                <span>زمان برگزاری</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">تاریخ و ساعت شروع:</span>
                  <span className="font-bold text-foreground dir-ltr">
                    {startDateStr}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">تاریخ و ساعت پایان:</span>
                  <span className="font-bold text-foreground dir-ltr">
                    {endDateStr}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-border-subtle">
                  <span className="text-muted-foreground">تعداد محصولات:</span>
                  <span className="font-bold text-primary">
                    {campaign.productIds.length.toLocaleString("fa-IR")} محصول
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Products List Section */}
          <div className="space-y-3">
            <h4 className="text-xs md:text-sm font-bold text-foreground flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              <span>محصولات این کمپین ({affectedProducts.length.toLocaleString("fa-IR")})</span>
            </h4>

            {affectedProducts.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                هیچ جزئیاتی از محصولات یافت نشد.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                {affectedProducts.map((prod) => {
                  const imgUrl = prod.images?.[0]?.url || "/images/product-1.webp";
                  return (
                    <div
                      key={prod.id}
                      className="flex items-center gap-3 p-2 bg-surface-subtle border border-border rounded-xl"
                    >
                      <div className="w-10 h-10 relative rounded-lg bg-background overflow-hidden border border-border-subtle shrink-0">
                        <Image
                          src={imgUrl}
                          alt={prod.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-semibold text-foreground truncate">
                          {prod.title}
                        </h5>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {formatPrice(prod.pricing.minPrice)} تومان
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-border bg-surface-subtle flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {campaign.isActive && (
              <button
                type="button"
                onClick={() => {
                  onDeactivate(campaign);
                  onClose();
                }}
                className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors flex items-center gap-1.5"
              >
                <Power className="w-3.5 h-3.5" />
                <span>غیرفعال کردن</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onDelete(campaign);
                onClose();
              }}
              className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف کمپین</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-foreground bg-background border border-border rounded-xl hover:bg-surface-muted transition-colors"
            >
              بستن
            </button>

            <button
              type="button"
              onClick={() => {
                onEdit(campaign);
                onClose();
              }}
              className="px-5 py-2 text-xs font-bold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>ویرایش کمپین</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
