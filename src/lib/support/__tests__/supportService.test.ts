import { describe, expect, test, beforeEach } from "bun:test";
import { supportService } from "../supportService";
import { AUTOMATIC_RESPONSE_TEMPLATE } from "@/data/mockSupportData";

describe("Support Service Logic", () => {
  beforeEach(() => {
    // Clear localStorage for deterministic isolated test environment
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  });

  test("createTicket creates customer message and automatic system acknowledgment reply", () => {
    const created = supportService.createTicket({
      subject: "تست بررسی تاخیر ارسال",
      category: "shipping",
      message: "سلام ارسال سفارشم دیر شده است.",
      orderId: "order-12458",
      orderNumber: "12458",
    });

    expect(created.id).toBeDefined();
    expect(created.status).toBe("new");
    expect(created.unreadForAdmin).toBe(true);

    const msgs = supportService.getMessages(created.id);
    expect(msgs.length).toBe(2);

    // 1st message: customer
    expect(msgs[0].senderType).toBe("customer");
    expect(msgs[0].type).toBe("message");
    expect(msgs[0].body).toBe("سلام ارسال سفارشم دیر شده است.");

    // 2nd message: automated system reply
    expect(msgs[1].senderType).toBe("system");
    expect(msgs[1].type).toBe("automatic");
    expect(msgs[1].body).toBe(AUTOMATIC_RESPONSE_TEMPLATE);

    // Status MUST remain 'new', NOT 'replied'
    const fetched = supportService.getTicketById(created.id);
    expect(fetched?.status).toBe("new");
  });

  test("customer sending a message reopens resolved or closed tickets", () => {
    const ticket = supportService.createTicket({
      subject: "تست ری‌اوپن",
      category: "other",
      message: "یک مسئله اولیه",
    });

    // Mark as resolved
    supportService.resolveTicket(ticket.id);
    expect(supportService.getTicketById(ticket.id)?.status).toBe("resolved");

    // Customer sends message
    const updated = supportService.sendCustomerMessage(
      ticket.id,
      "هنوز مشکلم کاملاً حل نشده است."
    );

    expect(updated.status).toBe("in_progress");
    expect(updated.unreadForAdmin).toBe(true);
    expect(updated.lastMessageSender).toBe("customer");
  });

  test("admin reply sets status to 'replied' and records firstResponseAt", () => {
    const ticket = supportService.createTicket({
      subject: "تست پاسخ ادمین",
      category: "payment",
      message: "مشکل درگاه بانکی",
    });

    expect(ticket.firstResponseAt).toBeUndefined();

    const repliedTicket = supportService.sendAdminReply(
      ticket.id,
      "موضوع بررسی شد و تراکنش موفق بود.",
      undefined,
      "پشتیبانی ۱"
    );

    expect(repliedTicket.status).toBe("replied");
    expect(repliedTicket.firstResponseAt).toBeDefined();
    expect(repliedTicket.unreadForCustomer).toBe(true);
    expect(repliedTicket.unreadForAdmin).toBe(false);

    const msgs = supportService.getMessages(ticket.id);
    const lastMsg = msgs[msgs.length - 1];
    expect(lastMsg.senderType).toBe("admin");
    expect(lastMsg.type).toBe("message");
  });

  test("internal notes are saved with type 'internal_note' and do not alert customer", () => {
    const ticket = supportService.createTicket({
      subject: "تست یادداشت داخلی",
      category: "return",
      message: "درخواست مرجوعی",
    });

    const updated = supportService.addInternalNote(
      ticket.id,
      "قبل از تایید انبار عکس کالا بررسی شود.",
      "رضا"
    );

    // Status remains new
    expect(updated.status).toBe("new");
    expect(updated.unreadForCustomer).toBe(false);

    const msgs = supportService.getMessages(ticket.id);
    const noteMsg = msgs.find((m) => m.type === "internal_note");
    expect(noteMsg).toBeDefined();
    expect(noteMsg?.senderType).toBe("admin");
    expect(noteMsg?.body).toBe("قبل از تایید انبار عکس کالا بررسی شود.");
  });

  test("Quick replies CRUD works correctly", () => {
    const initialQuickReplies = supportService.getQuickReplies();
    expect(initialQuickReplies.length).toBeGreaterThan(0);

    const createdQr = supportService.createQuickReply({
      title: "پاسخ جدید تست",
      message: "این یک متن تست است.",
      category: "shipping",
    });

    expect(createdQr.id).toBeDefined();
    expect(createdQr.isActive).toBe(true);

    const updatedQr = supportService.toggleQuickReply(createdQr.id);
    expect(updatedQr.isActive).toBe(false);
  });

  test("filtering tickets by status, priority, and search query", () => {
    const all = supportService.getTickets();
    expect(all.length).toBeGreaterThan(0);

    const urgentTickets = supportService.getTickets({ priority: "urgent" });
    expect(urgentTickets.every((t) => t.priority === "urgent")).toBe(true);

    const searchResults = supportService.getTickets({ search: "12458" });
    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults.some((t) => t.orderNumber === "12458")).toBe(true);
  });
});
