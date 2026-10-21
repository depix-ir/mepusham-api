import React from "react";
import {
  RETURN_STATUS_LABELS,
  RETURN_REASON_LABELS,
  ReturnReason,
  RequestType,
} from "@/types/return";

interface ReturnStatusBadgeProps {
  status: string;
}

export function ReturnStatusBadge({ status }: ReturnStatusBadgeProps) {
  const label = RETURN_STATUS_LABELS[status] || status;

  let bgClass = "bg-gray-100 text-gray-800 border-gray-200";

  switch (status) {
    case "requested":
    case "under_review":
      bgClass = "bg-amber-50 text-amber-700 border-amber-200";
      break;
    case "approved":
    case "awaiting_customer_shipment":
      bgClass = "bg-blue-50 text-blue-700 border-blue-200";
      break;
    case "in_transit":
    case "received":
    case "inspection":
      bgClass = "bg-purple-50 text-purple-700 border-purple-200";
      break;
    case "inspection_approved":
    case "refund_pending":
    case "replacement_pending":
      bgClass = "bg-sky-50 text-sky-700 border-sky-200";
      break;
    case "refunded":
    case "replacement_shipped":
    case "completed":
      bgClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
      break;
    case "rejected":
    case "inspection_rejected":
    case "cancelled":
      bgClass = "bg-rose-50 text-rose-700 border-rose-200";
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${bgClass}`}
    >
      {label}
    </span>
  );
}

export function RequestTypeBadge({ type }: { type: RequestType }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
      مرجوعی
    </span>
  );
}

export function ReturnReasonBadge({ reason }: { reason: ReturnReason }) {
  const label = RETURN_REASON_LABELS[reason] || reason;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-foreground/80 bg-surface-subtle border border-border">
      {label}
    </span>
  );
}
