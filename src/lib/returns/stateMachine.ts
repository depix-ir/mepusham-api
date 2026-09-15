import {
  ReturnRequestStatus,
  ExchangeRequestStatus,
  RequestType,
} from "@/types/return";

export type AnyRequestStatus = ReturnRequestStatus | ExchangeRequestStatus;

export const VALID_RETURN_TRANSITIONS: Record<
  ReturnRequestStatus,
  ReturnRequestStatus[]
> = {
  requested: ["under_review", "approved", "rejected", "cancelled"],
  under_review: ["approved", "rejected", "cancelled"],
  approved: ["awaiting_customer_shipment", "in_transit", "received", "cancelled"],
  rejected: [],
  awaiting_customer_shipment: ["in_transit", "received", "cancelled"],
  in_transit: ["received", "cancelled"],
  received: ["inspection"],
  inspection: ["inspection_approved", "inspection_rejected"],
  inspection_approved: ["refund_pending", "refunded", "completed"],
  inspection_rejected: ["completed", "rejected"],
  refund_pending: ["refunded", "completed"],
  refunded: ["completed"],
  completed: [],
  cancelled: [],
};

export const VALID_EXCHANGE_TRANSITIONS: Record<
  ExchangeRequestStatus,
  ExchangeRequestStatus[]
> = {
  requested: ["under_review", "approved", "rejected", "cancelled"],
  under_review: ["approved", "rejected", "cancelled"],
  approved: ["awaiting_customer_shipment", "in_transit", "received", "cancelled"],
  rejected: [],
  awaiting_customer_shipment: ["in_transit", "received", "cancelled"],
  in_transit: ["received", "cancelled"],
  received: ["inspection"],
  inspection: ["inspection_approved", "inspection_rejected"],
  inspection_approved: ["replacement_pending", "replacement_shipped"],
  inspection_rejected: ["completed", "rejected"],
  replacement_pending: ["replacement_shipped", "completed"],
  replacement_shipped: ["completed"],
  completed: [],
  cancelled: [],
};

/**
 * Validates if a state transition from `fromStatus` to `toStatus` is allowed.
 */
export function isValidStateTransition(
  type: RequestType,
  fromStatus: AnyRequestStatus,
  toStatus: AnyRequestStatus
): boolean {
  if (fromStatus === toStatus) return true;

  if (type === "return") {
    const allowed = VALID_RETURN_TRANSITIONS[fromStatus as ReturnRequestStatus];
    return allowed ? allowed.includes(toStatus as ReturnRequestStatus) : false;
  } else {
    const allowed = VALID_EXCHANGE_TRANSITIONS[fromStatus as ExchangeRequestStatus];
    return allowed ? allowed.includes(toStatus as ExchangeRequestStatus) : false;
  }
}

/**
 * Returns allowed next statuses from current status.
 */
export function getAllowedNextStatuses(
  type: RequestType,
  currentStatus: AnyRequestStatus
): AnyRequestStatus[] {
  if (type === "return") {
    return VALID_RETURN_TRANSITIONS[currentStatus as ReturnRequestStatus] || [];
  } else {
    return VALID_EXCHANGE_TRANSITIONS[currentStatus as ExchangeRequestStatus] || [];
  }
}

/**
 * Checks if a request requires action from admin.
 */
export function isActionRequiredByAdmin(status: AnyRequestStatus): boolean {
  return [
    "requested",
    "under_review",
    "received",
    "inspection",
    "inspection_approved",
    "refund_pending",
    "replacement_pending",
  ].includes(status);
}

/**
 * Checks if a request is terminal (cannot be modified further).
 */
export function isTerminalState(status: AnyRequestStatus): boolean {
  return ["completed", "rejected", "cancelled", "refunded"].includes(status);
}
