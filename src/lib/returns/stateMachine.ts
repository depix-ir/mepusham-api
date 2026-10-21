import { ReturnRequestStatus, RequestType } from "@/types/return";

export type AnyRequestStatus = ReturnRequestStatus;

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

/**
 * Validates if a state transition from `fromStatus` to `toStatus` is allowed.
 */
export function isValidStateTransition(
  type: RequestType,
  fromStatus: AnyRequestStatus,
  toStatus: AnyRequestStatus
): boolean {
  if (fromStatus === toStatus) return true;

  const allowed = VALID_RETURN_TRANSITIONS[fromStatus];
  return allowed ? allowed.includes(toStatus) : false;
}

/**
 * Returns allowed next statuses from current status.
 */
export function getAllowedNextStatuses(
  type: RequestType,
  currentStatus: AnyRequestStatus
): AnyRequestStatus[] {
  return VALID_RETURN_TRANSITIONS[currentStatus] || [];
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
  ].includes(status);
}

/**
 * Checks if a request is terminal (cannot be modified further).
 */
export function isTerminalState(status: AnyRequestStatus): boolean {
  return ["completed", "rejected", "cancelled", "refunded"].includes(status);
}
