"use client";

import React from "react";
import { OrderStatus, orderStatusLabels } from "@/types/account";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className = "" }: OrderStatusBadgeProps) {
  const getBadgeStyle = (st: OrderStatus) => {
    switch (st) {
      case "pending":
        return "bg-amber-500/10 text-amber-700 border-amber-500/20";
      case "confirmed":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20";
      case "processing":
        return "bg-indigo-500/10 text-indigo-700 border-indigo-500/20";
      case "handed_to_carrier":
        return "bg-sky-500/10 text-sky-700 border-sky-500/20";
      case "shipped":
        return "bg-blue-600/10 text-blue-800 border-blue-600/20";
      case "delivered":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
      case "cancelled":
        return "bg-rose-500/10 text-rose-700 border-rose-500/20";
      case "returned":
        return "bg-orange-500/10 text-orange-700 border-orange-500/20";
      default:
        return "bg-surface-subtle text-muted-foreground border-border";
    }
  };

  const label = orderStatusLabels[status] || status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border ${getBadgeStyle(
        status
      )} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      <span>{label}</span>
    </span>
  );
}
