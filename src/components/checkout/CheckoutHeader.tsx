"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function CheckoutHeader() {
  return (
    <header className="w-full border-b border-border-subtle bg-background py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}




        {/* Support Link & Back to Cart Link */}
        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="flex items-center gap-1 text-xs font-medium text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            <span>بازگشت به سبد خرید</span>
          </Link>

          <Link
            href="/support"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline transition-colors"
          >
            <span>پشتیبانی آنلاین</span>
          </Link>
        </div>

        {/* Page Title */}
        <h1 className="text-sm sm:text-base font-bold text-foreground">
          تکمیل خرید
        </h1>
      </div>
    </header>
  );
}
