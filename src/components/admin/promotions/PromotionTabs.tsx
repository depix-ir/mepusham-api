"use client";

import React from "react";
import { Percent, Sparkles, Truck } from "lucide-react";

export type PromotionTabType = "discounts" | "campaigns" | "free-shipping";

interface PromotionTabsProps {
  activeTab: PromotionTabType;
  onTabChange: (tab: PromotionTabType) => void;
  discountCount?: number;
  campaignCount?: number;
  freeShippingCount?: number;
}

export function PromotionTabs({
  activeTab,
  onTabChange,
  discountCount,
  campaignCount,
  freeShippingCount,
}: PromotionTabsProps) {
  return (
    <div className="border-b border-border mb-6">
      <nav className="flex gap-4 overflow-x-auto no-scrollbar" aria-label="مدیریت پروموشن‌ها">
        <button
          type="button"
          onClick={() => onTabChange("discounts")}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "discounts"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border-subtle"
          }`}
          aria-current={activeTab === "discounts" ? "page" : undefined}
        >
          <Percent className="w-4 h-4 shrink-0" />
          <span>تخفیف‌ها</span>
          {discountCount !== undefined && (
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === "discounts"
                  ? "bg-primary/10 text-primary font-bold"
                  : "bg-surface-subtle text-muted-foreground"
              }`}
            >
              {discountCount.toLocaleString("fa-IR")}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onTabChange("campaigns")}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "campaigns"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border-subtle"
          }`}
          aria-current={activeTab === "campaigns" ? "page" : undefined}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>کمپین‌ها</span>
          {campaignCount !== undefined && (
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === "campaigns"
                  ? "bg-primary/10 text-primary font-bold"
                  : "bg-surface-subtle text-muted-foreground"
              }`}
            >
              {campaignCount.toLocaleString("fa-IR")}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onTabChange("free-shipping")}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "free-shipping"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border-subtle"
          }`}
          aria-current={activeTab === "free-shipping" ? "page" : undefined}
        >
          <Truck className="w-4 h-4 shrink-0" />
          <span>ارسال رایگان</span>
          {freeShippingCount !== undefined && (
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === "free-shipping"
                  ? "bg-primary/10 text-primary font-bold"
                  : "bg-surface-subtle text-muted-foreground"
              }`}
            >
              {freeShippingCount.toLocaleString("fa-IR")}
            </span>
          )}
        </button>
      </nav>
    </div>
  );
}
