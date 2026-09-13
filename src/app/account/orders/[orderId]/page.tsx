"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useAuth } from "@/store/auth/auth.store";
import { accountService } from "@/lib/account/accountService";
import { Order, orderStatusLabels } from "@/types/account";
import { OrderTimeline } from "@/components/account/orders/OrderTimeline";
import { OrderItemRow } from "@/components/account/orders/OrderItemRow";
import { Container } from "@/components/ui/Container";
import { formatPrice } from "@/lib/formatting/currency";
import { TomanIcon } from "@/components/icons";
import {
  ArrowRight,
  Truck,
  MapPin,
  HelpCircle,
  Copy,
  Check,
  PackageCheck,
  PackageX,
} from "lucide-react";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const resolvedParams = use(params);
  const { isAuthLoading, isAuthenticated } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (resolvedParams.orderId) {
      const found = accountService.getOrderById(resolvedParams.orderId);
      if (found) setOrder(found);
    }
  }, [resolvedParams.orderId]);

  if (isAuthLoading) {
    return (
      <div className="py-20 text-center">
        <Container>
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
        </Container>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center space-y-4">
        <Container>
          <p className="text-sm font-bold text-foreground">
            برای مشاهده سفارش باید وارد حساب کاربری شوید.
          </p>
          <Link
            href="/account"
            className="inline-block px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl"
          >
            ورود به حساب
          </Link>
        </Container>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center space-y-4">
        <Container>
          <PackageX className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="text-base font-bold text-foreground">سفارش یافت نشد</h2>
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به حساب کاربری</span>
          </Link>
        </Container>
      </div>
    );
  }

  const handleCopyTracking = () => {
    if (order.shippingMethod.trackingCode) {
      navigator.clipboard.writeText(order.shippingMethod.trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-background min-h-[80vh]">
      <Container className="max-w-3xl space-y-6">
        {/* Top Back Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به سفارش‌ها</span>
          </Link>

          <span className="text-xs font-bold text-primary px-3 py-1 bg-primary/10 rounded-full">
            {orderStatusLabels[order.status]}
          </span>
        </div>

        {/* Card Wrapper */}
        <div className="bg-background border border-border/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
          {/* Title */}
          <div className="flex items-center gap-3 border-b border-border-subtle pb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-foreground">
                جزئیات سفارش <span dir="ltr">#{order.orderNumber}</span>
              </h1>
              <p className="text-xs text-muted-foreground">
                ثبت شده در {order.createdAt}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-surface-subtle/50 border border-border-subtle rounded-xl p-4">
            <OrderTimeline timeline={order.timeline} />
          </div>

          {/* Tracking info */}
          {order.shippingMethod.trackingCode && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary shrink-0" />
                <span>
                  کد رهگیری {order.shippingMethod.carrierName || order.shippingMethod.title}:{" "}
                  <strong className="font-mono text-primary mr-1" dir="ltr">
                    {order.shippingMethod.trackingCode}
                  </strong>
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyTracking}
                className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-background px-3 py-1.5 rounded-lg border border-border-subtle hover:bg-surface-subtle transition-colors cursor-pointer"
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

          {/* Items */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-foreground">کالاهای سفارش ({order.items.length})</h3>
            <div className="bg-background border border-border-subtle rounded-xl p-3 divide-y divide-border-subtle">
              {order.items.map((item) => (
                <OrderItemRow key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* Shipping address */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              <span>آدرس تحویل</span>
            </h3>
            <div className="bg-surface-subtle/50 border border-border-subtle rounded-xl p-4 text-xs text-foreground space-y-1">
              <p className="font-bold">{order.shippingAddress.recipientName} ({order.shippingAddress.phone})</p>
              <p className="text-muted-foreground">
                {order.shippingAddress.province}، {order.shippingAddress.city}، {order.shippingAddress.address}
              </p>
              <p className="text-muted-foreground text-[11px]" dir="ltr">
                کد پستی: {order.shippingAddress.postalCode}
              </p>
            </div>
          </div>

          {/* Financial summary */}
          <div className="bg-surface-subtle/50 border border-border-subtle rounded-xl p-4 space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>مجموع کالاها</span>
              <div className="flex items-center gap-1 font-bold text-foreground">
                <span>{formatPrice(order.itemsSubtotal)}</span>
                <TomanIcon className="w-3 h-3 text-muted-foreground" />
              </div>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>هزینه ارسال</span>
              <div className="flex items-center gap-1 font-bold text-foreground">
                {order.shippingCost === 0 ? (
                  <span className="text-emerald-600">رایگان</span>
                ) : (
                  <>
                    <span>{formatPrice(order.shippingCost)}</span>
                    <TomanIcon className="w-3 h-3 text-muted-foreground" />
                  </>
                )}
              </div>
            </div>
            <div className="pt-2 border-t border-border-subtle flex justify-between font-bold text-sm text-foreground">
              <span>مبلغ قابل پرداخت</span>
              <div className="flex items-center gap-1 text-primary">
                <span>{formatPrice(order.payableTotal)}</span>
                <TomanIcon className="w-3.5 h-3.5 text-primary" />
              </div>
            </div>
          </div>

          {/* Contextual Support */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-foreground block">سؤالی در مورد این سفارش دارید؟</span>
              <span className="text-muted-foreground text-[11px]">با پشتیبانی ما تماس بگیرید یا تیکت ثبت کنید.</span>
            </div>
            <Link
              href="/account"
              className="inline-flex items-center gap-1 bg-primary text-primary-foreground font-bold px-3.5 py-2 rounded-xl hover:bg-primary-hover transition-colors shrink-0"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>پشتیبانی سفارش</span>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
