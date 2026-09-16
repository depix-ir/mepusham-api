"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Order, orderStatusLabels } from "@/types/account";
import { formatPrice } from "@/lib/formatting/currency";
import { TomanIcon } from "@/components/icons";
import { Truck, Copy, Check, ArrowLeft } from "lucide-react";

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyTracking = (e: React.MouseEvent) => {
    e.preventDefault();
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
      case "returned":
        return "bg-purple-500/10 text-purple-700 border-purple-500/20";
      default:
        return "bg-surface-subtle text-foreground border-border-subtle";
    }
  };

  const maxThumbnails = 3;
  const visibleItems = order.items.slice(0, maxThumbnails);
  const remainingCount = order.items.length - maxThumbnails;

  return (
    <div className="w-full bg-background border border-border  rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-border transition-all space-y-4">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3  pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-foreground" dir="ltr">
            سفارش #{order.orderNumber}
          </span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">{order.createdAt}</span>
        </div>

        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${getStatusBadgeClass()}`}
        >
          {orderStatusLabels[order.status]}
        </span>
      </div>

      {/* Middle Row: Product Thumbnails + Price Summary */}
      <div className="flex items-center bg-surface-subtle p-4 rounded justify-between gap-4">
        {/* Product Thumbnails Preview */}
        <div className="flex items-center gap-2 overflow-x-auto py-0.5 no-scrollbar">
          {visibleItems.map((item, idx) => (
            <div
              key={item.id || idx}
              className="relative w-12 h-12 rounded-xl overflow-hidden bg-surface-subtle border border-border-subtle shrink-0"
              title={item.title}
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

          {remainingCount > 0 && (
            <div className="w-12 h-12 rounded-xl bg-surface-subtle border border-border-subtle flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0" dir="ltr">
              +{remainingCount}
            </div>
          )}
        </div>

        {/* Amount & Items Count */}
        <div className="text-left shrink-0">
          <span className="text-[11px] text-muted-foreground block">
            {order.items.length} کالا • مبلغ قابل پرداخت
          </span>
          <div className="flex items-center justify-end gap-1 font-bold text-sm sm:text-base text-foreground mt-0.5">
            <span>{formatPrice(order.payableTotal)}</span>
            <TomanIcon className="w-3.5 h-3.5 text-foreground shrink-0" />
          </div>
        </div>
      </div>

      {/* Tracking info snippet if tracking code exists */}
      {order.shippingMethod.trackingCode && (
        <div className="flex items-center justify-between gap-2 bg-surface-subtle/60 border border-border-subtle rounded-xl px-3 py-2 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground truncate">
            <Truck className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">{order.shippingMethod.title}:</span>
            <span className="font-mono font-bold text-foreground" dir="ltr">
              {order.shippingMethod.trackingCode}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyTracking}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 shrink-0 cursor-pointer py-1 px-2 rounded-lg hover:bg-background"
          >
            {copied ? (
              <span className="text-emerald-600 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>کپی شد</span>
              </span>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>کپی</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Bottom CTA Action Bar */}
      <div className="flex items-center justify-between gap-2 pt-2 ">
        <Link
          href="/support"
          className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
        >
          <span>پشتیبانی سفارش</span>
        </Link>

        <Link
          href={`/orders/${order.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer group ms-auto"
        >
          <span>مشاهده جزئیات سفارش</span>
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
