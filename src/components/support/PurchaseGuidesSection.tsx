"use client";

import React, { useState } from "react";
import { purchaseGuides, PurchaseGuideItem } from "@/data/supportData";
import {
  BookOpen,
  ShoppingBag,
  Ruler,
  CreditCard,
  RefreshCw,
  ChevronLeft,
  X,
  CheckCircle2,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  ShoppingBag,
  Ruler,
  CreditCard,
  RefreshCw,
};

export function PurchaseGuidesSection() {
  const [selectedGuide, setSelectedGuide] = useState<PurchaseGuideItem | null>(null);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            راهنمای خرید و قوانین
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          راهنماهای کامل خرید، اندازه‌گیری سایز، شیوه پرداخت و شرایط بازگشت کالا
        </p>
      </div>

      {/* Grid of Guide Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {purchaseGuides.map((guide) => {
          const IconComponent = iconMap[guide.iconName] || BookOpen;

          return (
            <div
              key={guide.id}
              onClick={() => setSelectedGuide(guide)}
              className="p-4 bg-surface border border-border rounded-2xl flex flex-col justify-between space-y-3 hover:border-primary/50 hover:shadow-2xs transition-all cursor-pointer group"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:scale-105">
                  <IconComponent className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {guide.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {guide.shortDesc}
                </p>
              </div>

              <div className="flex items-center text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                <span>مشاهده راهنما</span>
                <ChevronLeft className="w-4 h-4 ml-0.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Modal / Bottom Sheet for Selected Guide */}
      {selectedGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={() => setSelectedGuide(null)}
        >
          <div
            className="relative w-full max-w-lg bg-background border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-subtle">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  {React.createElement(iconMap[selectedGuide.iconName] || BookOpen, {
                    className: "w-4 h-4",
                  })}
                </div>
                <h3 className="text-base font-bold text-foreground">
                  {selectedGuide.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGuide(null)}
                className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-5 overflow-y-auto space-y-4">
              <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                {selectedGuide.fullContent}
              </p>

              {selectedGuide.steps && selectedGuide.steps.length > 0 && (
                <div className="pt-2 space-y-2">
                  <h4 className="text-xs font-bold text-foreground">
                    مراحل و نکات کلیدی:
                  </h4>
                  <ul className="space-y-2">
                    {selectedGuide.steps.map((step, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs text-muted-foreground bg-surface-subtle/50 p-2.5 rounded-xl"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
