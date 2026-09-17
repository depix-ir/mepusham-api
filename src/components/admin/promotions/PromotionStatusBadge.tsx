"use client";

import React from "react";
import { DiscountStatus, statusLabels } from "@/types/promotion";
import { CheckCircle2, Clock, AlertTriangle, Power } from "lucide-react";

interface PromotionStatusBadgeProps {
  status: DiscountStatus;
  className?: string;
}

export function PromotionStatusBadge({
  status,
  className = "",
}: PromotionStatusBadgeProps) {
  const config = {
    active: {
      label: statusLabels.active,
      icon: CheckCircle2,
      bgClass: "bg-emerald-50 border-emerald-200 text-emerald-800",
      iconClass: "text-emerald-600",
    },
    scheduled: {
      label: statusLabels.scheduled,
      icon: Clock,
      bgClass: "bg-blue-50 border-blue-200 text-blue-800",
      iconClass: "text-blue-600",
    },
    expired: {
      label: statusLabels.expired,
      icon: AlertTriangle,
      bgClass: "bg-amber-50 border-amber-200 text-amber-800",
      iconClass: "text-amber-600",
    },
    disabled: {
      label: statusLabels.disabled,
      icon: Power,
      bgClass: "bg-neutral-100 border-neutral-300 text-neutral-700",
      iconClass: "text-neutral-500",
    },
  }[status];

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${config.bgClass} ${className}`}
    >
      <Icon className={`w-3.5 h-3.5 ${config.iconClass} shrink-0`} />
      <span>{config.label}</span>
    </span>
  );
}
