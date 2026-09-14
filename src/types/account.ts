export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "handed_to_carrier"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export interface OrderItem {
  id: string;
  productId: string;
  title: string;
  image: string;
  quantity: number;
  unitPrice: number;
  finalUnitPrice: number;
  variant?: {
    color?: string;
    size?: string;
  };
}

export interface OrderTimelineItem {
  id: string;
  status: OrderStatus;
  title: string;
  description?: string;
  date?: string;
  completed: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  itemsSubtotal: number;
  shippingCost: number;
  payableTotal: number;
  shippingMethod: {
    id: string;
    title: string;
    trackingCode?: string;
    carrierName?: string;
  };
  shippingAddress: {
    recipientName: string;
    phone: string;
    province: string;
    city: string;
    address: string;
    postalCode: string;
  };
  timeline: OrderTimelineItem[];
}

export interface UserAddress {
  id: string;
  title: string;
  recipientName: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  isDefault: boolean;
}

export type TicketStatus =
  | "open"
  | "waiting-user"
  | "waiting-support"
  | "closed";

export interface TicketAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface TicketMessage {
  id: string;
  sender: "user" | "support";
  text: string;
  createdAt: string;
  attachments?: TicketAttachment[];
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  orderId?: string;
  orderNumber?: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "در حال بررسی",
  confirmed: "تأیید شده",
  processing: "درحال آماده سازی",
  handed_to_carrier: "تحویل به پست",
  shipped: "ارسال شد",
  delivered: "تحویل داده شد",
  cancelled: "لغو شده",
  returned: "مرجوع شده",
};

/**
 * Checks if admin is allowed to manually transition an order to a new status.
 * Admin-controlled status flow:
 * pending / confirmed -> processing -> handed_to_carrier
 * Also cancellation is allowed for pending, confirmed, processing, handed_to_carrier.
 * Shipping provider-controlled:
 * shipped, delivered
 */
export function getNextAdminStatus(currentStatus: OrderStatus): OrderStatus | null {
  switch (currentStatus) {
    case "pending":
    case "confirmed":
      return "processing";
    case "processing":
      return "handed_to_carrier";
    default:
      return null;
  }
}

export function canAdminCancelOrder(status: OrderStatus): boolean {
  return ["pending", "confirmed", "processing", "handed_to_carrier"].includes(status);
}

export const ticketStatusLabels: Record<TicketStatus, string> = {
  open: "در حال بررسی",
  "waiting-user": "پاسخ داده شد",
  "waiting-support": "در انتظار پاسخ",
  closed: "بسته شده",
};
