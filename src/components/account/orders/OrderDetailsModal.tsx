"use client";

import React, { useEffect, useState } from "react";
import { Order, orderStatusLabels } from "@/types/account";
import { OrderTimeline } from "./OrderTimeline";
import { OrderItemRow } from "./OrderItemRow";
import { formatPrice } from "@/lib/formatting/currency";
import { TomanIcon } from "@/components/icons";
import {
  X,
  Truck,
  MapPin,
  HelpCircle,
  Copy,
  Check,
  PackageCheck,
} from "lucide-react";

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenSupport?: (order: Order) => void;
}

export function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onOpenSupport,
}: OrderDetailsModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const handleCopyTracking = () => {
    if (order.shippingMethod.trackingCode) {
      navigator.clipboard.writeText(order.shippingMethod.trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="order-details-title"
    >
      <div
        className="relative w-full max-w-2xl bg-background border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle bg-surface-subtle/50">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-primary" />
            <div>
              <h3 id="order-details-title" className="text-sm sm:text-base font-bold text-foreground">
                جزئیات سفارش <span dir="ltr">#{order.orderNumber}</span>
              </h3>
              <p className="text-[11px] text-muted-foreground">
                ثبت شده در {order.createdAt}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-surface-subtle transition-colors cursor-pointer"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Order Status & Visual Timeline */}
          <div className="bg-surface-subtle/60 border border-border-subtle rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">وضعیت فعلی سفارش:</span>
              <span className="font-bold text-primary text-sm">
                {orderStatusLabels[order.status]}
              </span>
            </div>

            <OrderTimeline timeline={order.timeline} />
          </div>

          {/* Tracking Details if Available */}
          {order.shippingMethod.trackingCode && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <span className="text-muted-foreground">روش و کد رهگیری پستی: </span>
                  <span className="font-bold text-foreground">
                    {order.shippingMethod.carrierName || order.shippingMethod.title}
                  </span>
                  <span className="font-mono font-bold text-primary mr-2" dir="ltr">
                    ({order.shippingMethod.trackingCode})
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyTracking}
                className="inline-flex items-center gap-1 font-bold text-xs bg-background text-primary px-3 py-1.5 rounded-lg border border-border-subtle hover:bg-surface-subtle transition-colors cursor-pointer shadow-2xs"
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

          {/* Products List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-foreground">کالاهای سفارش شده ({order.items.length})</h4>
            <div className="bg-background border border-border-subtle rounded-xl p-3 divide-y divide-border-subtle">
              {order.items.map((item) => (
                <OrderItemRow key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              <span>آدرس تحویل سفارش</span>
            </h4>
            <div className="bg-surface-subtle/50 border border-border-subtle rounded-xl p-3.5 text-xs text-foreground/90 space-y-1">
              <div className="flex justify-between font-bold text-foreground">
                <span>{order.shippingAddress.recipientName}</span>
                <span dir="ltr">{order.shippingAddress.phone}</span>
              </div>
              <p className="text-muted-foreground">
                {order.shippingAddress.province}، {order.shippingAddress.city}، {order.shippingAddress.address}
              </p>
              <p className="text-muted-foreground text-[11px]" dir="ltr">
                کد پستی: {order.shippingAddress.postalCode}
              </p>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-foreground">مبلغ سفارش</h4>
            <div className="bg-surface-subtle/50 border border-border-subtle rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>مجموع کالاها</span>
                <div className="flex items-center gap-1 font-medium text-foreground">
                  <span>{formatPrice(order.itemsSubtotal)}</span>
                  <TomanIcon className="w-3 h-3 text-muted-foreground" />
                </div>
              </div>

              <div className="flex items-center justify-between text-muted-foreground">
                <span>هزینه ارسال</span>
                <div className="flex items-center gap-1 font-medium text-foreground">
                  {order.shippingCost === 0 ? (
                    <span className="text-emerald-600 font-bold">رایگان</span>
                  ) : (
                    <>
                      <span>{formatPrice(order.shippingCost)}</span>
                      <TomanIcon className="w-3 h-3 text-muted-foreground" />
                    </>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-border-subtle flex items-center justify-between font-bold text-sm text-foreground">
                <span>مبلغ قابل پرداخت</span>
                <div className="flex items-center gap-1 text-primary">
                  <span>{formatPrice(order.payableTotal)}</span>
                  <TomanIcon className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Contextual Support CTA */}
          {onOpenSupport && (
            <div className="p-3.5 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-foreground block">مشکلی برای این سفارش دارید؟</span>
                <span className="text-muted-foreground text-[11px]">همکاران پشتیبانی آماده پاسخگویی به شما هستند.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSupport(order);
                }}
                className="inline-flex items-center gap-1 bg-primary text-primary-foreground font-bold px-3 py-1.5 rounded-lg hover:bg-primary-hover transition-colors shrink-0 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>ارتباط با پشتیبانی</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-border-subtle bg-surface-subtle/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-surface-muted text-foreground font-bold text-xs hover:bg-surface-subtle transition-colors cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}
