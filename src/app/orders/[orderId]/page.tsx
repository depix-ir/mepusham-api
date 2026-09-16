"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useAuth } from "@/store/auth/auth.store";
import { accountService } from "@/lib/account/accountService";
import { returnService } from "@/lib/returns/returnService";
import { checkOrderEligibility } from "@/lib/returns/eligibility";
import { Order, orderStatusLabels, canCustomerCancelOrder } from "@/types/account";
import { useToast } from "@/components/ui/Toast";
import { AlertTriangle, XCircle } from "lucide-react";
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
  ChevronLeft,
  RotateCcw,
  ChevronRight,
} from "lucide-react";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const resolvedParams = use(params);
  const { isAuthLoading, isAuthenticated } = useAuth();

  const { showToast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (resolvedParams.orderId) {
      const found = accountService.getOrderById(resolvedParams.orderId);
      if (found) setOrder(found);
    }
  }, [resolvedParams.orderId]);

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
          <p className="text-sm font-bold text-foreground">
            برای مشاهده جزئیات سفارش باید وارد حساب کاربری شوید.
          </p>
          <Link
            href="/account"
            className="inline-block px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary-hover transition-colors shadow-xs"
          >
            ورود به حساب کاربری
          </Link>
        </Container>
      </div>
    );
  }

  /* Error / Invalid Order State */
  if (!order) {
    return (
      <div className="py-20 text-center min-h-[60vh] flex items-center justify-center">
        <Container className="max-w-md space-y-4">
          <div className="w-14 h-14 rounded-full bg-surface-muted text-muted-foreground mx-auto flex items-center justify-center">
            <PackageX className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-base font-bold text-foreground">سفارش موردنظر پیدا نشد.</h1>
            <p className="text-xs text-muted-foreground">
              کد سفارش وارد شده نادرست است یا سفارشی با این شناسه وجود ندارد.
            </p>
          </div>
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline bg-primary/10 px-4 py-2 rounded-xl transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به سفارش‌ها</span>
          </Link>
        </Container>
      </div>
    );
  }

  const handleConfirmCancel = () => {
    if (!order) return;
    setIsCancelling(true);
    try {
      const updated = accountService.cancelOrderByCustomer(order.id);
      setOrder(updated);
      showToast("سفارش شما با موفقیت لغو شد.", "success");
      setIsCancelModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "خطا در لغو سفارش.";
      showToast(msg, "error");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCopyTracking = () => {
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
      default:
        return "bg-surface-subtle text-foreground border-border-subtle";
    }
  };

  return (
    <div className="py-6 sm:py-10 max-w-[800px] m-auto bg-background min-h-screen pb-24 md:pb-12">
      <Container className="max-w-3xl space-y-6">
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
          <Link href="/orders" className="hover:text-foreground transition-colors">
            سفارش‌های من
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
          <span className="text-foreground font-bold" dir="ltr">#{order.orderNumber}</span>
        </nav>

        {/* Top Back Navigation Bar */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به سفارش‌ها</span>
          </Link>

          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusBadgeClass()}`}>
            {orderStatusLabels[order.status]}
          </span>
        </div>

        {/* Main Content Wrapper */}
        <div className="bg-background   rounded-2xl   shadow-2xs space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3  pb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <PackageCheck className="w-4 h-4" />
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
          <div className="">
            <OrderTimeline timeline={order.timeline} />
          </div>

          {/* Customer Order Cancellation CTA */}
          {canCustomerCancelOrder(order.status) && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-rose-800">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>امکان لغو سفارش</span>
                </div>
                <p className="text-rose-700 text-[11px]">
                  سفارش شما در مرحله آماده‌سازی قرار دارد و در صورت تمایل می‌توانید آن را لغو کنید.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCancelModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
              >
                لغو این سفارش
              </button>
            </div>
          )}

          {/* Shipping Tracking Bar */}
          {order.shippingMethod.trackingCode ? (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-4.5 h-4.5 text-primary shrink-0" />
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
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-background px-3 py-1.5 rounded-lg border border-border-subtle hover:bg-surface-subtle transition-colors cursor-pointer shadow-2xs"
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
          ) : (
            <div className="bg-surface-subtle/60  rounded-xl p-3.5 text-xs text-muted-foreground flex items-center gap-2">
              <Truck className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>روش ارسال: <strong>{order.shippingMethod.title}</strong> (کد رهگیری پس از تحویل به پست ثبت می‌شود)</span>
            </div>
          )}

          {/* Purchased Items List */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-foreground">کالاهای سفارش ({order.items.length})</h2>
            <div className="bg-surface-subtle/60  rounded-xl p-3 divide-y divide-border-subtle">
              {order.items.map((item) => (
                <OrderItemRow key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              <span>آدرس تحویل سفارش</span>
            </h2>
            <div className="bg-surface-subtle/50  rounded-xl p-4 text-xs text-foreground space-y-1">
              <p className="font-bold">{order.shippingAddress.recipientName} ({order.shippingAddress.phone})</p>
              <p className="text-muted-foreground">
                {order.shippingAddress.province}، {order.shippingAddress.city}، {order.shippingAddress.address}
              </p>
              <p className="text-muted-foreground text-[11px]" dir="ltr">
                کد پستی: {order.shippingAddress.postalCode}
              </p>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-surface-subtle/50  rounded-xl p-4 space-y-2.5 text-xs">
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

            <div className="pt-2.5  flex justify-between font-bold text-sm text-foreground">
              <span>مبلغ قابل پرداخت</span>
              <div className="flex items-center gap-1 text-primary text-base">
                <span>{formatPrice(order.payableTotal)}</span>
                <TomanIcon className="w-4 h-4 text-primary" />
              </div>
            </div>
          </div>

          {/* Return / Exchange CTA Section */}
          {(() => {
            const existingRequests = returnService.getReturnRequests().items;
            const eligibility = checkOrderEligibility(order, existingRequests);

            if (eligibility.isEligible) {
              return (
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-primary" />
                      <h3 className="text-xs sm:text-sm font-bold text-foreground">
                        درخواست مرجوعی یا تعویض کالا
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      این سفارش واجد شرایط مرجوعی یا تعویض است (مهلت مرجوعی ۲ روز از تحویل).
                    </p>
                  </div>
                  <Link
                    href={`/orders/${order.id}/return`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary-hover transition-colors shadow-xs shrink-0"
                  >
                    <span>ثبت درخواست مرجوعی / تعویض</span>
                    <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                  </Link>
                </div>
              );
            }

            return (
              <div className="bg-surface-subtle/70 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                  <span>
                    <strong>مرجوعی / تعویض:</strong> {eligibility.reason || "این سفارش در حال حاضر امکان مرجوعی یا تعویض ندارد."}
                  </span>
                </div>
                <Link
                  href="/returns"
                  className="text-xs font-bold text-primary hover:underline shrink-0"
                >
                  مطالعه قوانین مرجوعی
                </Link>
              </div>
            );
          })()}

          {/* Support Action Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Link
              href="/support"
              className="p-3.5 bg-surface-subtle/60 rounded-xl flex items-center gap-3 hover:border-border transition-colors group"
            >
              <HelpCircle className="w-4 h-4 text-primary shrink-0" />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground block group-hover:text-primary transition-colors">
                  ارتباط با پشتیبانی
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  ثبت تیکت یا پیگیری سفارش
                </span>
              </div>
            </Link>

            <Link
              href="/account/returns"
              className="p-3.5 bg-surface-subtle/60 rounded-xl flex items-center gap-3 hover:border-border transition-colors group"
            >
              <RotateCcw className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-foreground block group-hover:text-primary transition-colors">
                  درخواست‌های مرجوعی من
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  پیگیری وضعیت مرجوعی و تعویض
                </span>
              </div>
            </Link>
          </div>
        </div>
      </Container>

      {/* Cancel Order Confirmation Modal */}
      {isCancelModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={() => setIsCancelModalOpen(false)}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="relative w-full max-w-md bg-background border border-border rounded-2xl shadow-xl p-5 space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                تأیید لغو سفارش
              </h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              آیا از لغو سفارش شماره <strong className="text-foreground" dir="ltr">#{order.orderNumber}</strong> اطمینان دارید؟ این عملیات قابل بازگشت نیست.
            </p>

            <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                disabled={isCancelling}
                className="px-4 py-2.5 rounded-xl bg-surface-subtle text-foreground text-xs font-bold hover:bg-surface-muted transition-colors cursor-pointer"
              >
                انصراف
              </button>

              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isCancelling ? "در حال لغو..." : "بله، سفارش لغو شود"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
