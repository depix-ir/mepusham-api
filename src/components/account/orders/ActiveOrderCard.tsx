"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Order, orderStatusLabels } from "@/types/account";
import { OrderTimeline } from "./OrderTimeline";
import { formatPrice } from "@/lib/formatting/currency";
import { TomanIcon } from "@/components/icons";
import { Truck, Copy, Check, ChevronLeft, PackageCheck } from "lucide-react";

interface ActiveOrderCardProps {
  order: Order;
  onViewDetails: (order: Order) => void;
  onOpenSupport?: (order: Order) => void;
}

export function ActiveOrderCard({
  order,
  onViewDetails,
  onOpenSupport,
}: ActiveOrderCardProps) {
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
      default:
        return "bg-surface-subtle text-foreground border-border-subtle";
    }
  };

  return (
    <div className="w-full bg-background border border-primary/30 rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden transition-all hover:border-primary/50">
      {/* Top Banner Accent */}
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-l from-primary via-primary/80 to-primary/40" />

      <div className="flex flex-col gap-4">
        {/* Header Row */}
        <div className="flex items-center justify-between gap-2 border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">آخرین سفارش</span>
                <span className="text-xs font-bold text-foreground" dir="ltr">
                  #{order.orderNumber}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground block">
                {order.createdAt} • {order.items.length} کالا
              </span>
            </div>
          </div>

          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusBadgeClass()}`}
          >
            {orderStatusLabels[order.status]}
          </span>
        </div>

        {/* Progress Bar / Timeline */}
        <OrderTimeline timeline={order.timeline} compact />

        {/* Tracking Code Section if Available */}
        {order.shippingMethod.trackingCode && (
          <div className="bg-surface-subtle/80 border border-border-subtle rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-foreground">
              <Truck className="w-4 h-4 text-primary shrink-0" />
              <span>
                {order.shippingMethod.carrierName || order.shippingMethod.title}:
              </span>
              <span className="font-mono font-bold tracking-wider" dir="ltr">
                {order.shippingMethod.trackingCode}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyTracking}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer bg-background px-2.5 py-1 rounded-lg border border-border-subtle shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">کپی شد</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>کپی کد رهگیری</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Item Thumbnails Row & Total Amount */}
        <div className="flex items-center justify-between gap-3 pt-1">
          {/* Thumbnails list */}
          <div className="flex items-center -space-x-2 space-x-reverse overflow-hidden">
            {order.items.slice(0, 4).map((item, idx) => (
              <div
                key={item.id || idx}
                className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-background bg-surface-subtle shrink-0 shadow-2xs"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
            ))}
            {order.items.length > 4 && (
              <div className="w-10 h-10 rounded-lg bg-surface-subtle border-2 border-background flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                +{order.items.length - 4}
              </div>
            )}
          </div>

          {/* Amount & CTA Buttons */}
          <div className="flex items-center gap-3">
            <div className="text-left hidden sm:block">
              <span className="text-[10px] text-muted-foreground block">مبلغ قابل پرداخت</span>
              <div className="flex items-center justify-end gap-1 font-bold text-sm text-foreground">
                <span>{formatPrice(order.payableTotal)}</span>
                <TomanIcon className="w-3.5 h-3.5 text-foreground shrink-0" />
              </div>
            </div>

            <button
              type="button"
              onClick={() => onViewDetails(order)}
              className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-primary-hover transition-colors cursor-pointer"
            >
              <span>مشاهده جزئیات</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
