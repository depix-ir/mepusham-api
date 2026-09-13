"use client";

import React from "react";
import { ShieldCheck, RotateCcw, Truck } from "lucide-react";

export function WishlistTrustSection() {
  return (
    <div className="border-t border-border-product/60 pt-3 mt-1 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs text-foreground/80 font-medium">
        <ShieldCheck size={16} className="text-primary shrink-0" />
        <span>ضمانت اصالت و سلامت فیزیکی کالا</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-foreground/80 font-medium">
        <RotateCcw size={16} className="text-primary shrink-0" />
        <span>۷ روز ضمانت بازگشت طبق شرایط فروشگاه</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-foreground/80 font-medium">
        <Truck size={16} className="text-primary shrink-0" />
        <span>ارسال سریع و مطمئن سراسر کشور</span>
      </div>
    </div>
  );
}
