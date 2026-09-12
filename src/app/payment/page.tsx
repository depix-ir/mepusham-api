"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart/cart.store";
import { CheckoutPayload } from "@/types/checkout";
import { formatPrice } from "@/lib/formatting/currency";
import { ShieldCheck, CheckCircle2, ArrowRight, CreditCard, Lock, AlertCircle } from "lucide-react";

export default function PaymentPage() {
  const router = useRouter();
  const { clearCart } = useCart();

  const [payload] = useState<CheckoutPayload | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = sessionStorage.getItem("pending_checkout_payload");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isPaid, setIsPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
      clearCart();
      try {
        sessionStorage.removeItem("pending_checkout_payload");
      } catch {
        // ignore
      }
    }, 1200);
  };

  if (isPaid) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-background border border-border-subtle rounded-2xl p-6 sm:p-8 text-center flex flex-col items-center gap-6 shadow-md">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-black text-foreground">
              پرداخت با موفقیت انجام شد!
            </h1>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              سفارش شما ثبت گردید و جهت پردازش به انبار ارسال شد.
            </p>
          </div>

          <Link
            href="/products"
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-primary-hover transition-all shadow-md"
          >
            <span>بازگشت به فروشگاه</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border-subtle bg-background py-4 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-base font-black text-foreground">
            درگاه پرداخت امن (شبیه‌ساز)
          </Link>
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            <Lock className="w-3.5 h-3.5" />
            <span>اتصال امن SSL</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 flex flex-col gap-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border-subtle">
          <CreditCard className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-lg font-black text-foreground">تکمیل فرآیند پرداخت</h1>
            <p className="text-xs text-muted">صفحه اختصاصی جهت اتصال به درگاه‌های بانکی عضو شتاب</p>
          </div>
        </div>

        {!payload ? (
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
            <span>اطلاعات سفارشی یافت نشد. لطفاً ابتدا از طریق سبد خرید وارد مرحله پرداخت شوید.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Payment Details */}
            <div className="md:col-span-7 bg-background border border-border-subtle rounded-2xl p-5 flex flex-col gap-4 shadow-xs">
              <h2 className="text-xs font-bold text-foreground border-b border-border-subtle pb-2">
                اطلاعات تحویل و سفارش
              </h2>
              <div className="space-y-2 text-xs text-foreground/80">
                <div className="flex justify-between">
                  <span className="text-muted">تحویل‌گیرنده:</span>
                  <span className="font-bold">{payload.customer.firstName} {payload.customer.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">شماره تماس:</span>
                  <span className="font-bold">{payload.customer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">روش ارسال:</span>
                  <span className="font-bold">{payload.shipping.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">تعداد کالاها:</span>
                  <span className="font-bold">{payload.items.length} آیتم</span>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="md:col-span-5 bg-background border border-border rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                <span className="text-xs font-bold text-muted">مبلغ کل قابل پرداخت</span>
                <span className="text-lg font-black text-primary">
                  {formatPrice(payload.pricing.payableTotal)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="w-full h-11 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isProcessing ? "در حال پردازش..." : "پرداخت آزمایشی موفق"}</span>
              </button>

              <button
                type="button"
                onClick={() => router.push("/checkout")}
                className="text-center text-xs text-muted hover:text-foreground transition-colors pt-1 cursor-pointer"
              >
                انصراف و ویرایش اطلاعات سفارش
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
