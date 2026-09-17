"use client";

import React from "react";
import Link from "next/link";
import { Order, getNextAdminStatus, canAdminCancelOrder, orderStatusLabels } from "@/types/account";
import { formatPrice } from "@/lib/formatting/currency";
import { OrderStatusBadge } from "./OrderStatusBadge";
import {
  X,
  User,
  Phone,
  MapPin,
  Truck,
  Package,
  Calendar,
  ExternalLink,
  Printer,
  Ban,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

interface AdminOrderDetailDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (orderId: string, nextStatus: import("@/types/account").OrderStatus) => void;
  onCancel: (order: Order) => void;
  onPrint: (order: Order) => void;
}

export function AdminOrderDetailDrawer({
  order,
  isOpen,
  onClose,
  onStatusChange,
  onCancel,
  onPrint,
}: AdminOrderDetailDrawerProps) {
  if (!isOpen || !order) return null;

  const nextStatus = getNextAdminStatus(order.status);
  const canCancel = canAdminCancelOrder(order.status);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-lg bg-background h-full shadow-2xl flex flex-col z-50 overflow-hidden text-foreground border-l border-border animate-in slide-in-from-right duration-200 dir-rtl">
        {/* Drawer Header */}
        <div className="h-16 px-5 border-b border-border flex items-center justify-between shrink-0 bg-surface-subtle/40">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-foreground">
              سفارش #{order.orderNumber}
            </h2>
            <OrderStatusBadge status={order.status} />
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-surface-subtle rounded-lg transition-colors"
            title="بستن"
          >
            <X className="" />
          </button>
        </div>

        {/* Drawer Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Quick Info Bar */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-surface-subtle/50 p-3.5 rounded-xl border border-border-subtle">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4 shrink-0 text-primary" />
              <span>تاریخ:</span>
              <strong className="text-foreground">{order.createdAt}</strong>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="w-4 h-4 shrink-0 text-primary" />
              <span>تعداد اقلام:</span>
              <strong className="text-foreground">
                {order.items.reduce((acc, i) => acc + i.quantity, 0)} عدد
              </strong>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              اطلاعات مشتری
            </h3>
            <div className="bg-background border border-border rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{order.shippingAddress.recipientName}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground dir-ltr">
                  <span>{order.shippingAddress.phone}</span>
                  <Phone className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground pt-1 border-t border-border/60">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-foreground">
                    {order.shippingAddress.province}، {order.shippingAddress.city}، {order.shippingAddress.address}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    کد پستی: {order.shippingAddress.postalCode}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              اطلاعات ارسال
            </h3>
            <div className="bg-background border border-border rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" />
                  روش ارسال:
                </span>
                <span className="font-bold text-foreground">{order.shippingMethod.title}</span>
              </div>
              {order.shippingMethod.trackingCode && (
                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <span className="text-muted-foreground">کد رهگیری پستی:</span>
                  <span className="font-mono font-bold text-primary">
                    {order.shippingMethod.trackingCode}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Items Snapshot List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              اقلام سفارش ({order.items.length})
            </h3>
            <div className="border border-border rounded-xl divide-y divide-border/60 overflow-hidden bg-background">
              {order.items.map((item) => {
                const variantString = item.variant
                  ? Object.values(item.variant).filter(Boolean).join(" / ")
                  : null;

                return (
                  <div key={item.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-12 h-12 rounded-lg object-cover border border-border shrink-0 bg-surface-subtle"
                      />
                      <div className="min-w-0 space-y-1">
                        <p className="font-medium text-foreground truncate">{item.title}</p>
                        {variantString && (
                          <p className="text-[11px] text-muted-foreground">
                            تنوع: {variantString}
                          </p>
                        )}
                        <p className="text-[11px] text-muted-foreground">
                          تعداد: <span className="font-bold text-foreground">{item.quantity}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-left shrink-0">
                      <p className="font-bold text-foreground">
                        {formatPrice(item.unitPrice * item.quantity)} تومان
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-[10px] text-muted-foreground">
                          هر واحد: {formatPrice(item.unitPrice)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              خلاصه مالی
            </h3>
            <div className="bg-surface-subtle/50 border border-border-subtle rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>مجموع محصولات:</span>
                <span>{formatPrice(order.itemsSubtotal)} تومان</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>هزینه ارسال:</span>
                <span>
                  {order.shippingCost === 0 ? "رایگان" : `${formatPrice(order.shippingCost)} تومان`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-foreground pt-2 border-t border-border">
                <span>مبلغ نهایی:</span>
                <span className="text-primary">{formatPrice(order.payableTotal)} تومان</span>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-border bg-surface-subtle/40 space-y-2 shrink-0">
          <div className="flex items-center gap-2">
            {nextStatus && (
              <button
                type="button"
                onClick={() => onStatusChange(order.id, nextStatus)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تغییر وضعیت به «{orderStatusLabels[nextStatus]}»</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onPrint(order)}
              className="px-3.5 py-2.5 bg-background border border-border text-foreground hover:bg-surface-subtle text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title="چاپ فاکتور"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">چاپ</span>
            </button>

            {canCancel && (
              <button
                type="button"
                onClick={() => onCancel(order)}
                className="px-3.5 py-2.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                title="لغو سفارش"
              >
                <Ban className="w-4 h-4" />
                <span className="hidden sm:inline">لغو</span>
              </button>
            )}
          </div>

          <Link
            href={`/orders/${order.id}`}
            target="_blank"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-surface-subtle hover:bg-surface-muted text-muted-foreground hover:text-foreground text-xs font-semibold rounded-xl transition-colors"
          >
            <span>مشاهده جزئیات کامل سفارش</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
