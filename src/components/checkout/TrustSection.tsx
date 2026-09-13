"use client";

import React, { useState } from "react";
import { ShieldCheck, RotateCcw, PackageCheck, ChevronLeft } from "lucide-react";
import { ReturnPolicyModal } from "./ReturnPolicyModal";

export function TrustSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-3">
          {/* Item 1 */}
          <div className="flex items-center gap-2.5 text-xs text-foreground/80">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">ضمانت اصالت کالا</span>
              <span className="text-[11px] text-muted">تضمین ۱۰۰٪ اصل بودن</span>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex items-center gap-2.5 text-xs text-foreground/80">
            <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">ضمانت بازگشت وجه</span>
              <span className="text-[11px] text-muted">تا ۷ روز مهلت</span>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex items-center gap-2.5 text-xs text-foreground/80">
            <PackageCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">ارسال مطمئن</span>
              <span className="text-[11px] text-muted">پست یا تیپاکس</span>
            </div>
          </div>
        </div>

        {/* Return Policy Link */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="text-[11px] font-medium text-muted hover:text-primary inline-flex items-center gap-1 transition-colors cursor-pointer pt-1"
        >
          <span>مطالعه شرایط بازگشت و مرجوعی کالا</span>
          <ChevronLeft className="w-3 h-3 rtl:rotate-180" />
        </button>
      </div>

      {/* Return Policy Inline Modal */}
      <ReturnPolicyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
