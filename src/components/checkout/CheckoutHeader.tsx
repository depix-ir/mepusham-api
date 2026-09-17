"use client";

import React from "react";
import Link from "next/link";
import { routes } from "@/lib/routes";
import {
  ArrowRight,
  Headphones,
  ShieldCheck,
  ShoppingCart,
  Truck,
  CreditCard,
  Check,
} from "lucide-react";

export type CheckoutStep = "cart" | "shipping" | "payment";

interface CheckoutHeaderProps {
  currentStep?: CheckoutStep;
}

const steps = [
  { id: "cart", label: "سبد خرید", icon: ShoppingCart },
  { id: "shipping", label: "اطلاعات و ارسال", icon: Truck },
  { id: "payment", label: "پرداخت", icon: CreditCard },
] as const;

export function CheckoutHeader({ currentStep = "shipping" }: CheckoutHeaderProps) {
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur-md border-b border-border/80 shadow-2xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">

          {/* 1. Brand Logo & Name */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={routes.home}
              className="group flex items-center gap-2 text-xl sm:text-2xl font-black text-primary tracking-tight hover:opacity-90 transition-opacity"
              title="بازگشت به صفحه اصلی"
            >
              <span className="bg-primary/10 text-primary p-1.5 rounded-xl group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </span>
              <span>مپوشام</span>
            </Link>

            {/* SSL Trust Seal (Hidden on smallest screens) */}
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>پرداخت امن و تضمینی</span>
            </div>
          </div>

          {/* 2. Visual Checkout Stepper */}
          <div className="flex items-center justify-center">
            {/* Desktop Stepper */}
            <nav aria-label="مراحل خرید" className="hidden sm:flex items-center gap-2 sm:gap-3">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index < currentStepIndex;
                const isActive = index === currentStepIndex;

                return (
                  <React.Fragment key={step.id}>
                    {/* Connecting Line */}
                    {index > 0 && (
                      <div
                        className={`h-0.5 w-6 sm:w-10 rounded-full transition-colors duration-300 ${
                          index <= currentStepIndex ? "bg-primary" : "bg-border-subtle"
                        }`}
                      />
                    )}

                    {/* Step Item */}
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isCompleted
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : isActive
                            ? "bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-xs"
                            : "bg-surface-subtle text-muted-foreground border border-border-subtle"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>
                      <span
                        className={`text-xs sm:text-sm font-semibold transition-colors ${
                          isActive
                            ? "text-foreground font-bold"
                            : isCompleted
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  </React.Fragment>
                );
              })}
            </nav>

            {/* Mobile Stepper (Compact Pill Indicator) */}
            <div className="flex sm:hidden items-center gap-2 bg-surface-subtle border border-border-subtle px-3 py-1.5 rounded-full text-xs font-bold text-foreground">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>
                مرحله {currentStepIndex + 1} از {steps.length}: {steps[currentStepIndex]?.label}
              </span>
            </div>
          </div>

          {/* 3. Action Links: Support & Back to Cart */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Support Link */}
            <Link
              href={routes.account.support.list()}
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors py-1.5 px-2.5 rounded-lg hover:bg-surface-subtle"
              title="پشتیبانی سفارش"
            >
              <Headphones className="w-4 h-4 text-primary" />
              <span>پشتیبانی</span>
            </Link>

            {/* Back to Cart Button */}
            <Link
              href={routes.cart}
              className="flex items-center gap-1.5 text-xs font-bold text-foreground hover:text-primary bg-surface-subtle hover:bg-primary/10 border border-border-subtle px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              <ArrowRight className="w-4 h-4 text-primary shrink-0" />
              <span className="hidden xs:inline">بازگشت به سبد خرید</span>
              <span className="xs:hidden">سبد خرید</span>
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}
