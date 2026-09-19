import {
  SupportTicket,
  SupportMessage,
  SupportActivity,
  SupportTicketStatus,
  SupportPriority,
  SupportCategory,
  QuickReply,
  SupportAttachment,
} from "@/types/support";
import {
  mockInitialTickets,
  mockInitialMessages,
  mockInitialActivities,
  mockInitialQuickReplies,
  AUTOMATIC_RESPONSE_TEMPLATE,
} from "@/data/mockSupportData";
import { authService } from "@/lib/auth/authService";

const TICKETS_KEY = "mepusham_support_tickets_v2";
const MESSAGES_KEY = "mepusham_support_messages_v2";
const ACTIVITIES_KEY = "mepusham_support_activities_v2";
const QUICK_REPLIES_KEY = "mepusham_quick_replies_v1";

// In-memory store fallback for SSR and Bun test environment
const memoryStore: Record<string, unknown> = {};

function loadStorage<T>(key: string, initialData: T, isHydrated?: boolean): T {
  const activeHydration = isHydrated ?? (typeof window !== "undefined");
  if (!activeHydration) {
    if (!memoryStore[key]) {
      memoryStore[key] = initialData;
    }
    return memoryStore[key] as T;
  }
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(initialData));
      memoryStore[key] = initialData;
      return initialData;
    }
    const parsed = JSON.parse(raw) as T;
    memoryStore[key] = parsed;
    return parsed;
  } catch {
    if (!memoryStore[key]) {
      memoryStore[key] = initialData;
    }
    return memoryStore[key] as T;
  }
}

function saveStorage<T>(key: string, data: T): void {
  memoryStore[key] = data;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving storage key ${key}:`, err);
  }
}

function formatNowFa(): string {
  const d = new Date();
  const dateStr = d.toLocaleDateString("fa-IR");
  const timeStr = d.toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateStr} - ${timeStr}`;
}

export interface TicketFilterOptions {
  search?: string;
  status?: SupportTicketStatus | "all";
  priority?: SupportPriority | "all";
  category?: SupportCategory | "all";
  assignedTo?: string | "all";
  customerId?: string;
}

class SupportService {
  /* ================= TICKETS ================= */

  getTickets(filters?: TicketFilterOptions, options?: { isHydrated?: boolean }): SupportTicket[] {
    let tickets = this.readStoredTickets(options?.isHydrated);

    if (!filters) return tickets;

    if (filters.customerId) {
      tickets = tickets.filter((t) => t.customerId === filters.customerId);
    }

    if (filters.status && filters.status !== "all") {
      tickets = tickets.filter((t) => t.status === filters.status);
    }

    if (filters.priority && filters.priority !== "all") {
      tickets = tickets.filter((t) => t.priority === filters.priority);
    }

    if (filters.category && filters.category !== "all") {
      tickets = tickets.filter((t) => t.category === filters.category);
    }

    if (filters.assignedTo && filters.assignedTo !== "all") {
      if (filters.assignedTo === "unassigned") {
        tickets = tickets.filter((t) => !t.assignedTo);
      } else {
        tickets = tickets.filter((t) => t.assignedTo === filters.assignedTo);
      }
    }

    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      tickets = tickets.filter((t) => {
        const idMatch = t.id.toLowerCase().includes(q) || t.ticketNumber.includes(q);
        const nameMatch = t.customerName.toLowerCase().includes(q);
        const phoneMatch = t.customerPhone.includes(q);
        const subjectMatch = t.subject.toLowerCase().includes(q);
        const orderMatch = t.orderNumber ? t.orderNumber.includes(q) : false;

        // Message body search
        const msgs = this.getMessages(t.id);
        const bodyMatch = msgs.some((m) => m.body.toLowerCase().includes(q));

        return idMatch || nameMatch || phoneMatch || subjectMatch || orderMatch || bodyMatch;
      });
    }

