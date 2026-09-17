"use client";

import React from "react";

interface PromotionUsageBarProps {
  usedCount: number;
  usageLimit?: number;
  compact?: boolean;
}

export function PromotionUsageBar({
  usedCount,
  usageLimit,
  compact = false,
}: PromotionUsageBarProps) {
  if (usageLimit === undefined || usageLimit <= 0) {
    return (
      <span className="text-xs text-foreground font-medium">نامحدود</span>
    );
  }

  const percentage = Math.min(100, Math.round((usedCount / usageLimit) * 100));

  return (
    <div className={`flex flex-col gap-1 ${compact ? "max-w-[120px]" : "w-full"}`}>
      <div className="flex items-center justify-between text-xs font-semibold text-foreground">
        <span>
          {usedCount.toLocaleString("fa-IR")} / {usageLimit.toLocaleString("fa-IR")}
        </span>
        {!compact && (
          <span className="text-[11px] text-muted-foreground font-normal">
            %{percentage.toLocaleString("fa-IR")}
          </span>
        )}
      </div>

      <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            percentage >= 90
              ? "bg-rose-500"
              : percentage >= 60
              ? "bg-amber-500"
              : "bg-primary"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
