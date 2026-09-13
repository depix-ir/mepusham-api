"use client";

import React, { useState } from "react";
import { ProductSpecification } from "@/types/product";
import { ClipboardList, Shirt, Truck, ChevronDown } from "lucide-react";

export interface ProductTabsAccordionProps {
  specifications?: ProductSpecification[];
  careInstructions?: string[];
  shippingReturns?: string;
}

export function ProductTabsAccordion({
  specifications = [],
  careInstructions = [],
  shippingReturns,
}: ProductTabsAccordionProps) {
  const hasContent = specifications.length > 0 || careInstructions.length > 0 || Boolean(shippingReturns);

  const [openSection, setOpenSection] = useState<string | null>("specs");

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  if (!hasContent) return null;

  return (
    <div className="flex flex-col border border-border-product/70 rounded-xl overflow-hidden bg-background divide-y divide-border-product/60">
      {/* 1. Specifications */}
      {specifications.length > 0 && (
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => toggleSection("specs")}
            className="flex items-center justify-between p-3.5 font-bold text-xs sm:text-sm text-foreground hover:bg-surface-subtle/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-primary shrink-0" />
              <span>مشخصات فنی</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openSection === "specs" ? "rotate-180 text-primary" : "text-muted"
              }`}
            />
          </button>
          {openSection === "specs" && (
            <div className="p-3.5 border-t border-border-product/40 animate-fade-in bg-surface-subtle/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {specifications.map((spec, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-surface-subtle/60 text-xs"
                  >
                    <span className="text-muted font-medium">{spec.label}:</span>
                    <span className="text-foreground font-semibold">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Care & Washing Instructions */}
      {careInstructions.length > 0 && (
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => toggleSection("care")}
            className="flex items-center justify-between p-3.5 font-bold text-xs sm:text-sm text-foreground hover:bg-surface-subtle/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Shirt className="w-4 h-4 text-primary shrink-0" />
              <span>راهنمای شستشو و نگهداری</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openSection === "care" ? "rotate-180 text-primary" : "text-muted"
              }`}
            />
          </button>
          {openSection === "care" && (
            <div className="p-3.5 border-t border-border-product/40 animate-fade-in bg-surface-subtle/20">
              <ul className="list-disc list-inside space-y-1.5 text-xs text-foreground/80 leading-relaxed">
                {careInstructions.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 3. Shipping & Returns */}
      {shippingReturns && (
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => toggleSection("shipping")}
            className="flex items-center justify-between p-3.5 font-bold text-xs sm:text-sm text-foreground hover:bg-surface-subtle/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary shrink-0" />
              <span>شرایط ارسال و مرجوعی</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                openSection === "shipping" ? "rotate-180 text-primary" : "text-muted"
              }`}
            />
          </button>
          {openSection === "shipping" && (
            <div className="p-3.5 text-xs text-foreground/80 leading-relaxed whitespace-pre-line border-t border-border-product/40 animate-fade-in bg-surface-subtle/20">
              {shippingReturns}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
