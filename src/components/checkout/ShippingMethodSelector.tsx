"use client";

import React from "react";
import { ShippingOption } from "@/data/shipping";
import { formatPrice } from "@/lib/formatting/currency";
import { Truck, CheckCircle2, Circle } from "lucide-react";

interface ShippingMethodSelectorProps {
  methods: ShippingOption[];
  selectedMethodId: string;
  onSelect: (methodId: string) => void;
}

export function ShippingMethodSelector({
  methods,
  selectedMethodId,
  onSelect,
}: ShippingMethodSelectorProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2.5 pb-3 border-b border-border-subtle">
        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
          ۲
        </div>
        <h2 className="text-base font-bold text-foreground tracking-tight">
          روش ارسال
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {methods.map((method) => {
          const isSelected = method.id === selectedMethodId;

          return (
            <div
              key={method.id}
              onClick={() => onSelect(method.id)}
              className={`relative flex items-center justify-between p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer select-none ${
                isSelected
                  ? "border-primary bg-primary/[0.03]"
                  : "border-border-subtle bg-background hover:border-border-strong"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0 text-primary">
                  {isSelected ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted/60" />
                  )}
                </div>

                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-foreground">
                      {method.title}
                    </span>
                    <span className="text-[11px] font-medium text-muted bg-surface-subtle px-2 py-0.5 rounded-md">
                      تحویل: {method.estimatedDelivery}
                    </span>
                  </div>
                  <p className="text-xs text-muted truncate">
                    {method.description}
                  </p>
                </div>
              </div>

              <div className="text-xs sm:text-sm font-extrabold text-foreground shrink-0 pr-3">
                {formatPrice(method.price)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
