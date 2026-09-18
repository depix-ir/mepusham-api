"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useAuth } from "@/store/auth/auth.store";
import { accountService } from "@/lib/account/accountService";
import { returnService } from "@/lib/returns/returnService";
import { checkOrderEligibility } from "@/lib/returns/eligibility";
import { Order, orderStatusLabels, canCustomerCancelOrder } from "@/types/account";
import { useToast } from "@/components/ui/Toast";
import { AccountPageHeader } from "@/components/account/AccountPageHeader";
import { OrderTimeline } from "@/components/account/orders/OrderTimeline";
import { OrderItemRow } from "@/components/account/orders/OrderItemRow";
import { OrderReviewSection } from "@/components/account/orders/OrderReviewSection";
import { Container } from "@/components/ui/Container";
import { formatPrice } from "@/lib/formatting/currency";
import { TomanIcon } from "@/components/icons";
import { routes } from "@/lib/routes";
import {
  ArrowRight,
  Truck,
  MapPin,
  Copy,
  Check,
  PackageCheck,
  PackageX,
  ChevronLeft,
  RotateCcw,
  ChevronRight,
  AlertTriangle,
  XCircle,
  User,
  Phone,
  Receipt,
  MessageSquare,
} from "lucide-react";

export default function AccountOrderDetailPage({
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
            href={routes.account.root}
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
            href={routes.account.orders.list}
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

  return (
    <div className="py-6 sm:py-10 bg-background min-h-screen pb-24 md:pb-12 max-w-[800px] mx-auto">
      <Container className="max-w-full space-y-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href={routes.home} className="hover:text-foreground transition-colors">
            خانه
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
          <Link href={routes.account.root} className="hover:text-foreground transition-colors">
            حساب کاربری
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
          <Link href={routes.account.orders.list} className="hover:text-foreground transition-colors">
            سفارش‌های من
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
          <span className="text-foreground font-bold" dir="ltr">#{order.orderNumber}</span>
        </nav>

        {/* Page Header Component */}
        <AccountPageHeader
          title={`جزئیات سفارش #${order.orderNumber}`}
          description={`ثبت شده در ${order.createdAt}`}
          icon={PackageCheck}
          backUrl={routes.account.orders.list}
          backLabel="بازگشت به سفارش‌ها"
          badgeText={orderStatusLabels[order.status]}
        />

        {/* Single Column Vertically Stacked Layout */}
        <div className="space-y-5">
          {/* Order Review Section (Highest UX position for Delivered orders) */}
          <OrderReviewSection order={order} />

          {/* Order Progress & Timeline Card */}
          <div className="bg-background border border-border rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
            <h2 className="text-xs sm:text-sm font-bold text-foreground flex items-center justify-between">
              <span>روند پردازش سفارش</span>
              <span className="text-[11px] font-mono text-muted-foreground" dir="ltr">
                #{order.orderNumber}
              </span>
            </h2>

            <OrderTimeline timeline={order.timeline} />

            {/* Shipping Tracking Sub-Bar */}
            {order.shippingMethod.trackingCode ? (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
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
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary bg-background px-3 py-1.5 rounded-lg border border-border-subtle hover:bg-surface-subtle transition-colors cursor-pointer shadow-2xs shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">کپی شد</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>کپی کد</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-surface-subtle/70 rounded-xl p-3 text-xs text-muted-foreground flex items-center gap-2">
                <Truck className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>روش ارسال: <strong className="text-foreground">{order.shippingMethod.title}</strong> (کد رهگیری پس از تحویل به پست صادر می‌شود)</span>
              </div>
            )}

            {/* Customer Cancellation Alert Banner */}
            {canCustomerCancelOrder(order.status) && (
              <div className="bg-rose-50 border border-rose-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-rose-800">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>امکان لغو سفارش</span>
                  </div>
                  <p className="text-rose-700 text-[11px]">
                    این سفارش هنوز ارسال نشده و می‌توانید آن را بدون کسر کارمزد لغو کنید.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0 shadow-2xs"
                >
                  لغو سفارش
                </button>
              </div>
            )}
          </div>

          {/* Purchased Items List Card */}
          <div className="bg-background border border-border rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
            <h2 className="text-xs sm:text-sm font-bold text-foreground">
              کالاهای سفارش ({order.items.length})
            </h2>
            <div className="divide-y divide-border-subtle">
              {order.items.map((item) => (
                <OrderItemRow key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* Financial Payment Summary Card */}
          <div className="bg-background border border-border rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
            <h2 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2 pb-2 border-b border-border-subtle">
              <Receipt className="w-4 h-4 text-primary" />
              <span>خلاصه پرداخت</span>
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>مجموع قیمت کالاها</span>
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

              <div className="pt-2.5 border-t border-border-subtle flex justify-between font-bold text-xs sm:text-sm text-foreground">
                <span>مبلغ کل پرداخت شده</span>
                <div className="flex items-center gap-1 text-primary">
                  <span>{formatPrice(order.payableTotal)}</span>
                  <TomanIcon className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address Details Card */}
          <div className="bg-background border border-border rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
            <h2 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2 pb-2 border-b border-border-subtle">
              <MapPin className="w-4 h-4 text-primary" />
              <span>آدرس و تحویل گیرنده</span>
            </h2>

            <div className="space-y-2 text-xs text-foreground">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="font-bold">{order.shippingAddress.recipientName}</span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span dir="ltr" className="font-mono text-xs">{order.shippingAddress.phone}</span>
              </div>

              <div className="pt-1.5 text-muted-foreground leading-relaxed border-t border-border-subtle/60 space-y-1">
                <p>
                  {order.shippingAddress.province}، {order.shippingAddress.city}، {order.shippingAddress.address}
                </p>
                <p className="text-[11px]" dir="ltr">
                  کد پستی: <span className="font-mono">{order.shippingAddress.postalCode}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Return / Exchange CTA Card */}
          {(() => {
            const existingRequests = returnService.getReturnRequests().items;
            const eligibility = checkOrderEligibility(order, existingRequests);

            if (eligibility.isEligible) {
              return (
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-primary" />
                      <h3 className="text-xs sm:text-sm font-bold text-foreground">
                        درخواست مرجوعی یا تعویض کالا
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      این سفارش واجد شرایط مرجوعی یا تعویض است (مهلت مرجوعی ۲ روز کاری).
                    </p>
                  </div>
                  <Link
                    href={routes.account.orders.return(order.id)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary-hover transition-colors shadow-xs shrink-0"
                  >
                    <span>ثبت درخواست</span>
                    <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                  </Link>
                </div>
              );
            }

            return (
              <div className="bg-surface-subtle/60 border border-border-subtle/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                  <span>
                    <strong>وضعیت مرجوعی:</strong> {eligibility.reason || "این سفارش امکان مرجوعی یا تعویض ندارد."}
                  </span>
                </div>
                <Link
                  href={routes.public.returnsPolicy}
                  className="text-xs font-bold text-primary hover:underline shrink-0"
                >
                  قوانین مرجوعی
                </Link>
              </div>
            );
          })()}

          {/* Quick Support & Help Card */}
          <div className="bg-surface-subtle/60 border border-border-subtle rounded-2xl p-4 space-y-3 text-xs">
            <span className="font-bold text-foreground block">پشتیبانی و پیگیری</span>

            <div className="space-y-2">
              <Link
                href={routes.account.support.new({ orderId: order.id })}
                className="p-2.5 bg-background border border-border-subtle rounded-xl flex items-center justify-between hover:border-primary transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                    مشکل در این سفارش دارید؟ تماس با پشتیبانی
                  </span>
                </div>
                <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors rtl:rotate-0" />
              </Link>

              <Link
                href={routes.account.returns.list}
                className="p-2.5 bg-background border border-border-subtle rounded-xl flex items-center justify-between hover:border-primary transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                  <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                    پیگیری درخواست‌های مرجوعی
                  </span>
                </div>
                <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors rtl:rotate-0" />
              </Link>
            </div>
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
                <AlertTriangle className="" />
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
