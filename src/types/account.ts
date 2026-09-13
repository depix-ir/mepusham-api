export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
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

export interface TicketMessage {
  id: string;
  sender: "user" | "support";
  text: string;
  createdAt: string;
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
  pending: "در انتظار تأیید",
  confirmed: "تأیید شده",
  processing: "در حال آماده‌سازی",
  shipped: "در حال ارسال",
  delivered: "تحویل داده شده",
  cancelled: "لغو شده",
  returned: "مرجوع شده",
};

export const ticketStatusLabels: Record<TicketStatus, string> = {
  open: "در حال بررسی",
  "waiting-user": "پاسخ داده شد",
  "waiting-support": "در انتظار پاسخ",
  closed: "بسته شده",
};
