"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Clock,
  PackageCheck,
  Truck,
  CheckCircle2,
  DollarSign,
  Package,
  AlertTriangle,
  PlusCircle,
  Boxes,
  Ticket,
  ChevronLeft,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

import { mockInitialOrders, mockInitialTickets } from "@/data/mockAccountData";
import { products } from "@/data/products";
import { formatPrice } from "@/lib/formatting/currency";
import { Badge } from "@/components/ui/Badge";

export default function AdminDashboardPage() {
  // 1. Calculate Order Stats from mockInitialOrders
  const orderStats = useMemo(() => {
    let pendingCount = 0;
    let processingCount = 0;
    let shippedCount = 0;
    let deliveredCount = 0;
    let totalRevenue = 0;

    mockInitialOrders.forEach((order) => {
      if (order.status === "pending") pendingCount++;
      else if (order.status === "processing") processingCount++;
      else if (order.status === "shipped") shippedCount++;
      else if (order.status === "delivered") deliveredCount++;

      if (order.status !== "cancelled") {
        totalRevenue += order.payableTotal;
      }
    });

    return {
      totalOrders: mockInitialOrders.length,
      pendingCount,
      processingCount,
      shippedCount,
      deliveredCount,
      totalRevenue,
    };
  }, []);

  // 2. Calculate Products Stats & Low-stock items
  const productStats = useMemo(() => {
    const totalProducts = products.length;
    // Find products where totalStock <= 5 or has available variants with stock <= 5
    const lowStockProducts = products.filter(
      (p) => p.inventory.totalStock <= 5
    );

    return {
      totalProducts,
      lowStockCount: lowStockProducts.length,
      lowStockProducts: lowStockProducts.slice(0, 5),
    };
  }, []);

  // 3. Quick Action Shortcuts
  const quickShortcuts = [
    {
      id: "add-product",
      title: "افزودن محصول جدید",
      href: "/admin/products/new",
      icon: PlusCircle,
      badge: "سریع",
    },
    {
      id: "manage-products",
      title: "مدیریت محصولات",
      href: "/admin/products",
      icon: Package,
    },
    {
      id: "inventory",
      title: "مدیریت موجودی",
      href: "/admin/inventory",
      icon: Boxes,
      count: `${productStats.lowStockCount} کم‌موجودی`,
    },
    {
      id: "orders",
      title: "مدیریت سفارش‌ها",
      href: "/admin/orders",
      icon: ShoppingBag,
      count: `${orderStats.processingCount + orderStats.pendingCount} نیازمند اقدام`,
    },
    {
      id: "tickets",
      title: "تیکت‌های پشتیبانی",
      href: "/admin/tickets",
      icon: Ticket,
      count: `${mockInitialTickets.length} تیکت`,
    },
  ];

  // 4. Status Map for Persian titles and badges
  const orderStatusMap: Record<string, { label: string; variant: "warning" | "primary" | "success" | "error" | "secondary" }> = {
    pending: { label: "در حال بررسی", variant: "warning" },
    processing: { label: "در حال آماده‌سازی", variant: "primary" },
    shipped: { label: "ارسال‌شده", variant: "primary" },
    delivered: { label: "تحویل‌شده", variant: "success" },
    cancelled: { label: "لغوشده", variant: "error" },
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">خلاصه وضعیت فروشگاه</h2>
          <p className="text-xs text-muted-foreground mt-1">
            نگاهی سریع به آخرین وضعیت سفارش‌ها، فروش و موجودی محصولات
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center gap-2 h-9 px-4 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary-hover transition-colors"
          >
            <PlusCircle className="w-3 h-3" />
            <span>افزودن محصول</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <div className="bg-background border border-border rounded-md p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">کل فروش و درآمد</span>
            <div className="p-2 rounded-md bg-primary/10 text-primary">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-lg sm:text-xl font-extrabold text-foreground">
              {formatPrice(orderStats.totalRevenue, true)}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-success mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>پرداخت‌شده و فعال</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-background border border-border rounded-md p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">تعداد کل سفارش‌ها</span>
            <div className="p-2 rounded-md bg-info/10 text-info">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-lg sm:text-xl font-extrabold text-foreground">
              {orderStats.totalOrders}
            </span>
            <span className="text-xs text-muted-foreground font-normal mr-1">سفارش</span>
            <p className="text-[11px] text-muted-foreground mt-1">
              در وضعیت‌های مختلف
            </p>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-background border border-border rounded-md p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">تعداد کل محصولات</span>
            <div className="p-2 rounded-md bg-surface-subtle text-foreground">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-lg sm:text-xl font-extrabold text-foreground">
              {productStats.totalProducts}
            </span>
            <span className="text-xs text-muted-foreground font-normal mr-1">کالا</span>
            <p className="text-[11px] text-muted-foreground mt-1">
              فعال در ویترین فروشگاه
            </p>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-background border border-border rounded-md p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">محصولات کم‌موجودی</span>
            <div className="p-2 rounded-md bg-warning/10 text-warning">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-lg sm:text-xl font-extrabold text-foreground">
              {productStats.lowStockCount}
            </span>
            <span className="text-xs text-muted-foreground font-normal mr-1">محصول</span>
            <p className="text-[11px] text-warning font-medium mt-1">
              موجودی کمتر از ۵ عدد
            </p>
          </div>
        </div>
      </div>

      {/* Orders Breakdown Strip */}
      <div className="bg-background border border-border rounded-md p-4">
        <h3 className="text-xs font-bold text-foreground mb-3">تفکیک وضعیت سفارش‌ها</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Pending */}
          <div className="flex items-center gap-3 p-2.5 rounded-md bg-surface-subtle border border-border/50">
            <Clock className="w-4 h-4 text-warning shrink-0" />
            <div>
              <p className="text-muted-foreground text-[11px]">در حال بررسی</p>
              <p className="font-bold text-foreground text-sm">{orderStats.pendingCount}</p>
            </div>
          </div>

          {/* Processing */}
          <div className="flex items-center gap-3 p-2.5 rounded-md bg-surface-subtle border border-border/50">
            <PackageCheck className="w-4 h-4 text-primary shrink-0" />
            <div>
              <p className="text-muted-foreground text-[11px]">در حال آماده‌سازی</p>
              <p className="font-bold text-foreground text-sm">{orderStats.processingCount}</p>
            </div>
          </div>

          {/* Shipped */}
          <div className="flex items-center gap-3 p-2.5 rounded-md bg-surface-subtle border border-border/50">
            <Truck className="w-4 h-4 text-info shrink-0" />
            <div>
              <p className="text-muted-foreground text-[11px]">ارسال‌شده</p>
              <p className="font-bold text-foreground text-sm">{orderStats.shippedCount}</p>
            </div>
          </div>

          {/* Delivered */}
          <div className="flex items-center gap-3 p-2.5 rounded-md bg-surface-subtle border border-border/50">
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            <div>
              <p className="text-muted-foreground text-[11px]">تحویل‌شده</p>
              <p className="font-bold text-foreground text-sm">{orderStats.deliveredCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Shortcuts */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground">دسترسی سریع و میانبرها</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickShortcuts.map((shortcut) => {
            const Icon = shortcut.icon;
            return (
              <Link
                key={shortcut.id}
                href={shortcut.href}
                className="bg-background border border-border hover:border-primary/50 hover:bg-surface-subtle rounded-md p-3.5 flex flex-col justify-between transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-md bg-surface-subtle text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  {shortcut.badge && (
                    <Badge variant="primary" size="sm">
                      {shortcut.badge}
                    </Badge>
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors block truncate">
                    {shortcut.title}
                  </span>
                  {shortcut.count && (
                    <span className="text-[10px] text-muted-foreground block truncate mt-0.5">
                      {shortcut.count}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Grid Section: Recent Orders & Low Stock Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table (Span 2) */}
        <div className="lg:col-span-2 bg-background border border-border rounded-md p-4 flex flex-col  space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">سفارش‌های اخیر</h3>
            <Link
              href="/admin/orders"
              className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
            >
              <span>مشاهده همه</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-[11px]">
                  <th className="pb-2 font-medium">شماره سفارش</th>
                  <th className="pb-2 font-medium">گیرنده</th>
                  <th className="pb-2 font-medium">تاریخ</th>
                  <th className="pb-2 font-medium">مبلغ کل</th>
                  <th className="pb-2 font-medium">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {mockInitialOrders.slice(0, 5).map((order) => {
                  const statusInfo = orderStatusMap[order.status] || {
                    label: order.status,
                    variant: "secondary",
                  };

                  return (
                    <tr key={order.id} className="hover:bg-surface-subtle transition-colors">
                      <td className="py-2.5 font-bold text-foreground dir-ltr text-right">
                        #{order.orderNumber}
                      </td>
                      <td className="py-2.5 text-foreground">
                        {order.shippingAddress.recipientName}
                      </td>
                      <td className="py-2.5 text-muted-foreground text-[11px]">
                        {order.createdAt}
                      </td>
                      <td className="py-2.5 font-semibold text-foreground">
                        {formatPrice(order.payableTotal, true)}
                      </td>
                      <td className="py-2.5">
                        <Badge variant={statusInfo.variant} size="sm">
                          {statusInfo.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Products List (Span 1) */}
        <div className="bg-background border border-border rounded-md p-4 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <h3 className="text-sm font-bold text-foreground">هشدار کم‌موجودی</h3>
            </div>
            <Link
              href="/admin/inventory"
              className="text-xs text-primary hover:underline font-medium"
            >
              مدیریت
            </Link>
          </div>

          <div className="space-y-3">
            {productStats.lowStockProducts.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">
                هیچ محصولی با موجودی بحرانی یافت نشد.
              </p>
            ) : (
              productStats.lowStockProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between gap-3 p-2 rounded-md hover:bg-surface-subtle border border-border/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-md bg-surface-subtle border border-border shrink-0 overflow-hidden flex items-center justify-center text-[10px] text-muted-foreground font-mono">
                      IMG
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">
                        {prod.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {prod.category.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-left shrink-0">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        prod.inventory.totalStock === 0
                          ? "bg-error/10 text-error"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {prod.inventory.totalStock === 0
                        ? "ناموجود"
                        : `${prod.inventory.totalStock} عدد`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <Link
            href="/admin/inventory"
            className="w-full flex items-center justify-center gap-1 py-2 text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 rounded-md transition-colors"
          >
            <span>مشاهده گزارش کامل موجودی</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Recent Tickets Activity */}
      <div className="bg-background border border-border rounded-md p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">تیکت‌های پشتیبانی جدید</h3>
          </div>
          <Link
            href="/admin/tickets"
            className="text-xs text-primary hover:underline font-medium"
          >
            مدیریت تیکت‌ها
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {mockInitialTickets.slice(0, 4).map((ticket) => (
            <div
              key={ticket.id}
              className="p-3 rounded-md bg-surface-subtle border border-border/60 flex flex-col justify-between gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground truncate">
                  {ticket.subject}
                </span>
                <span className="text-[10px] text-muted-foreground shrink-0 dir-ltr">
                  #{ticket.ticketNumber}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                {ticket.messages[ticket.messages.length - 1]?.text}
              </p>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                <span>به‌روزرسانی: {ticket.updatedAt}</span>
                <Badge
                  variant={ticket.status === "waiting-support" ? "warning" : "secondary"}
                  size="sm"
                >
                  {ticket.status === "waiting-support" ? "در انتظار پاسخ" : "پاسخ داده‌شده"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
