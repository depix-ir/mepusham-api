"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/store/auth/auth.store";
import { accountService } from "@/lib/account/accountService";
import { Order, OrderStatus } from "@/types/account";
import { OrderCard } from "@/components/orders/OrderCard";
import { Container } from "@/components/ui/Container";
import { ShoppingBag, PackageX, ChevronLeft, ArrowRight } from "lucide-react";

type OrderFilter = "all" | OrderStatus;

const filterTabs: { id: OrderFilter; label: string }[] = [
  { id: "all", label: "همه" },
  { id: "processing", label: "در حال پردازش" },
  { id: "shipped", label: "در حال ارسال" },
  { id: "delivered", label: "تحویل شده" },
  { id: "cancelled", label: "لغو شده" },
];

export default function OrdersPage() {
  const { isAuthLoading, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("all");

  useEffect(() => {
    setOrders(accountService.getOrders());
  }, []);

  if (isAuthLoading) {
    return (
      <div className="py-20 text-center min-h-[60vh] flex items-center justify-center">
        <Container>
          <div className="w-10 h-10 rounded-full border-3 border-primary/30 border-t-primary animate-spin mx-auto" />
        </Container>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Container className="max-w-md mx-auto space-y-4">
          <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto" />
          <h1 className="text-lg font-bold text-foreground">
            برای مشاهده سفارش‌ها باید وارد حساب کاربری شوید.
          </h1>
          <p className="text-xs text-muted-foreground">
            لطفاً ابتدا با شماره موبایل خود وارد حساب کاربری شوید.
          </p>
          <Link
            href="/account"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary-hover transition-colors shadow-xs"
          >
            ورود به حساب کاربری
          </Link>
        </Container>
      </div>
    );
  }

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === "all") return true;
    return order.status === activeFilter;
  });

  return (
    <div className="py-6 max-w-[800px] m-auto sm:py-10 bg-background min-h-screen pb-24 md:pb-12">
      <Container className="max-w-4xl space-y-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            خانه
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
          <Link href="/account" className="hover:text-foreground transition-colors">
            حساب کاربری
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
          <span className="text-foreground font-bold">سفارش‌های من</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3  pb-4">
          <div className="space-y-1">
            <h1 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <span>سفارش‌های من</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              مدیریت و پیگیری سفارش‌های شما
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
              {orders.length} سفارش
            </span>
          </div>
        </div>

        {/* Minimal Tab Filters */}
        {orders.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar ">
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
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-colors cursor-pointer border ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                      : "bg-surface-subtle text-muted-foreground border-transparent hover:text-foreground hover:bg-surface-muted"
                  }`}
                >
                  {tab.label} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-16 px-4 border border-dashed border-border-subtle rounded-2xl text-center space-y-4 bg-surface-subtle/20">
            <div className="w-12 h-12 rounded-full bg-surface-muted text-muted-foreground mx-auto flex items-center justify-center">
              <PackageX className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-foreground">
                {activeFilter === "all"
                  ? "هنوز سفارشی ثبت نکرده‌اید"
                  : "سفارشی در این وضعیت یافت نشد"}
              </h2>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {activeFilter === "all"
                  ? "وقتی سفارشی ثبت کنید، اطلاعات آن در این صفحه نمایش داده می‌شود."
                  : "می‌توانید سایر فیلترها را برای پیدا کردن سفارش موردنظرتان انتخاب کنید."}
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-hover transition-colors shadow-xs"
            >
              مشاهده محصولات
            </Link>
          </div>
        )}
      </Container>
    </div>
  );
}
