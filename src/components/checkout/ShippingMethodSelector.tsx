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
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-bold text-foreground pb-2 border-b border-border-subtle flex items-center gap-2">
        <Truck className="w-4 h-4 text-primary shrink-0" />
        <span>روش ارسال</span>
      </h2>

      <div className="grid grid-cols-1 gap-3">
        {methods.map((method) => {
          const isSelected = method.id === selectedMethodId;

          return (
            <div
              key={method.id}
              onClick={() => onSelect(method.id)}
              className={`relative flex items-start justify-between p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-xs"
                  : "border-border-subtle bg-background hover:border-border"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-primary">
                  {isSelected ? (
                    <CheckCircle2 className="w-5 h-5 text-primary fill-primary/10" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted" />
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {method.title}
                    </span>
                    <span className="text-[11px] font-medium text-muted bg-surface-subtle px-2 py-0.5 rounded-full">
                      تحویل: {method.estimatedDelivery}
                    </span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    {method.description}
                  </p>
                </div>
              </div>

              <div className="text-sm font-black text-foreground shrink-0 pt-0.5">
                {formatPrice(method.price)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
