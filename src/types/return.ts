export type ReturnReason =
  | "size_issue"
  | "color_mismatch"
  | "not_as_described"
  | "damaged"
  | "wrong_item"
  | "quality_issue"
  | "changed_mind"
  | "other";

export type ReturnReasonPolicy = {
  reason: ReturnReason;
  label: string;
  customerPaysReturnShipping: boolean;
  refundShippingCost: boolean;
  requiresInspection: boolean;
  requiresEvidence: boolean;
  autoApprove: boolean;
  description: string;
};

export type RequestType = "return" | "exchange";

export type ReturnRequestStatus =
  | "requested"
  | "under_review"
  | "approved"
  | "rejected"
  | "awaiting_customer_shipment"
  | "in_transit"
  | "received"
  | "inspection"
  | "inspection_approved"
  | "inspection_rejected"
  | "refund_pending"
  | "refunded"
  | "completed"
  | "cancelled";

export type ExchangeRequestStatus =
  | "requested"
  | "under_review"
  | "approved"
  | "rejected"
  | "awaiting_customer_shipment"
  | "in_transit"
  | "received"
  | "inspection"
  | "inspection_approved"
  | "inspection_rejected"
  | "replacement_pending"
  | "replacement_shipped"
  | "completed"
  | "cancelled";

export type InspectionResult =
  | "pending"
  | "sellable"
  | "needs_review"
  | "damaged"
  | "unsellable";

export type RefundStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export type Refund = {
  status: RefundStatus;
  amount: number;
  method: "original_payment_method";
  processedAt?: string;
  referenceId?: string;
  note?: string;
};

export type ShipmentStatus =
  | "not_started"
  | "awaiting_customer"
  | "in_transit"
  | "received";

export type ReturnShipment = {
  status: ShipmentStatus;
  method?: "post" | "tipax" | "other";
  trackingCode?: string;
  shippedAt?: string;
  receivedAt?: string;
  payer: "customer" | "merchant";
  shippingCostAmount: number;
};

export type ExchangeDetails = {
  originalVariantId: string;
  originalVariantDisplay?: string;
  replacementVariantId: string;
  replacementVariantDisplay?: string;
  replacementProductId: string;
  replacementProductTitle?: string;
  replacementUnitPrice?: number;
  originalUnitPrice?: number;
  priceDifference?: number; // Positive = customer pays more, Negative = merchant refunds difference
  replacementShipment?: {
    status: "pending" | "preparing" | "shipped" | "delivered";
    trackingCode?: string;
    shippedAt?: string;
    carrierName?: string;
  };
};

export type ReturnTimelineEvent = {
  id: string;
  type: string;
  title: string;
  description?: string;
  actor: "customer" | "admin" | "system";
  actorName?: string;
  createdAt: string;
};

export type ReturnItemInspection = {
  result: InspectionResult;
  note?: string;
  inspectedAt?: string;
  inspectedBy?: string;
};

export type ReturnItem = {
  id: string;
  orderItemId: string;
  productId: string;
  productTitle: string;
  productImage: string;
  variantId?: string;
  variantDisplay?: string;
  sku?: string;
  quantity: number;
  purchasedUnitPrice: number;
  reason: ReturnReason;
  customerNote?: string;
  evidence?: string[];
  inspection?: ReturnItemInspection;
  refundAmount: number;
};

export type ReturnRequest = {
  id: string;
  requestNumber: string;
  type: RequestType;

  orderId: string;
  orderNumber: string;
  orderCreatedAt?: string;
  orderDeliveredAt?: string;

  customerId: string;
  customerName: string;
  customerPhone: string;

  status: ReturnRequestStatus | ExchangeRequestStatus;

  requestedAt: string;
  approvedAt?: string;
  receivedAt?: string;
  completedAt?: string;
  rejectedAt?: string;
  rejectReason?: string;

  reason: ReturnReason;
  customerNote?: string;

  items: ReturnItem[];

  shipment?: ReturnShipment;

  refund?: Refund;

  exchange?: ExchangeDetails;

  timeline: ReturnTimelineEvent[];

  createdAt: string;
  updatedAt: string;
};

export type ReturnRequestFilters = {
  type?: "all" | RequestType;
  status?: string;
  reason?: ReturnReason | "all";
  actionRequiredOnly?: boolean;
  dateRange?: "all" | "today" | "7days" | "30days";
  searchQuery?: string;
  page?: number;
  pageSize?: number;
};

export const RETURN_REASON_LABELS: Record<ReturnReason, string> = {
  size_issue: "مشکل سایز",
  color_mismatch: "عدم مطابقت رنگ",
  not_as_described: "عدم تطابق با مشخصات",
  damaged: "آسیب‌دیدگی کالا",
  wrong_item: "ارسال کالای اشتباه",
  quality_issue: "کیفیت نامناسب",
  changed_mind: "انصراف از خرید",
  other: "سایر موارد",
};

export const RETURN_STATUS_LABELS: Record<string, string> = {
  requested: "ثبت شده",
  under_review: "در حال بررسی",
  approved: "تأیید شده",
  rejected: "رد شده",
  awaiting_customer_shipment: "در انتظار ارسال مشتری",
  in_transit: "در مسیر برگشت",
  received: "دریافت شده",
  inspection: "در حال کارشناسی",
  inspection_approved: "تأیید کارشناسی",
  inspection_rejected: "رد کارشناسی",
  refund_pending: "در انتظار بازپرداخت",
  refunded: "بازپرداخت شده",
  replacement_pending: "در انتظار کالای جایگزین",
  replacement_shipped: "کالای جایگزین ارسال شد",
  completed: "تکمیل شده",
  cancelled: "لغو شده",
};

export const INSPECTION_RESULT_LABELS: Record<InspectionResult, string> = {
  pending: "در انتظار بررسی",
  sellable: "سالم و قابل فروش مجدد",
  needs_review: "نیازمند بررسی فنی/تعمیر",
  damaged: "آسیب‌دیده",
  unsellable: "مستعمل / غیرقابل فروش",
};
