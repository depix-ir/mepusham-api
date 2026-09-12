import React from "react";
import { TruckIcon, ShieldIcon, RefreshIcon } from "@/components/icons";

export function TrustSignals() {
  return (
    <div className="grid grid-cols-3 gap-2 py-3.5 border-y border-border-product/60 bg-surface-subtle/40 rounded-xl px-2 my-2">
      <div className="flex flex-col items-center text-center gap-1">
        <TruckIcon size={22} className="text-primary" />
        <span className="text-[11px] font-bold text-foreground">ارسال سریع</span>
        <span className="text-[10px] text-muted">پست پیشتاز و پیک</span>
      </div>
      <div className="flex flex-col items-center text-center gap-1 border-x border-border-product/60 px-1">
        <ShieldIcon size={22} className="text-primary" />
        <span className="text-[11px] font-bold text-foreground">ضمانت اصالت</span>
        <span className="text-[10px] text-muted">تضمین کیفیت کالا</span>
      </div>
      <div className="flex flex-col items-center text-center gap-1">
        <RefreshIcon size={22} className="text-primary" />
        <span className="text-[11px] font-bold text-foreground">۷ روز بازگشت</span>
        <span className="text-[10px] text-muted">امکان تعویض راحت</span>
      </div>
    </div>
  );
}
