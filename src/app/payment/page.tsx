"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart/cart.store";
import { useAuth } from "@/store/auth/auth.store";
import { useToast } from "@/components/ui/Toast";
import { accountService } from "@/lib/account/accountService";
import { decrementStockForOrderItems } from "@/lib/inventory/inventoryService";
import { CheckoutPayload } from "@/types/checkout";
import { formatPrice } from "@/lib/formatting/currency";
import { TomanIcon } from "@/components/icons";
import { CheckoutHeader } from "@/components/checkout/CheckoutHeader";
import { ShieldCheck, CreditCard, Lock, AlertCircle, UserCheck } from "lucide-react";

export default function PaymentPage() {
  const router = useRouter();
  const { clearCart } = useCart();
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const { showToast } = useToast();

  const [payload] = useState<CheckoutPayload | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = sessionStorage.getItem("pending_checkout_payload");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // Guard against unauthenticated users or missing payload accessing /payment
  useEffect(() => {
    if (isAuthLoading) return;

    if (!payload) {
      showToast("اطلاعات سفارش یافت نشد. لطفاً ابتدا وارد سبد خرید شوید.", "error");
      router.replace("/checkout");
    } else if (!isAuthenticated) {
      showToast("جهت ورود به درگاه پرداخت ابتدا باید شماره موبایل خود را تأیید کنید.", "warning");
      router.replace("/checkout");
    }
  }, [isAuthenticated, isAuthLoading, payload, router, showToast]);

  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleInitiatePayment = async () => {
    if (!payload || isProcessing) return;
    setIsProcessing(true);
    setPaymentError(null);

    // Production constraint: Fake payment success simulation and artificial delays are removed.
    // Real payment status must be validated via authoritative server backend API response.
    // Since payment gateway endpoints (e.g. /store/payment-collections, callback, webhook)
    // are missing from openAPI.yml, report the blocking gap explicitly.
    const gapErrorMessage = "ارسال درخواست پرداخت مسدود است: درگاه پرداخت واقعی و متدهای Callback/Webhook Verification در قرارداد OpenAPI (openAPI.yml) تعریف نشده‌اند.";
    setPaymentError(gapErrorMessage);
    showToast(gapErrorMessage, "error");
    setIsProcessing(false);
  };

  if (isAuthLoading || !payload || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-muted-foreground">در حال بررسی اطلاعات و اعتبارسنجی پرداخت...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <CheckoutHeader currentStep="payment" />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 flex flex-col gap-6">
        <div className="flex items-center justify-between pb-4   ">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-lg font-black text-foreground">تکمیل فرآیند پرداخت</h1>
              <p className="text-xs text-muted-foreground">صفحه اختصاصی جهت اتصال به درگاه‌های بانکی عضو شتاب</p>
            </div>
          </div>
          {user && (
            <div className="hidden sm:flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-lg">
              <UserCheck className="w-4 h-4" />
              <span>کاربر: {user.firstName} {user.lastName} ({user.phone})</span>
            </div>
          )}
        </div>

        {!payload ? (
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>اطلاعات سفارشی یافت نشد. لطفاً ابتدا از طریق سبد خرید وارد مرحله پرداخت شوید.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Payment Details */}
            <div className="md:col-span-7 bg-background border border-border-subtle rounded-2xl p-5 flex flex-col gap-4 shadow-xs">
              <h2 className="text-xs font-bold text-foreground    pb-2">
                اطلاعات تحویل و سفارش
              </h2>
              <div className="space-y-2 text-xs text-foreground/80">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">تحویل‌گیرنده:</span>
                  <span className="font-bold">{payload.customer.firstName} {payload.customer.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">شماره تماس:</span>
                  <span className="font-bold">{payload.customer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">روش ارسال:</span>
                  <span className="font-bold">{payload.shipping.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">تعداد کالاها:</span>
                  <span className="font-bold">{payload.items.length} آیتم</span>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="md:col-span-5 bg-background border border-border-subtle rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
              <div className="flex items-center justify-between pb-2   ">
                <span className="text-xs font-bold text-muted-foreground">مبلغ کل قابل پرداخت</span>
                <div className="flex items-center gap-1 text-lg font-black text-primary">
                  <span>{formatPrice(payload.pricing.payableTotal)}</span>
                  <TomanIcon size={16} className="text-primary/70 shrink-0" />
                </div>
              </div>

              {paymentError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-red-900">مانع درگاه پرداخت (Backend Gap):</p>
                    <p className="text-red-700 leading-relaxed">{paymentError}</p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleInitiatePayment}
                disabled={isProcessing}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-all shadow-md cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isProcessing ? "در حال بررسی ارتباط با درگاه..." : "انتقال به درگاه پرداخت شتاب"}</span>
              </button>

              <button
                type="button"
                onClick={() => router.push("/checkout")}
                className="text-center text-xs text-muted-foreground hover:text-foreground transition-colors pt-1 cursor-pointer"
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
