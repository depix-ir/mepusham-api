export type SupportCategory =
  | "order"
  | "shipping"
  | "payment"
  | "return"
  | "product"
  | "account"
  | "complaint"
  | "feedback"
  | "other";

export type SupportTicketStatus =
  | "new"
  | "in_progress"
  | "waiting_for_customer"
  | "replied"
  | "resolved"
  | "closed";

export type SupportPriority = "normal" | "important" | "urgent";

export type SupportSenderType = "customer" | "admin" | "system";

export type SupportMessageType = "message" | "internal_note" | "automatic";

export interface SupportAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderType: SupportSenderType;
  senderId?: string;
  senderName?: string;
  type: SupportMessageType;
  body: string;
  attachments?: SupportAttachment[];
  createdAt: string;
}

export interface SupportActivity {
  id: string;
  ticketId: string;
  type: string;
  actorType: "customer" | "admin" | "system";
  actorId?: string;
  actorName?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;

  customerId: string;
  customerName: string;
  customerPhone: string;

  subject: string;
  category: SupportCategory;
  status: SupportTicketStatus;
  priority: SupportPriority;
  assignedTo?: string;

  orderId?: string;
  orderNumber?: string;
  returnId?: string;
  productId?: string;
  productTitle?: string;

  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  lastMessageSender?: SupportSenderType;

  firstResponseAt?: string;
  resolvedAt?: string;
  closedAt?: string;

  unreadForAdmin?: boolean;
  unreadForCustomer?: boolean;
}

export interface QuickReply {
  id: string;
  title: string;
  message: string;
  category?: SupportCategory;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const supportCategoryLabels: Record<SupportCategory, string> = {
  order: "سفارش",
  shipping: "پیگیری ارسال",
  payment: "پرداخت",
  return: "مرجوعی",
  product: "محصول",
  account: "حساب کاربری",
  complaint: "شکایت",
  feedback: "پیشنهاد و انتقاد",
  other: "سایر",
};

export const supportStatusLabelsCustomer: Record<SupportTicketStatus, string> = {
  new: "جدید",
  in_progress: "در حال بررسی",
  waiting_for_customer: "منتظر پاسخ شما",
  replied: "پاسخ داده شد",
  resolved: "حل شده",
  closed: "بسته شده",
};

export const supportStatusLabelsAdmin: Record<SupportTicketStatus, string> = {
  new: "جدید",
  in_progress: "در حال بررسی",
  waiting_for_customer: "منتظر پاسخ مشتری",
  replied: "پاسخ داده شد",
  resolved: "حل شده",
  closed: "بسته شده",
};

export const supportPriorityLabels: Record<SupportPriority, string> = {
  normal: "عادی",
  important: "مهم",
  urgent: "فوری",
};
