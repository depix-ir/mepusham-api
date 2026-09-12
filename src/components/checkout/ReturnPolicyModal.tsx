"use client";

import React, { useEffect } from "react";
import { X, ShieldAlert, CheckCircle, RotateCcw } from "lucide-react";

interface ReturnPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReturnPolicyModal({ isOpen, onClose }: ReturnPolicyModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="return-policy-title"
    >
      <div
        className="relative w-full max-w-lg bg-background border border-border-subtle rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-primary" />
            <h3 id="return-policy-title" className="text-base font-bold text-foreground">
              شرایط بازگشت و مرجوعی کالا
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-muted hover:text-foreground rounded-lg hover:bg-surface-subtle transition-colors cursor-pointer"
            aria-label="بستن پنجره"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-foreground/80 leading-relaxed">
          <p className="font-medium text-foreground">
            فروشگاه متعهد به ارائه کالای باکیفیت و اصیل است. در صورت نیاز به مرجوعی کالا، قوانین زیر اعمال می‌گردد:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground block mb-0.5">مهلت ۷ روزه مرجوعی</span>
                <p className="text-muted">
                  امکان درخواست مرجوعی تا ۷ روز پس از تحویل کالا وجود دارد.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground block mb-0.5">سلامت فیزیکی و پلمب کالا</span>
                <p className="text-muted">
                  کالا باید در بسته‌بندی اولیه، بدون استفاده، آسیب یا جدا شدن اتیکت و تگ محصول باشد.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-foreground block mb-0.5">کالاهای مغایر یا دارای مغایرت</span>
                <p className="text-muted">
                  در صورت عدم تطابق سایز یا وجود ایراد فنی، هزینه عودت بر عهده فروشگاه خواهد بود.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-surface-subtle border border-border-subtle rounded-xl text-[11px] sm:text-xs text-muted">
            پس از ثبت درخواست مرجوعی در پشتیبانی، کارشناسان ما ظرف ۲۴ ساعت با شما تماس خواهند گرفت.
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-border-subtle bg-surface-subtle/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary-hover transition-colors cursor-pointer"
          >
            متوجه شدم
          </button>
        </div>
      </div>
    </div>
  );
}
