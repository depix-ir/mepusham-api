"use client";

import React, { useState, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  SupportTicket,
  SupportMessage,
  SupportAttachment,
  supportCategoryLabels,
  supportStatusLabelsCustomer,
} from "@/types/support";
import { supportService } from "@/lib/support/supportService";
import { Order } from "@/types/account";
import { routes } from "@/lib/routes";
import {
  ArrowRight,
  Send,
  User,
  Headset,
  Bot,
  Paperclip,
  Image as ImageIcon,
  FileText,
  X,
  ExternalLink,
  Package,
  RotateCcw,
  RotateCw,
  Clock,
} from "lucide-react";

interface CustomerTicketDetailProps {
  ticket: SupportTicket;
  order?: Order;
}

export function CustomerTicketDetail({
  ticket: initialTicket,
  order,
}: CustomerTicketDetailProps) {
  const router = useRouter();
  const [ticket, setTicket] = useState<SupportTicket>(initialTicket);
  const [replyText, setReplyText] = useState("");
  const [attachments, setAttachments] = useState<SupportAttachment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all messages for ticket, filtering out internal notes completely for Customer
  const messages = useMemo(() => {
    const rawMsgs = supportService.getMessages(ticket.id);
    return rawMsgs.filter((m) => m.type !== "internal_note");
  }, [ticket.id, replyText]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: SupportAttachment[] = Array.from(files).map((file, idx) => ({
      id: `file-${Date.now()}-${idx}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() && attachments.length === 0) {
      setError("لطفاً متن پاسخ یا پیوست را وارد کنید.");
      return;
    }
    setError(null);

    const updated = supportService.sendCustomerMessage(
      ticket.id,
      replyText.trim(),
      attachments.length > 0 ? attachments : undefined
    );

    setTicket(updated);
    setReplyText("");
    setAttachments([]);
  };

  const handleReopen = () => {
    const updated = supportService.reopenTicket(ticket.id, "کاربر");
    setTicket(updated);
  };

  const getStatusBadgeClass = () => {
    switch (ticket.status) {
      case "new":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20";
      case "in_progress":
        return "bg-amber-500/10 text-amber-700 border-amber-500/20";
      case "waiting_for_customer":
        return "bg-rose-500/10 text-rose-700 border-rose-500/20 animate-pulse";
      case "replied":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
      case "resolved":
        return "bg-emerald-500/10 text-emerald-800 border-emerald-500/20";
      case "closed":
      default:
        return "bg-surface-subtle text-muted-foreground border-border-subtle";
    }
  };

  return (
    <div className="bg-surface border border-border rounded-2xl flex flex-col h-[650px] max-h-[85vh] overflow-hidden shadow-2xs max-w-4xl mx-auto">
      {/* Top Header Bar */}
      <div className="p-3.5 sm:p-4 border-b border-border bg-surface-subtle/60 shrink-0 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => router.push("/account/support")}
              className="w-8 h-8 rounded-xl bg-surface border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
              title="بازگشت به فهرست تیکت‌ها"
            >
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono font-bold text-muted-foreground" dir="ltr">
                  #{ticket.ticketNumber}
                </span>
                <span className="px-2 py-0.5 rounded bg-surface border border-border text-[10px] font-bold text-foreground">
                  {supportCategoryLabels[ticket.category]}
                </span>
                <h1 className="text-xs sm:text-base font-bold text-foreground truncate max-w-[200px] sm:max-w-md">
                  {ticket.subject}
                </h1>
              </div>
            </div>
          </div>

          <span
            className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${getStatusBadgeClass()}`}
          >
            {supportStatusLabelsCustomer[ticket.status]}
          </span>
        </div>

        {/* Relation Info Links if present */}
        {(ticket.orderNumber || ticket.returnId || order) && (
          <div className="flex flex-wrap items-center gap-2 text-[11px] pt-1">
            {ticket.orderNumber && (
              <Link
                href={routes.account.orders.detail(ticket.orderId || ticket.orderNumber!)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface border border-border hover:border-primary text-foreground hover:text-primary transition-colors font-mono"
              >
                <Package className="w-3 h-3 text-primary" />
                <span>مشاهده سفارش #{ticket.orderNumber}</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </Link>
            )}

            {ticket.returnId && (
              <Link
                href={routes.account.returns.detail(ticket.returnId)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface border border-border hover:border-primary text-foreground hover:text-primary transition-colors font-mono"
              >
                <RotateCcw className="w-3 h-3 text-amber-600" />
                <span>مشاهده مرجوعی #{ticket.returnId}</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Messages Thread */}
      <div className="flex-1 p-3.5 sm:p-5 overflow-y-auto space-y-4 bg-surface-subtle/30">
        {messages.map((msg: SupportMessage) => {
          if (msg.type === "automatic") {
            // Automated System Acknowledgment Card
            return (
              <div key={msg.id} className="my-2 max-w-xl mx-auto text-center">
                <div className="bg-surface border border-border/80 rounded-2xl p-3.5 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-primary">
                    <Bot className="w-3.5 h-3.5" />
                    <span>پیام خودکار سیستم پشتیبانی</span>
                    <span className="text-[10px] font-mono text-muted-foreground mr-1" dir="ltr">
                      ({msg.createdAt})
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {msg.body}
                  </p>
                </div>
              </div>
            );
          }

          const isCustomer = msg.senderType === "customer";

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 items-end ${isCustomer ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mb-1 ${
                  isCustomer
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface border border-border text-foreground shadow-2xs"
                }`}
              >
                {isCustomer ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Headset className="w-4 h-4 text-primary" />
                )}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs sm:text-sm space-y-1.5 ${
                  isCustomer
                    ? "bg-primary text-primary-foreground rounded-bl-xs shadow-2xs"
                    : "bg-surface border border-border text-foreground rounded-br-xs shadow-2xs"
                }`}
              >
                <div
                  className={`flex items-center justify-between gap-3 text-[10px] pb-1 border-b ${
                    isCustomer
                      ? "border-white/20 text-primary-foreground/80"
                      : "border-border-subtle text-muted-foreground"
                  }`}
                >
                  <span className="font-bold">
                    {isCustomer ? "شما" : msg.senderName || "پشتیبانی مپوشــــم"}
                  </span>
                  <span dir="ltr">{msg.createdAt}</span>
                </div>

                <p className="leading-relaxed whitespace-pre-wrap text-xs sm:text-sm pt-0.5">
                  {msg.body}
                </p>

                {/* Attachments */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div
                    className={`pt-2 border-t space-y-1 ${
                      isCustomer ? "border-white/20" : "border-border-subtle"
                    }`}
                  >
                    <span className="text-[10px] font-bold opacity-80 block">
                      پیوست‌ها:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.attachments.map((att) => (
                        <a
                          key={att.id}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] sm:text-[11px] font-medium transition-opacity ${
                            isCustomer
                              ? "bg-white/20 text-white hover:bg-white/30"
                              : "bg-surface-subtle text-foreground hover:bg-surface-muted"
                          }`}
                        >
                          {att.type.startsWith("image/") ? (
                            <ImageIcon className="w-3 h-3" />
                          ) : (
                            <FileText className="w-3 h-3" />
                          )}
                          <span className="truncate max-w-[110px] font-mono">
                            {att.name}
                          </span>
                          <ExternalLink className="w-3 h-3 opacity-70" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply Section */}
      <div className="p-3 border-t border-border bg-surface shrink-0 space-y-2">
        {ticket.status === "closed" ? (
          <div className="p-3 bg-surface-subtle border border-border rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>این تیکت توسط پشتیبانی بسته شده است.</span>
            </div>
            <button
              type="button"
              onClick={handleReopen}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary-hover transition-colors cursor-pointer shrink-0"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>باز کردن مجدد تیکت</span>
            </button>
          </div>
        ) : (
          <>
            {/* Attachment Preview */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-1">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="px-2 py-1 bg-surface-subtle border border-border rounded-lg flex items-center gap-1.5 text-[10px] text-foreground"
                  >
                    <Paperclip className="w-3 h-3 text-primary shrink-0" />
                    <span className="truncate max-w-[90px] font-mono">{att.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="text-muted-foreground hover:text-error cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSend} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept="image/*,.pdf"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 rounded-xl bg-surface-subtle border border-border hover:border-primary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors cursor-pointer shrink-0"
                  title="پیوست عکس یا فایل"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => {
                    setReplyText(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="پاسخ خود را بنویسید..."
                  className="flex-1 h-10 bg-surface-subtle border border-border rounded-xl px-3 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                />

                <button
                  type="submit"
                  className="h-10 px-4 bg-primary text-primary-foreground font-bold text-xs rounded-xl flex items-center gap-1 hover:bg-primary-hover transition-colors shrink-0 cursor-pointer shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ارسال</span>
                </button>
              </div>
              {error && <p className="text-[11px] text-error pr-1">{error}</p>}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
