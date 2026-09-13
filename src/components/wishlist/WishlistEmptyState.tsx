"use client";

import React from "react";
import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function WishlistEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-background border border-border-product rounded-2xl my-6 gap-4 max-w-lg mx-auto shadow-xs">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-1">
        <Heart size={36} className="text-rose-500" fill="currentColor" />
      </div>

      <div className="flex flex-col gap-1.5">
        <h2 className="text-base sm:text-lg font-bold text-foreground">
          هنوز محصولی را به پسندیده‌ها اضافه نکرده‌اید
        </h2>
        <p className="text-xs sm:text-sm text-muted max-w-sm leading-relaxed">
          محصولاتی که دوست دارید را ذخیره کنید تا بعداً راحت‌تر آن‌ها را پیدا کنید.
        </p>
      </div>

      <Link href="/products" className="mt-2">
        <Button variant="primary" size="lg" className="gap-2 font-bold px-6">
          <span>مشاهده محصولات</span>
          <ArrowLeft size={18} />
        </Button>
      </Link>
    </div>
  );
}