    return tickets;
  }

  getTicketById(ticketId: string): SupportTicket | undefined {
    const cleanId = ticketId.replace(/^#/, "").trim();
    const tickets = this.readStoredTickets();
    return tickets.find(
      (t) => t.id === cleanId || t.ticketNumber === cleanId || t.id === ticketId
    );
  }

  /**
   * Secure customer ticket lookup enforcing service-level ownership checks (IDOR protection).
   */
  getTicketByIdForCustomer(ticketId: string): SupportTicket | undefined {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) return undefined;
    const isOwner =
      authService.validateOwnership(ticket.customerId) ||
      authService.validateOwnership(ticket.customerPhone);
    if (!isOwner) return undefined;
    return ticket;
  }

  createTicket(payload: {
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    subject: string;
    category: SupportCategory;
    priority?: SupportPriority;
    orderId?: string;
    orderNumber?: string;
    returnId?: string;
    exchangeId?: string;
    productId?: string;
    productTitle?: string;
    message: string;
    attachments?: SupportAttachment[];
  }): SupportTicket {
    const tickets = this.readStoredTickets();
    const ticketNum = `${1001 + tickets.length}`;
    const ticketId = `ticket-${ticketNum}`;
    const nowFa = formatNowFa();

    const customerId = payload.customerId || "cust-current";
    const customerName = payload.customerName || "کاربر گرامی";
    const customerPhone = payload.customerPhone || "09120000000";

    const newTicket: SupportTicket = {
      id: ticketId,
      ticketNumber: ticketNum,
      customerId,
      customerName,
      customerPhone,
      subject: payload.subject,
      category: payload.category,
      status: "new",
      priority: payload.priority || "normal",
      orderId: payload.orderId,
      orderNumber: payload.orderNumber,
      returnId: payload.returnId,
      exchangeId: payload.exchangeId,
      productId: payload.productId,
      productTitle: payload.productTitle,
      createdAt: nowFa,
      updatedAt: nowFa,
      lastMessageAt: nowFa,
      lastMessageSender: "customer",
      unreadForAdmin: true,
      unreadForCustomer: false,
    };

    // 1. Save customer initial message
    const initialMsg: SupportMessage = {
      id: `msg-${Date.now()}-1`,
      ticketId,
      senderType: "customer",
      senderId: customerId,
      senderName: customerName,
      type: "message",
      body: payload.message,
      attachments: payload.attachments,
      createdAt: nowFa,
    };

    // 2. Save automatic system reply acknowledgment
    const autoReplyMsg: SupportMessage = {
      id: `msg-${Date.now()}-2`,
      ticketId,
      senderType: "system",
      senderName: "سیستم پشتیبانی",
      type: "automatic",
      body: AUTOMATIC_RESPONSE_TEMPLATE,
      createdAt: nowFa,
    };

    // Store messages
    const allMessages = this.readStoredMessages();
    allMessages[ticketId] = [initialMsg, autoReplyMsg];
    this.persistMessages(allMessages);

    // 3. Record activities
    const allActivities = this.readStoredActivities();
    const newActivities: SupportActivity[] = [
      {
        id: `act-${Date.now()}-1`,
        ticketId,
        type: "created",
        actorType: "customer",
        actorId: customerId,
        actorName: customerName,
        createdAt: nowFa,
      },
      {
        id: `act-${Date.now()}-2`,
        ticketId,
        type: "automated_reply",
        actorType: "system",
        actorName: "سیستم پشتیبانی",
        createdAt: nowFa,
      },
    ];

    allActivities[ticketId] = newActivities;
    this.persistActivities(allActivities);

    // Store ticket
    const updatedTickets = [newTicket, ...tickets];
    this.persistTickets(updatedTickets);

    return newTicket;
  }

  sendCustomerMessage(
    ticketId: string,
    text: string,
    attachments?: SupportAttachment[],
    customerName?: string
  ): SupportTicket {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) throw new Error("تیکت مورد نظر یافت نشد.");

    const nowFa = formatNowFa();
    const msgs = this.getMessages(ticket.id);

    const newMsg: SupportMessage = {
      id: `msg-${Date.now()}`,
      ticketId: ticket.id,
      senderType: "customer",
      senderId: ticket.customerId,
      senderName: customerName || ticket.customerName,
      type: "message",
      body: text,
      attachments,
      createdAt: nowFa,
    };

    // Save message
    const allMessages = this.readStoredMessages();
    allMessages[ticket.id] = [...msgs, newMsg];
    this.persistMessages(allMessages);

    // Update status logic
    let nextStatus: SupportTicketStatus = ticket.status;
    if (ticket.status === "resolved" || ticket.status === "closed") {
      nextStatus = "in_progress"; // Reopened by customer message
    } else if (ticket.status === "waiting_for_customer") {
      nextStatus = "in_progress";
    } else if (ticket.status === "replied") {
      nextStatus = "in_progress";
    }

    const updatedTickets = this.readStoredTickets().map((t) => {
      if (t.id === ticket.id) {
        return {
          ...t,
          status: nextStatus,
          updatedAt: nowFa,
          lastMessageAt: nowFa,
          lastMessageSender: "customer" as const,
          unreadForAdmin: true,
          unreadForCustomer: false,
          ...(ticket.status === "resolved" || ticket.status === "closed"
            ? { resolvedAt: undefined, closedAt: undefined }
            : {}),
        };
      }
      return t;
    });

    this.persistTickets(updatedTickets);

    // Record activity
    this.addActivity(ticket.id, {
      type: "customer_message",
      actorType: "customer",
      actorId: ticket.customerId,
      actorName: customerName || ticket.customerName,
    });

    return updatedTickets.find((t) => t.id === ticket.id)!;
  }

  sendAdminReply(
    ticketId: string,
    text: string,
    attachments?: SupportAttachment[],
    adminName = "پشتیبانی"
  ): SupportTicket {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) throw new Error("تیکت مورد نظر یافت نشد.");

    const nowFa = formatNowFa();
    const msgs = this.getMessages(ticket.id);

    const newMsg: SupportMessage = {
      id: `msg-${Date.now()}`,
      ticketId: ticket.id,
      senderType: "admin",
      senderName: adminName,
      type: "message",
      body: text,
      attachments,
      createdAt: nowFa,
    };

    const allMessages = this.readStoredMessages();
    allMessages[ticket.id] = [...msgs, newMsg];
    this.persistMessages(allMessages);

    const updatedTickets = this.readStoredTickets().map((t) => {
      if (t.id === ticket.id) {
        return {
          ...t,
          status: "replied" as const,
          firstResponseAt: t.firstResponseAt || nowFa,
          updatedAt: nowFa,
          lastMessageAt: nowFa,
          lastMessageSender: "admin" as const,
          unreadForAdmin: false,
          unreadForCustomer: true,
        };
      }
      return t;
    });

    this.persistTickets(updatedTickets);

    this.addActivity(ticket.id, {
      type: "admin_reply",
      actorType: "admin",
      actorName: adminName,
    });

    return updatedTickets.find((t) => t.id === ticket.id)!;
  }

  addInternalNote(
    ticketId: string,
    noteText: string,
    adminName = "پشتیبانی"
  ): SupportTicket {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) throw new Error("تیکت مورد نظر یافت نشد.");

    const nowFa = formatNowFa();
    const msgs = this.getMessages(ticket.id);

    const noteMsg: SupportMessage = {
      id: `msg-${Date.now()}`,
      ticketId: ticket.id,
      senderType: "admin",
      senderName: adminName,
      type: "internal_note",
      body: noteText,
      createdAt: nowFa,
    };

    const allMessages = this.readStoredMessages();
    allMessages[ticket.id] = [...msgs, noteMsg];
    this.persistMessages(allMessages);

    // Internal notes update updatedAt / lastMessageAt, but do NOT affect customer unread state or ticket status
    const updatedTickets = this.readStoredTickets().map((t) => {
      if (t.id === ticket.id) {
        return {
          ...t,
          updatedAt: nowFa,
          lastMessageAt: nowFa,
        };
      }
      return t;
    });

    this.persistTickets(updatedTickets);

    this.addActivity(ticket.id, {
      type: "internal_note_added",
      actorType: "admin",
      actorName: adminName,
    });

    return updatedTickets.find((t) => t.id === ticket.id)!;
  }

  updateTicketStatus(
    ticketId: string,
    newStatus: SupportTicketStatus,
    actorName = "ادمین"
  ): SupportTicket {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) throw new Error("تیکت مورد نظر یافت نشد.");

    const nowFa = formatNowFa();

    const updatedTickets = this.readStoredTickets().map((t) => {
      if (t.id === ticket.id) {
        return {
          ...t,
          status: newStatus,
          updatedAt: nowFa,
          resolvedAt: newStatus === "resolved" ? nowFa : t.resolvedAt,
          closedAt: newStatus === "closed" ? nowFa : t.closedAt,
        };
      }
      return t;
    });

    this.persistTickets(updatedTickets);

    this.addActivity(ticket.id, {
      type: "status_changed",
      actorType: "admin",
      actorName,
      metadata: { oldStatus: ticket.status, newStatus },
    });

    return updatedTickets.find((t) => t.id === ticket.id)!;
  }

  updateTicketPriority(
    ticketId: string,
    priority: SupportPriority,
    actorName = "ادمین"
  ): SupportTicket {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) throw new Error("تیکت مورد نظر یافت نشد.");

    const nowFa = formatNowFa();

    const updatedTickets = this.readStoredTickets().map((t) => {
      if (t.id === ticket.id) {
        return {
          ...t,
          priority,
          updatedAt: nowFa,
        };
      }
      return t;
    });

    this.persistTickets(updatedTickets);

    this.addActivity(ticket.id, {
      type: "priority_changed",
      actorType: "admin",
      actorName,
      metadata: { priority },
    });

    return updatedTickets.find((t) => t.id === ticket.id)!;
  }

  assignTicket(
    ticketId: string,
    assignedTo?: string,
    actorName = "ادمین"
  ): SupportTicket {
    const ticket = this.getTicketById(ticketId);
    if (!ticket) throw new Error("تیکت مورد نظر یافت نشد.");

    const nowFa = formatNowFa();

    const updatedTickets = this.readStoredTickets().map((t) => {
      if (t.id === ticket.id) {
        return {
          ...t,
          assignedTo,
          updatedAt: nowFa,
        };
      }
      return t;
    });

    this.persistTickets(updatedTickets);

    this.addActivity(ticket.id, {
      type: "assigned",
      actorType: "admin",
      actorName,
      metadata: { assignedTo },
    });

    return updatedTickets.find((t) => t.id === ticket.id)!;
  }

  reopenTicket(ticketId: string, actorName = "کاربر"): SupportTicket {
    return this.updateTicketStatus(ticketId, "in_progress", actorName);
  }

  resolveTicket(ticketId: string, actorName = "ادمین"): SupportTicket {
    return this.updateTicketStatus(ticketId, "resolved", actorName);
  }

  closeTicket(ticketId: string, actorName = "ادمین"): SupportTicket {
    return this.updateTicketStatus(ticketId, "closed", actorName);
  }

  markAsReadForAdmin(ticketId: string): void {
    const tickets = this.readStoredTickets();
    const updated = tickets.map((t) =>
      t.id === ticketId || t.ticketNumber === ticketId
        ? { ...t, unreadForAdmin: false }
        : t
    );
    this.persistTickets(updated);
  }

  markAsReadForCustomer(ticketId: string): void {
    const tickets = this.readStoredTickets();
    const updated = tickets.map((t) =>
      t.id === ticketId || t.ticketNumber === ticketId
        ? { ...t, unreadForCustomer: false }
        : t
    );
    this.persistTickets(updated);
  }

  /* ================= MESSAGES & ACTIVITIES ================= */

  getMessages(ticketId: string): SupportMessage[] {
    const all = this.readStoredMessages();
    const cleanId = ticketId.replace(/^#/, "").trim();
    const matchedTicket = this.getTicketById(cleanId);
    if (!matchedTicket) return [];
    return all[matchedTicket.id] || [];
  }

  getActivities(ticketId: string): SupportActivity[] {
    const all = this.readStoredActivities();
    const cleanId = ticketId.replace(/^#/, "").trim();
    const matchedTicket = this.getTicketById(cleanId);
    if (!matchedTicket) return [];
    return all[matchedTicket.id] || [];
  }

  private addActivity(
    ticketId: string,
    activity: Omit<SupportActivity, "id" | "ticketId" | "createdAt">
  ): void {
    const nowFa = formatNowFa();
    const all = this.readStoredActivities();
    const list = all[ticketId] || [];

    const newAct: SupportActivity = {
      ...activity,
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ticketId,
      createdAt: nowFa,
    };

    all[ticketId] = [...list, newAct];
    this.persistActivities(all);
  }

  /* ================= QUICK REPLIES ================= */

  getQuickReplies(category?: SupportCategory): QuickReply[] {
    const all = this.readStoredQuickReplies();
    const active = all.filter((qr) => qr.isActive);
    if (!category || category === "other") return active;
    return active.filter((qr) => !qr.category || qr.category === category || qr.category === "other");
  }

  getAllQuickReplies(): QuickReply[] {
    return this.readStoredQuickReplies();
  }

  createQuickReply(payload: {
    title: string;
    message: string;
    category?: SupportCategory;
  }): QuickReply {
    const all = this.readStoredQuickReplies();
    const nowFa = formatNowFa();

    const newQr: QuickReply = {
      id: `qr-${Date.now()}`,
      title: payload.title,
      message: payload.message,
      category: payload.category || "other",
      isActive: true,
      createdAt: nowFa,
      updatedAt: nowFa,
    };

    const updated = [newQr, ...all];
    this.persistQuickReplies(updated);
    return newQr;
  }

  updateQuickReply(
    id: string,
    payload: Partial<Omit<QuickReply, "id" | "createdAt">>
  ): QuickReply {
    const all = this.readStoredQuickReplies();
    const nowFa = formatNowFa();
    let updatedQr: QuickReply | undefined;

    const updated = all.map((qr) => {
      if (qr.id === id) {
        updatedQr = {
          ...qr,
          ...payload,
          updatedAt: nowFa,
        };
        return updatedQr;
      }
      return qr;
    });

    if (!updatedQr) throw new Error("پیام آماده مورد نظر یافت نشد.");

    this.persistQuickReplies(updated);
    return updatedQr;
  }

  toggleQuickReply(id: string): QuickReply {
    const all = this.readStoredQuickReplies();
    const target = all.find((qr) => qr.id === id);
    if (!target) throw new Error("پیام آماده مورد نظر یافت نشد.");
    return this.updateQuickReply(id, { isActive: !target.isActive });
  }

  deleteQuickReply(id: string): void {
    const all = this.readStoredQuickReplies();
    const updated = all.filter((qr) => qr.id !== id);
    this.persistQuickReplies(updated);
  }

  /* ================= STORAGE PERSISTENCE ================= */

  private readStoredTickets(isHydrated?: boolean): SupportTicket[] {
    return loadStorage<SupportTicket[]>(TICKETS_KEY, mockInitialTickets, isHydrated);
  }

  private persistTickets(tickets: SupportTicket[]): void {
    saveStorage(TICKETS_KEY, tickets);
  }

  private readStoredMessages(): Record<string, SupportMessage[]> {
    return loadStorage<Record<string, SupportMessage[]>>(
      MESSAGES_KEY,
      mockInitialMessages
    );
  }

  private persistMessages(msgs: Record<string, SupportMessage[]>): void {
    saveStorage(MESSAGES_KEY, msgs);
  }

  private readStoredActivities(): Record<string, SupportActivity[]> {
    return loadStorage<Record<string, SupportActivity[]>>(
      ACTIVITIES_KEY,
      mockInitialActivities
    );
  }

  private persistActivities(activities: Record<string, SupportActivity[]>): void {
    saveStorage(ACTIVITIES_KEY, activities);
  }

  private readStoredQuickReplies(): QuickReply[] {
    return loadStorage<QuickReply[]>(QUICK_REPLIES_KEY, mockInitialQuickReplies);
  }

  private persistQuickReplies(quickReplies: QuickReply[]): void {
    saveStorage(QUICK_REPLIES_KEY, quickReplies);
  }
}

export const supportService = new SupportService();
