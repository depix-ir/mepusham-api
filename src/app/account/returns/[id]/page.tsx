"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/store/auth/auth.store";
import { returnService } from "@/lib/returns/returnService";
import {
  ReturnRequest,
  RETURN_STATUS_LABELS,
  RETURN_REASON_LABELS,
  INSPECTION_RESULT_LABELS,
} from "@/types/return";
import { Container } from "@/components/ui/Container";
import { formatPrice } from "@/lib/formatting/currency";
import { TomanIcon } from "@/components/icons";
import { useToast } from "@/components/ui/Toast";
import {
  RotateCcw,
  RefreshCw,
  ChevronLeft,
  ArrowRight,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Send,
  ShieldCheck,
  CreditCard,
} from "lucide-react";

export default function ReturnDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { isAuthLoading, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [request, setRequest] = useState<ReturnRequest | null>(null);
  const [trackingCodeInput, setTrackingCodeInput] = useState<string>("");
  const [isRegisteringTracking, setIsRegisteringTracking] = useState<boolean>(false);

  useEffect(() => {
    if (resolvedParams.id) {
      const found = returnService.getReturnRequestById(resolvedParams.id);
      if (found) setRequest(found);
    }
  }, [resolvedParams.id]);

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
            برای مشاهده جزئیات درخواست باید وارد حساب کاربری شوید.
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

  if (!request) {
    return (
      <div className="py-20 text-center min-h-[60vh] flex items-center justify-center">
        <Container className="max-w-md space-y-4">
          <h1 className="text-base font-bold text-foreground">درخواست موردنظر یافت نشد.</h1>
          <Link
            href="/account/returns"
            className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به لیست مرجوعی‌ها</span>
          </Link>
        </Container>
      </div>
    );
  }

  const handleRegisterTracking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCodeInput.trim()) {
      showToast("لطفاً کد رهگیری پستی را وارد کنید.", "error");
      return;
    }

    setIsRegisteringTracking(true);
    try {
      const updated = returnService.registerShipment(
        request.id,
        { trackingCode: trackingCodeInput.trim() },
        "مشتری"
      );
      setRequest(updated);
      showToast("کد رهگیری پستی مرسوله با موفقیت ثبت شد.", "success");
      setTrackingCodeInput("");
    } catch (err: any) {
      showToast(err.message || "خطا در ثبت کد رهگیری.", "error");
    } finally {
      setIsRegisteringTracking(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "requested":
      case "under_review":
        return "bg-amber-500/10 text-amber-700 border-amber-500/20";
      case "approved":
      case "awaiting_customer_shipment":
      case "in_transit":
      case "received":
      case "inspection":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20";
      case "inspection_approved":
      case "refunded":
      case "replacement_shipped":
      case "completed":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
      case "rejected":
      case "inspection_rejected":
        return "bg-rose-500/10 text-rose-700 border-rose-500/20";
      default:
        return "bg-surface-subtle text-foreground border-border-subtle";
    }
  };

  return (
    <div className="py-6 sm:py-10 max-w-[800px] m-auto bg-background min-h-screen pb-24 md:pb-12">
      <Container className="max-w-3xl space-y-6">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            خانه
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
          <Link href="/account" className="hover:text-foreground transition-colors">
            حساب کاربری
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
          <Link href="/account/returns" className="hover:text-foreground transition-colors">
            درخواست‌های مرجوعی
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
          <span className="text-foreground font-bold" dir="ltr">#{request.requestNumber}</span>
        </nav>

          {/* Back Link, Support & Badge Header */}
        <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                href="/account/returns"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                <span>بازگشت به درخواست‌ها</span>
              </Link>
              <span className="text-muted-foreground text-xs">•</span>
              <Link
                href="/support"
                className="text-xs font-medium text-primary hover:underline transition-colors"
              >
                پشتیبانی مرجوعی
              </Link>
            </div>

          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusBadgeClass(request.status)}`}>
            {RETURN_STATUS_LABELS[request.status] || request.status}
          </span>
        </div>

        {/* Main Content Box */}
        <div className="bg-background rounded-2xl space-y-6">
          {/* Header Title */}
          <div className="flex items-center gap-3 pb-4 border-b border-border-subtle">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              {request.type === "return" ? <RotateCcw className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-foreground">
                درخواست {request.type === "return" ? "مرجوعی" : "تعویض"} <span dir="ltr">#{request.requestNumber}</span>
              </h1>
              <p className="text-xs text-muted-foreground">
                ثبت شده برای سفارش <Link href={`/orders/${request.orderId}`} className="font-mono text-primary hover:underline" dir="ltr">#{request.orderNumber}</Link> در {new Date(request.createdAt).toLocaleDateString("fa-IR")}
              </p>
            </div>
          </div>

          {/* Customer Shipping Input Prompt (When Approved & Awaiting Customer Shipment) */}
          {(request.status === "approved" || request.status === "awaiting_customer_shipment") && (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary shrink-0" />
                <h3 className="text-xs sm:text-sm font-bold text-foreground">
                  درخواست شما تأیید شد - لطفاً کالا را ارسال کنید
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                لطفاً کالا را به همراه فاکتور به آدرس انبار ارسال کرده و کد رهگیری پستی مرسوله را در کادر زیر ثبت کنید.
              </p>

              <form onSubmit={handleRegisterTracking} className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <input
                  type="text"
                  value={trackingCodeInput}
                  onChange={(e) => setTrackingCodeInput(e.target.value)}
                  placeholder="کد ۲۴ رقمی رهگیری پست..."
                  className="flex-1 px-3.5 py-2.5 bg-background border border-border-subtle rounded-xl text-xs font-mono focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={isRegisteringTracking}
                  className="px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary-hover transition-colors shadow-xs shrink-0 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ثبت کد رهگیری</span>
                </button>
              </form>
            </div>
          )}

          {/* Items Section */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-foreground">کالاهای مرجوعی / تعویضی</h2>
            <div className="bg-surface-subtle/60 rounded-xl p-3 divide-y divide-border-subtle">
              {request.items.map((item) => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-lg bg-surface-muted overflow-hidden shrink-0">
                    <Image src={item.productImage} alt={item.productTitle} fill className="object-cover" />
                  </div>
                  <div className="flex-1 space-y-1 text-xs">
                    <h3 className="font-bold text-foreground">{item.productTitle}</h3>
                    {item.variantDisplay && (
                      <p className="text-muted-foreground text-[11px]">تنوع: {item.variantDisplay}</p>
                    )}
                    <p className="text-muted-foreground">
                      تعداد: <strong>{item.quantity} عدد</strong> • علت: <strong>{RETURN_REASON_LABELS[item.reason]}</strong>
                    </p>
                    {item.inspection && (
                      <p className="text-[11px] text-emerald-700 font-bold">
                        کارشناسی: {INSPECTION_RESULT_LABELS[item.inspection.result]}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial or Replacement Details */}
          {request.type === "return" ? (
            <div className="bg-surface-subtle/50 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>مبلغ استرداد کالا</span>
                <div className="flex items-center gap-1 font-bold text-foreground">
                  <span>{formatPrice(request.refund?.amount || 0)}</span>
                  <TomanIcon className="w-3 h-3 text-muted-foreground" />
                </div>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>وضعیت بازپرداخت</span>
                <span className="font-bold text-foreground">
                  {request.refund?.status === "completed" ? "واریز شده به حساب" : "در حال پردازش مالی"}
                </span>
              </div>
              {request.refund?.referenceId && (
                <div className="flex justify-between text-muted-foreground text-[11px]">
                  <span>شماره پیگیری واریز:</span>
                  <span className="font-mono font-bold text-foreground" dir="ltr">{request.refund.referenceId}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>تنوع جایگزین درخواستی:</span>
                <span className="font-bold text-purple-700">{request.exchange?.replacementVariantDisplay || "تنوع جدید"}</span>
              </div>
              {request.exchange?.replacementShipment?.trackingCode && (
                <div className="flex justify-between text-muted-foreground pt-1 border-t border-purple-200">
                  <span>کد رهگیری ارسال کالای جایگزین:</span>
                  <span className="font-mono font-bold text-purple-700" dir="ltr">
                    {request.exchange.replacementShipment.trackingCode}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Request Timeline */}
          <div className="space-y-3 pt-2">
            <h2 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" />
              <span>تاریخچه و روند بررسی درخواست</span>
            </h2>

            <div className="bg-surface-subtle/40 rounded-xl p-4 space-y-4 text-xs">
              {request.timeline.map((tl, idx) => (
                <div key={tl.id} className="relative flex gap-3">
                  {/* Timeline Line */}
                  {idx < request.timeline.length - 1 && (
                    <div className="absolute top-5 right-2 w-0.5 h-full bg-border-subtle" />
                  )}

                  <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5 z-10">
                    <CheckCircle2 className="w-3 h-3 text-primary" />
                  </div>

                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-foreground">{tl.title}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(tl.createdAt).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    {tl.description && (
                      <p className="text-muted-foreground text-[11px] leading-relaxed">{tl.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
