import React from "react";
import { Truck, ShieldCheck, RotateCcw } from "lucide-react";

export function TrustSignals() {
  return (
    <div className="grid grid-cols-3 gap-2 py-2.5 px-3 border border-border-product/60 bg-surface-subtle/30 rounded-lg text-xs">
      <div className="flex items-center gap-2">
        <Truck className="w-4 h-4 text-primary shrink-0" />
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-[11px] sm:text-xs">ارسال سریع</span>
          <span className="text-[10px] text-muted hidden sm:inline">پست پیشتاز و پیک</span>
        </div>
      </div>
      <div className="flex items-center gap-2 border-x border-border-product/60 px-2">
        <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-[11px] sm:text-xs">ضمانت اصالت</span>
          <span className="text-[10px] text-muted hidden sm:inline">تضمین ٪۱۰۰ کیفیت</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <RotateCcw className="w-4 h-4 text-primary shrink-0" />
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-[11px] sm:text-xs">۷ روز بازگشت</span>
          <span className="text-[10px] text-muted hidden sm:inline">تعویض و مرجوعی راحت</span>
        </div>
      </div>
    </div>
  );
}
