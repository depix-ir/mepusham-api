"use client";

import React from "react";
import Link from "next/link";
import { Order, orderStatusLabels } from "@/types/account";
import { ShoppingBag, ArrowLeft, Package, Clock } from "lucide-react";

interface AccountOrdersSummaryProps {
  orders: Order[];
}

export function AccountOrdersSummary({ orders }: AccountOrdersSummaryProps) {
  const latestOrder = orders.length > 0 ? orders[0] : null;

  const getStatusBadgeClass = (status: Order["status"]) => {
    switch (status) {
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
    <div className="bg-background border border-border-subtle rounded-2xl p-4 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">سفارش‌های من</h2>
            <p className="text-xs text-muted-foreground">{orders.length} سفارش ثبت شده</p>
          </div>
        </div>

        <Link
          href="/orders"
          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline group cursor-pointer"
        >
          <span>مشاهده همه</span>
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        </Link>
      </div>

      {/* Latest Order Summary Snippet */}
      {latestOrder ? (
        <div className="p-3.5 bg-surface-subtle/50 border border-border-subtle rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-foreground" dir="ltr">
                سفارش #{latestOrder.orderNumber}
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(
                  latestOrder.status
                )}`}
              >
                {orderStatusLabels[latestOrder.status]}
              </span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                {latestOrder.createdAt}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Package className="w-3 h-3 text-muted-foreground" />
                {latestOrder.items.length} کالا
              </span>
            </div>
          </div>

          <Link
            href={`/orders/${latestOrder.id}`}
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-background border border-border-subtle text-xs font-bold text-foreground hover:bg-surface-subtle transition-colors shrink-0"
          >
            مشاهده جزئیات
          </Link>
        </div>
      ) : (
        <div className="py-4 text-center text-xs text-muted-foreground bg-surface-subtle/30 rounded-xl border border-dashed border-border-subtle">
          هنوز سفارشی ثبت نکرده‌اید.
        </div>
      )}
    </div>
  );
}
