"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/store/auth/auth.store";
import { accountService } from "@/lib/account/accountService";
import { Order, OrderStatus } from "@/types/account";
import { OrderCard } from "@/components/account/orders/OrderCard";
import { Container } from "@/components/ui/Container";
import { AccountPageHeader } from "@/components/account/AccountPageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { routes } from "@/lib/routes";
import { ShoppingBag, PackageX } from "lucide-react";

type OrderFilter = "all" | OrderStatus;

const filterTabs: { id: OrderFilter; label: string }[] = [
  { id: "all", label: "همه" },
  { id: "processing", label: "در حال پردازش" },
  { id: "shipped", label: "در حال ارسال" },
  { id: "delivered", label: "تحویل شده" },
  { id: "cancelled", label: "لغو شده" },
];

export default function AccountOrdersListPage() {
  const { isAuthLoading, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const loadOrders = useCallback(() => {
    setIsLoading(true);
    setIsError(false);
    try {
      const data = accountService.getOrders();
      setOrders(data);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, loadOrders]);

  if (isAuthLoading || isLoading) {
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
            href={routes.account.root}
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
        {/* Page Header */}
        <AccountPageHeader
          title="سفارش‌های من"
          description="مدیریت و پیگیری سفارش‌های شما"
          icon={ShoppingBag}
          backUrl={routes.account.root}
          backLabel="بازگشت به حساب کاربری"
          badgeText={orders.length > 0 ? `${orders.length} سفارش` : undefined}
        />

        {/* Error State */}
        {isError ? (
          <ErrorState
            title="دریافت اطلاعات سفارش‌ها با خطا مواجه شد"
            description="مشکلی در بارگیری لیست سفارش‌ها به وجود آمد. لطفاً دوباره تلاش کنید."
            onAction={loadOrders}
            actionLabel="تلاش دوباره"
          />
        ) : (
          <>
            {/* Minimal Tab Filters */}
            {orders.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
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

            {/* Orders List / Empty State */}
            {orders.length === 0 ? (
              <EmptyState
                title="هنوز سفارشی ثبت نکرده‌اید"
                description="وقتی سفارشی ثبت کنید، اطلاعات آن در این صفحه نمایش داده می‌شود."
                actionLabel="ایجاد سفارش"
                href={routes.products.list}
                icon={<PackageX className="w-7 h-7 text-muted-foreground" />}
              />
            ) : filteredOrders.length === 0 ? (
              <EmptyState
                title="سفارشی در این وضعیت یافت نشد"
                description="می‌توانید سایر فیلترها را برای پیدا کردن سفارش موردنظرتان انتخاب کنید."
                actionLabel="مشاهده همه سفارش‌ها"
                onAction={() => setActiveFilter("all")}
                icon={<PackageX className="w-7 h-7 text-muted-foreground" />}
              />
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onViewDetails={(ord) => {
                      window.location.href = routes.account.orders.detail(ord.id);
                    }}
                    onOpenSupport={(ord) => {
                      window.location.href = routes.account.support.new({ orderId: ord.id });
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
}
