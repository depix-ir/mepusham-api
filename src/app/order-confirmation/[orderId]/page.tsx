"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { accountService } from "@/lib/account/accountService";
import { Order } from "@/types/account";
import { Container } from "@/components/ui/Container";
import { formatPrice } from "@/lib/formatting/currency";
import { TomanIcon } from "@/components/icons";
import { CheckCircle2, ArrowRight, PackageCheck, ShoppingBag, MapPin } from "lucide-react";

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const resolvedParams = use(params);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (resolvedParams.orderId) {
      const found = accountService.getOrderById(resolvedParams.orderId);
      if (found) setOrder(found);
    }
  }, [resolvedParams.orderId]);

  if (!order) {
    return (
      <div className="min-h-[80vh] bg-background flex items-center justify-center p-4">
        <Container className="max-w-md text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h1 className="text-lg font-bold text-foreground">ثبت سفارش با موفقیت انجام شد</h1>
          <p className="text-xs text-muted-foreground">
            اطلاعات سفارش در بخش سفارش‌های حساب کاربری شما ذخیره شد.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
            <Link
              href="/orders"
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary-hover transition-colors shadow-xs"
            >
              مشاهده سفارش‌ها
            </Link>
            <Link
              href="/products"
              className="px-5 py-2.5 rounded-xl bg-surface-subtle border border-border-subtle text-foreground font-bold text-xs hover:bg-surface-muted transition-colors"
            >
              ادامه خرید
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-background flex items-center justify-center py-10 px-4">
      <Container className="max-w-lg mx-auto">
        <div className="bg-background border border-border-subtle rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-xs">
          {/* Success Check Icon */}
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-lg sm:text-xl font-bold text-foreground">
              سفارش شما با موفقیت ثبت شد
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              پرداخت با موفقیت انجام گردید و سفارش شما جهت بسته‌بندی و ارسال آماده گردید.
            </p>
          </div>

          {/* Key Order Info Box */}
          <div className="bg-surface-subtle/60 border border-border-subtle rounded-xl p-4 text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <span className="text-muted-foreground">شماره سفارش:</span>
              <span className="font-bold text-foreground" dir="ltr">
                #{order.orderNumber}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <span className="text-muted-foreground">تعداد کالاها:</span>
              <span className="font-bold text-foreground">
                {order.items.length} آیتم
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <span className="text-muted-foreground">آدرس تحویل:</span>
              <span className="font-bold text-foreground truncate max-w-[200px]" title={order.shippingAddress.address}>
                {order.shippingAddress.city}، {order.shippingAddress.address}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="font-bold text-foreground">مبلغ قابل پرداخت:</span>
              <div className="flex items-center gap-1 font-bold text-sm text-primary">
                <span>{formatPrice(order.payableTotal)}</span>
                <TomanIcon className="w-3.5 h-3.5 text-primary" />
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href={`/orders/${order.id}`}
              className="flex-1 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors shadow-xs"
            >
              <PackageCheck className="w-4 h-4" />
              <span>مشاهده جزئیات سفارش</span>
            </Link>

            <Link
              href="/products"
              className="flex-1 py-3 px-4 rounded-xl bg-surface-subtle border border-border-subtle text-foreground font-bold text-xs flex items-center justify-center gap-2 hover:bg-surface-muted transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>ادامه خرید</span>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
