"use client";

import React from "react";
import Link from "next/link";
import { LockKeyhole, ArrowRight } from "lucide-react";

export function CheckoutHeader() {
  return (
    <header className="w-full border-b border-border-subtle bg-background py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand/Logo Link */}
        <Link href="/" className="text-lg font-black tracking-tight text-foreground">
          فروشگاه آنلاین
        </Link>

        {/* Security Badge */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-full">
          <LockKeyhole className="w-3.5 h-3.5" />
          <span>تکمیل امن خرید</span>
        </div>

        {/* Back to Cart Link */}
        <Link
          href="/cart"
          className="flex items-center gap-1 text-xs font-medium text-muted hover:text-foreground transition-colors"
        >
          <span className="hidden sm:inline">بازگشت به سبد خرید</span>
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </Link>
      </div>
    </header>
  );
}
