"use client";

import React from "react";
import { Tag, CheckCircle, Clock, Ban } from "lucide-react";

interface SummaryCardItem {
  title: string;
  value: number;
  description: string;
  type: "total" | "active" | "scheduled" | "expiredOrDisabled";
}

interface PromotionSummaryCardsProps {
  totalCount: number;
  activeCount: number;
  scheduledCount: number;
  inactiveCount: number; // expired or disabled
  isFreeShipping?: boolean;
}

export function PromotionSummaryCards({
  totalCount,
  activeCount,
  scheduledCount,
  inactiveCount,
  isFreeShipping = false,
}: PromotionSummaryCardsProps) {
  const cards: SummaryCardItem[] = [
    {
      title: isFreeShipping ? "کل قوانین" : "کل تخفیف‌ها",
      value: totalCount,
      description: "ثبت‌شده در سیستم",
      type: "total",
    },
    {
      title: "فعال",
      value: activeCount,
      description: "در حال اجرا",
      type: "active",
    },
    {
      title: "زمان‌بندی‌شده",
      value: scheduledCount,
      description: "آینده",
      type: "scheduled",
    },
    {
      title: "منقضی/غیرفعال",
      value: inactiveCount,
      description: "غیرفعال",
      type: "expiredOrDisabled",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
      {cards.map((card) => {
        let Icon = Tag;
        let iconBg = "bg-primary/10 text-primary";

        if (card.type === "active") {
          Icon = CheckCircle;
          iconBg = "bg-emerald-100 text-emerald-700";
        } else if (card.type === "scheduled") {
          Icon = Clock;
          iconBg = "bg-blue-100 text-blue-700";
        } else if (card.type === "expiredOrDisabled") {
          Icon = Ban;
          iconBg = "bg-neutral-200 text-neutral-600";
        }

        return (
          <div
            key={card.title}
            className="bg-background border border-border rounded-xl p-3.5 md:p-4 flex items-center justify-between shadow-2xs transition-shadow hover:shadow-xs"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground font-medium">
                {card.title}
              </span>
              <span className="text-xl md:text-2xl font-bold text-foreground">
                {card.value.toLocaleString("fa-IR")}
              </span>
              <span className="text-[11px] text-muted-foreground/80">
                {card.description}
              </span>
            </div>
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}
            >
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
