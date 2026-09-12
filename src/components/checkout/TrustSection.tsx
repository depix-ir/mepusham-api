"use client";

import React, { useState } from "react";
import { ShieldCheck, RotateCcw, PackageCheck, ChevronLeft } from "lucide-react";
import { ReturnPolicyModal } from "./ReturnPolicyModal";

export function TrustSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="w-full bg-surface-subtle/50 border border-border-subtle rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
        <h3 className="text-xs font-bold text-foreground/80 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          <span>خرید مطمئن و تضمین شده</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Item 1 */}
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-background border border-border-subtle/60">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-foreground">ضمانت اصالت کالا</span>
              <span className="text-[11px] text-muted leading-tight">تضمین ۱۰۰٪ اصل بودن کالاها</span>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-background border border-border-subtle/60">
            <RotateCcw className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-foreground">ضمانت بازگشت وجه</span>
              <span className="text-[11px] text-muted leading-tight">تا ۷ روز طبق شرایط فروشگاه</span>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-background border border-border-subtle/60">
            <PackageCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-foreground">ارسال مطمئن</span>
              <span className="text-[11px] text-muted leading-tight">تحویل به پست یا تیپاکس</span>
            </div>
          </div>
        </div>

        {/* Return Policy Link */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="self-start text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors cursor-pointer pt-1"
        >
          <span>مطالعه شرایط بازگشت و مرجوعی کالا</span>
          <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
        </button>
      </div>

      {/* Return Policy Inline Modal */}
      <ReturnPolicyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
