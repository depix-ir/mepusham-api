"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Order, OrderStatus } from "@/types/account";
import { ActiveOrderCard } from "./ActiveOrderCard";
import { OrderCard } from "./OrderCard";
import { ShoppingBag, PackageX } from "lucide-react";

interface OrdersSectionProps {
  orders: Order[];
  onViewDetails: (order: Order) => void;
  onOpenSupport?: (order: Order) => void;
}

type OrderFilter = "all" | OrderStatus;

const filterTabs: { id: OrderFilter; label: string }[] = [
  { id: "all", label: "همه" },
  { id: "shipped", label: "در حال ارسال" },
  { id: "processing", label: "در حال پردازش" },
  { id: "delivered", label: "تحویل شده" },
  { id: "cancelled", label: "لغو شده" },
];

export function OrdersSection({
  orders,
  onViewDetails,
  onOpenSupport,
}: OrdersSectionProps) {
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("all");

  // Find most recent active order (shipped or processing) for top hero card
  const activeOrder = orders.find(
    (o) => o.status === "shipped" || o.status === "processing"
  );

  // Filter orders according to active filter
  const filteredOrders = orders.filter((order) => {
    if (activeFilter === "all") return true;
    return order.status === activeFilter;
  });

  return (
    <div className="space-y-5">
      {/* Section Header & Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary" />
            <span>سفارش‌های من</span>
          </h2>
          <span className="text-xs text-muted-foreground font-medium">
            {orders.length} سفارش
          </span>
        </div>

        {/* Compact Tabs Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-border-subtle">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            const count =
              tab.id === "all"
                ? orders.length
                : orders.filter((o) => o.status === tab.id).length;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary font-bold shadow-2xs"
                    : "bg-surface-subtle text-muted-foreground border-transparent hover:text-foreground hover:bg-surface-muted"
                }`}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero Active Order Highlight if on 'all' tab */}
      {activeFilter === "all" && activeOrder && (
        <div className="space-y-2">
          <ActiveOrderCard
            order={activeOrder}
            onViewDetails={onViewDetails}
            onOpenSupport={onOpenSupport}
          />
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            // Skip repeating the active order on 'all' tab if it's already highlighted in ActiveOrderCard above
            if (activeFilter === "all" && activeOrder && order.id === activeOrder.id) {
              return null;
            }
            return (
              <OrderCard
                key={order.id}
                order={order}
                onViewDetails={onViewDetails}
                onOpenSupport={onOpenSupport}
              />
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="py-12 px-4 border border-dashed border-border rounded-2xl text-center space-y-4 bg-surface-subtle/30">
          <div className="w-12 h-12 rounded-full bg-surface-muted text-muted-foreground mx-auto flex items-center justify-center">
            <PackageX className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">
              {activeFilter === "all"
                ? "هنوز سفارشی ثبت نکرده‌اید"
                : "سفارشی در این وضعیت یافت نشد"}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              محصول مورد علاقه‌تان را پیدا کنید و اولین سفارش خود را ثبت کنید.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-hover transition-colors"
          >
            مشاهده محصولات
          </Link>
        </div>
      )}
    </div>
  );
}
