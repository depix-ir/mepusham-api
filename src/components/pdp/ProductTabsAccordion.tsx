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

  // Store open states for accordion items
  const [openSection, setOpenSection] = useState<string | null>("specs");

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  if (!hasContent) return null;

  return (
    <div className="flex flex-col border border-border-product rounded-2xl overflow-hidden bg-background shadow-xs divide-y divide-border-product/60">
      {/* 1. Specifications */}
      {specifications.length > 0 && (
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => toggleSection("specs")}
            className="flex items-center justify-between p-4 font-bold text-sm sm:text-base text-foreground hover:bg-surface-subtle/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
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
            <div className="p-4 border-t border-border-product/40 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {specifications.map((spec, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-subtle text-xs"
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

      {/* 3. Care & Washing Instructions */}
      {careInstructions.length > 0 && (
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => toggleSection("care")}
            className="flex items-center justify-between p-4 font-bold text-sm sm:text-base text-foreground hover:bg-surface-subtle/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
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
            <div className="p-4 border-t border-border-product/40 animate-fade-in">
              <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-foreground/80 leading-relaxed">
                {careInstructions.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 4. Shipping & Returns */}
      {shippingReturns && (
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => toggleSection("shipping")}
            className="flex items-center justify-between p-4 font-bold text-sm sm:text-base text-foreground hover:bg-surface-subtle/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
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
            <div className="p-4  text-xs sm:text-sm text-foreground/80 leading-relaxed whitespace-pre-line border-t border-border-product/40 animate-fade-in">
              {shippingReturns}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
