"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CheckoutHeader() {
  return (
    <header className="w-full border-b border-border-subtle bg-background py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          href="/"
          className="text-base sm:text-lg font-extrabold tracking-tight text-foreground hover:opacity-80 transition-opacity"
        >
          فروشگاه آنلاین
        </Link>

        {/* Page Title */}
        <h1 className="text-sm sm:text-base font-bold text-foreground">
          تکمیل خرید
        </h1>

        {/* Back to Cart Link */}
        <Link
          href="/cart"
          className="flex items-center gap-1 text-xs font-medium text-muted hover:text-foreground transition-colors"
        >
          <span>بازگشت به سبد خرید</span>
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </Link>
      </div>
    </header>
  );
}
