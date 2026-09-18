"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Order, orderStatusLabels } from "@/types/account";
import { formatPrice } from "@/lib/formatting/currency";
import { TomanIcon } from "@/components/icons";
import { ChevronLeft, HelpCircle, Truck, Copy, Check } from "lucide-react";

interface OrderCardProps {
  order: Order;
  onViewDetails: (order: Order) => void;
  onOpenSupport?: (order: Order) => void;
}

export function OrderCard({
  order,
  onViewDetails,
  onOpenSupport,
}: OrderCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyTracking = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (order.shippingMethod.trackingCode) {
      navigator.clipboard.writeText(order.shippingMethod.trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusBadgeClass = () => {
    switch (order.status) {
      case "shipped":
        return "bg-primary/10 text-primary border-primary/20";
      case "processing":
        return "bg-amber-500/10 text-amber-700 border-amber-500/20";
      case "confirmed":
      case "pending":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20";
      case "delivered":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
      case "cancelled":
        return "bg-rose-500/10 text-rose-700 border-rose-500/20";
      default:
        return "bg-surface-subtle text-foreground border-border-subtle";
    }
  };

  return (
    <div className="w-full bg-background border border-border/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4 hover:border-border transition-colors">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-2  pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-foreground" dir="ltr">
              سفارش #{order.orderNumber}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{order.createdAt}</span>
          </div>
          <span className="text-[11px] text-muted-foreground block">
            {order.items.length} کالا
          </span>
        </div>

        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusBadgeClass()}`}
        >
          {orderStatusLabels[order.status]}
        </span>
      </div>

      {/* Item Thumbnails Preview */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
          {order.items.map((item, idx) => (
            <div
              key={item.id || idx}
              className="relative w-12 h-12 rounded-xl overflow-hidden bg-surface-subtle border border-border-subtle shrink-0"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
          ))}
        </div>

        {/* Total Price */}
        <div className="text-left shrink-0">
          <span className="text-[10px] text-muted-foreground block">مبلغ سفارش</span>
          <div className="flex items-center justify-end gap-1 font-bold text-xs sm:text-sm text-foreground">
            <span>{formatPrice(order.payableTotal)}</span>
            <TomanIcon className="w-3.5 h-3.5 text-foreground shrink-0" />
          </div>
        </div>
      </div>

      {/* Tracking info if present */}
      {order.shippingMethod.trackingCode && (
        <div className="flex items-center justify-between gap-2 bg-surface-subtle/60 border border-border-subtle rounded-xl p-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 truncate">
            <Truck className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">کد رهگیری:</span>
            <span className="font-mono font-bold text-foreground" dir="ltr">
              {order.shippingMethod.trackingCode}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyTracking}
            className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
          >
            {copied ? (
              <span className="text-emerald-600">کپی شد</span>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>کپی</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Actions Row */}
      <div className="flex items-center justify-between gap-2 pt-1 ">
        {onOpenSupport ? (
          <button
            type="button"
            onClick={() => onOpenSupport(order)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>پشتیبانی این سفارش</span>
          </button>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={() => onViewDetails(order)}
          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
        >
          <span>مشاهده جزئیات سفارش</span>
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
