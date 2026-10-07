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
  const getPageTitle = () => {
    switch (currentStep) {
      case "cart":
        return "سبد خرید";
      case "shipping":
        return "تکمیل اطلاعات و ارسال سفارش";
      case "payment":
        return "پرداخت آنلاین سفارش";
      default:
        return "تکمیل خرید";
    }
  };

  return (
    <header className="w-full bg-background  py-4 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">

          {/* RIGHT SIDE (RTL): Page Title */}
          <div className="flex items-center gap-3 shrink-0">
            <h1 className="text-base sm:text-lg font-black text-foreground tracking-tight">
              {getPageTitle()}
            </h1>
          </div>

          {/* LEFT SIDE (RTL): Support Button & Brand Logo */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Support Button (Primary background with white text) */}
            <Link
              href={routes.account.support.list()}
              className="flex items-center gap-1.5 bg-primary text-white hover:bg-primary-hover text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl transition-colors shadow-xs cursor-pointer"
              title="پشتیبانی"
            >
              <Headphones className="w-4 h-4 shrink-0 text-white" />
              <span>پشتیبانی</span>
            </Link>

            {/* Brand Logo */}
            <Link
              href={routes.home}
              className="flex items-center gap-2 text-xl hidden sm:block  font-black text-primary tracking-tight hover:opacity-90 transition-opacity"
              title="صفحه اصلی مپوشــــم"
            >
              <span>مپوشــــم</span>
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}
