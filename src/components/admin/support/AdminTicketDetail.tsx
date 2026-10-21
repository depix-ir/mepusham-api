"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  SupportTicket,
  SupportMessage,
  SupportActivity,
  SupportTicketStatus,
  SupportPriority,
  SupportAttachment,
  QuickReply,
  supportCategoryLabels,
  supportStatusLabelsAdmin,
  supportPriorityLabels,
} from "@/types/support";
import { supportService } from "@/lib/support/supportService";
import { accountService } from "@/lib/account/accountService";
import { returnService } from "@/lib/returns/returnService";
import { Order } from "@/types/account";
import { ReturnRequest } from "@/types/return";
import { routes } from "@/lib/routes";
import { QuickReplySelectorModal } from "./QuickReplySelectorModal";
import { ManageQuickRepliesModal } from "./ManageQuickRepliesModal";
import {
  ArrowRight,
  Send,
  User,
  Headset,
  Bot,
  Lock,
  Zap,
  Paperclip,
  Image as ImageIcon,
  FileText,
  X,
  ExternalLink,
  Package,
  RotateCcw,
  CheckCircle2,
  Clock,
  Shield,
  UserCheck,
  History,
} from "lucide-react";

interface AdminTicketDetailProps {
  ticket: SupportTicket;
}

export function AdminTicketDetail({ ticket: initialTicket }: AdminTicketDetailProps) {
  const router = useRouter();

  const [ticket, setTicket] = useState<SupportTicket>(initialTicket);
  const [composerMode, setComposerMode] = useState<"reply" | "note">("reply");
  const [replyText, setReplyText] = useState("");
  const [attachments, setAttachments] = useState<SupportAttachment[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isQuickReplyOpen, setIsQuickReplyOpen] = useState(false);
  const [isManageQuickRepliesOpen, setIsManageQuickRepliesOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load latest messages & activities from service
  const messages = supportService.getMessages(ticket.id);
  const activities = supportService.getActivities(ticket.id);
  const quickReplies = supportService.getQuickReplies(ticket.category);

  // Load related domain entities
  const relatedOrder: Order | undefined = ticket.orderId || ticket.orderNumber
    ? accountService.getOrderById(ticket.orderId || ticket.orderNumber!)
    : undefined;

  let relatedReturn: ReturnRequest | undefined = undefined;
  if (ticket.returnId) {
    try {
      relatedReturn = returnService.getReturnRequestById(ticket.returnId);
    } catch {
      relatedReturn = undefined;
    }
  }

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
      setError("لطفاً متن پاسخ یا فایل پیوست را وارد کنید.");
      return;
    }
    setError(null);

    let updated: SupportTicket;
    if (composerMode === "reply") {
      updated = supportService.sendAdminReply(
        ticket.id,
        replyText.trim(),
        attachments.length > 0 ? attachments : undefined,
        "پشتیبانی مپوشــــم"
      );
    } else {
      updated = supportService.addInternalNote(
        ticket.id,
        replyText.trim(),
        "ادمین (یادداشت)"
      );
    }

    setTicket(updated);
    setReplyText("");
    setAttachments([]);
  };

  const handleStatusChange = (newStatus: SupportTicketStatus) => {
    const updated = supportService.updateTicketStatus(ticket.id, newStatus, "ادمین");
    setTicket(updated);
  };

  const handlePriorityChange = (newPriority: SupportPriority) => {
    const updated = supportService.updateTicketPriority(ticket.id, newPriority, "ادمین");
    setTicket(updated);
  };

  const handleAssignChange = (assignee: string) => {
    const updated = supportService.assignTicket(
      ticket.id,
      assignee === "unassigned" ? undefined : assignee,
      "ادمین"
    );
    setTicket(updated);
  };

  const getStatusBadgeClass = (status: SupportTicketStatus) => {
    switch (status) {
      case "new":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20";
      case "in_progress":
        return "bg-amber-500/10 text-amber-700 border-amber-500/20";
      case "waiting_for_customer":
        return "bg-purple-500/10 text-purple-700 border-purple-500/20";
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
    <div className="space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between bg-surface border border-border rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/support")}
            className="w-9 h-9 rounded-xl bg-surface-subtle border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="بازگشت به لیست تیکت‌ها"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-muted-foreground" dir="ltr">
                #{ticket.ticketNumber}
              </span>
              <span className="px-2 py-0.5 rounded bg-surface-subtle border border-border text-[10px] font-bold text-foreground">
                {supportCategoryLabels[ticket.category]}
              </span>
              <h1 className="text-sm sm:text-lg font-bold text-foreground truncate max-w-md">
                {ticket.subject}
              </h1>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              مشتری: <strong>{ticket.customerName}</strong> ({ticket.customerPhone})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusBadgeClass(
              ticket.status
            )}`}
          >
            {supportStatusLabelsAdmin[ticket.status]}
          </span>
        </div>
      </div>

      {/* Main Grid Layout (2-Column Desktop / Stacked Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Conversation & Composer) - 2 Cols */}
        <div className="lg:col-span-2 space-y-4">
          {/* Conversation Thread Box */}
          <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col h-[520px] shadow-2xs overflow-hidden">
            <div className="pb-3 border-b border-border flex items-center justify-between text-xs text-muted-foreground shrink-0">
              <span className="font-bold text-foreground">تاریخچه گفتگو</span>
              <span>{messages.length} پیام ثبت شده</span>
            </div>

            {/* Thread Container */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 pl-1">
              {messages.map((msg: SupportMessage) => {
                if (msg.type === "automatic") {
                  return (
                    <div key={msg.id} className="my-2 max-w-md mx-auto text-center">
                      <div className="bg-surface-subtle border border-border rounded-2xl p-3 space-y-1">
                        <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-primary">
                          <Bot className="w-3.5 h-3.5" />
                          <span>پاسخ خودکار سیستم به مشتری</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {msg.body}
                        </p>
                      </div>
                    </div>
                  );
                }

                if (msg.type === "internal_note") {
                  // Internal Note Styling (Highlight Amber / Shield icon)
                  return (
                    <div key={msg.id} className="my-2 max-w-lg mx-auto">
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between text-amber-800 text-[11px] pb-1 border-b border-amber-500/20 font-bold">
                          <span className="flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5" />
                            <span>یادداشت داخلی ادمین ({msg.senderName})</span>
                          </span>
                          <span dir="ltr" className="font-mono text-[10px] font-normal">
                            {msg.createdAt}
                          </span>
                        </div>
                        <p className="text-xs text-amber-950 whitespace-pre-wrap leading-relaxed">
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
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm space-y-1.5 ${
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
                          {isCustomer ? `مشتری (${msg.senderName})` : msg.senderName || "پشتیبانی"}
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
          </div>

          {/* Composer Card */}
          <div className="bg-surface border border-border rounded-2xl p-4 space-y-3 shadow-2xs">
            {/* Mode Selector Tabs & Quick Reply Trigger */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div className="flex items-center gap-1.5 bg-surface-subtle p-1 rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() => setComposerMode("reply")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    composerMode === "reply"
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  پاسخ به مشتری
                </button>
                <button
                  type="button"
                  onClick={() => setComposerMode("note")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    composerMode === "note"
                      ? "bg-amber-600 text-white shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Lock className="w-3 h-3" />
                  <span>یادداشت داخلی</span>
                </button>
              </div>

              {/* Quick Reply Button */}
              {composerMode === "reply" && (
                <button
                  type="button"
                  onClick={() => setIsQuickReplyOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 text-xs font-bold transition-colors cursor-pointer border border-amber-500/20"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>پیام‌های آماده (Quick Reply)</span>
                </button>
              )}
            </div>

            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="px-2.5 py-1 bg-surface-subtle border border-border rounded-lg flex items-center gap-1.5 text-xs text-foreground"
                  >
                    <Paperclip className="w-3 h-3 text-primary shrink-0" />
                    <span className="truncate max-w-[120px] font-mono text-[11px]">
                      {att.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="text-muted-foreground hover:text-error cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Textarea Form */}
            <form onSubmit={handleSend} className="space-y-3">
              <textarea
                rows={3}
                value={replyText}
                onChange={(e) => {
                  setReplyText(e.target.value);
                  if (error) setError(null);
                }}
                placeholder={
                  composerMode === "reply"
                    ? "پاسخ خود را برای مشتری بنویسید..."
                    : "یادداشت داخلی بنویسید (این متن فقط برای همکاران و ادمین‌ها قابل مشاهده است)..."
                }
                className={`w-full p-3 text-xs sm:text-sm rounded-xl border focus:outline-none focus:border-primary transition-colors ${
                  composerMode === "note"
                    ? "bg-amber-500/5 border-amber-500/30 text-amber-950 placeholder:text-amber-900/60"
                    : "bg-surface-subtle border-border text-foreground"
                }`}
              />

              {error && <p className="text-[11px] text-error">{error}</p>}

              <div className="flex items-center justify-between">
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
                    className="h-9 px-3 rounded-xl bg-surface-subtle border border-border hover:border-primary text-xs font-medium text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>پیوست فایل</span>
                  </button>
                </div>

                <button
                  type="submit"
                  className={`h-9 px-5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer ${
                    composerMode === "reply"
                      ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                      : "bg-amber-600 text-white hover:bg-amber-700"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {composerMode === "reply" ? "ارسال پاسخ" : "ثبت یادداشت داخلی"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Sidebar Column (Info & Actions) - 1 Col */}
        <div className="space-y-4">
          {/* Customer Info Card */}
          <div className="bg-surface border border-border rounded-2xl p-4 space-y-3 shadow-2xs">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 pb-2 border-b border-border">
              <User className="w-4 h-4 text-primary" />
              <span>اطلاعات مشتری</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">نام مشتری:</span>
                <span className="font-bold text-foreground">{ticket.customerName}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">شماره تماس:</span>
                <span className="font-mono text-foreground font-bold" dir="ltr">
                  {ticket.customerPhone}
                </span>
              </div>

              <div className="pt-2 border-t border-border">
                <Link
                  href="/admin/orders"
                  className="w-full py-2 rounded-xl bg-surface-subtle border border-border hover:border-primary text-xs font-bold text-foreground hover:text-primary flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>مشاهده سفارش‌های مشتری</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Ticket Metadata Controls */}
          <div className="bg-surface border border-border rounded-2xl p-4 space-y-4 shadow-2xs">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 pb-2 border-b border-border">
              <Shield className="w-4 h-4 text-primary" />
              <span>مدیریت تیکت</span>
            </h3>

            {/* Status Control */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-foreground">تغییر وضعیت</label>
              <select
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value as SupportTicketStatus)}
                className="w-full h-10 bg-surface-subtle border border-border rounded-xl px-3 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer font-bold"
              >
                {(Object.keys(supportStatusLabelsAdmin) as SupportTicketStatus[]).map((st) => (
                  <option key={st} value={st}>
                    {supportStatusLabelsAdmin[st]}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Control */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-foreground">اولویت تیکت</label>
              <select
                value={ticket.priority}
                onChange={(e) => handlePriorityChange(e.target.value as SupportPriority)}
                className="w-full h-10 bg-surface-subtle border border-border rounded-xl px-3 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer"
              >
                {(Object.keys(supportPriorityLabels) as SupportPriority[]).map((pr) => (
                  <option key={pr} value={pr}>
                    {supportPriorityLabels[pr]}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignment Control */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-foreground">مسئول تیکت</label>
              <select
                value={ticket.assignedTo || "unassigned"}
                onChange={(e) => handleAssignChange(e.target.value)}
                className="w-full h-10 bg-surface-subtle border border-border rounded-xl px-3 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="unassigned">اختصاص داده نشده</option>
                <option value="پشتیبانی ۱ (رضا)">پشتیبانی ۱ (رضا)</option>
                <option value="پشتیبانی ۲ (مریم)">پشتیبانی ۲ (مریم)</option>
                <option value="مدیریت پشتیبانی">مدیریت پشتیبانی</option>
              </select>
            </div>
          </div>

          {/* Related Order Card if present */}
          {relatedOrder && (
            <div className="bg-surface border border-border rounded-2xl p-4 space-y-3 shadow-2xs">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 pb-2 border-b border-border">
                <Package className="w-4 h-4 text-primary" />
                <span>سفارش مرتبط</span>
              </h3>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-mono font-bold text-foreground">
                  <span>شماره سفارش:</span>
                  <span>#{relatedOrder.orderNumber}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>مبلغ پرداختی:</span>
                  <span className="font-bold text-foreground">
                    {relatedOrder.payableTotal.toLocaleString("fa-IR")} تومان
                  </span>
                </div>

                <Link
                  href="/admin/orders"
                  className="w-full py-2 mt-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>مشاهده جزئیات سفارش</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Related Return Card if present */}
          {relatedReturn && (
            <div className="bg-surface border border-border rounded-2xl p-4 space-y-3 shadow-2xs">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 pb-2 border-b border-border">
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span>درخواست مرجوعی مرتبط</span>
              </h3>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-mono font-bold text-foreground">
                  <span>کد مرجوعی:</span>
                  <span>#{relatedReturn.id}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>نوع درخواست:</span>
                  <span>مرجوعی</span>
                </div>

                <Link
                  href={routes.admin.returnsDetail(relatedReturn.id)}
                  className="w-full py-2 mt-2 rounded-xl bg-amber-500/10 text-amber-800 hover:bg-amber-500 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>مشاهده درخواست مرجوعی</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Activity / Audit Log Panel */}
          <div className="bg-surface border border-border rounded-2xl p-4 space-y-3 shadow-2xs">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5 pb-2 border-b border-border">
              <History className="w-4 h-4 text-primary" />
              <span>تاریخچه فعالیت‌ها (Activity Log)</span>
            </h3>

            <div className="space-y-2.5 text-[11px] max-h-48 overflow-y-auto">
              {activities.length > 0 ? (
                activities.map((act: SupportActivity) => (
                  <div key={act.id} className="border-b border-border-subtle pb-2 last:border-0 last:pb-0 space-y-0.5">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="font-bold text-foreground">{act.actorName || act.actorType}</span>
                      <span dir="ltr" className="font-mono text-[10px]">{act.createdAt}</span>
                    </div>
                    <p className="text-muted-foreground">
                      {act.type === "created" && "تیکت ایجاد شد."}
                      {act.type === "automated_reply" && "پاسخ خودکار سیستم ارسال شد."}
                      {act.type === "status_changed" && `وضعیت تغییر کرد به: ${supportStatusLabelsAdmin[(act.metadata?.newStatus as SupportTicketStatus) || "in_progress"]}`}
                      {act.type === "priority_changed" && `اولویت تغییر کرد به: ${supportPriorityLabels[(act.metadata?.priority as SupportPriority) || "normal"]}`}
                      {act.type === "assigned" && `تیکت به ${act.metadata?.assignedTo || "تخصیص‌نیافته"} اختصاص داده شد.`}
                      {act.type === "internal_note_added" && "یادداشت داخلی جدید ثبت شد."}
                      {act.type === "admin_reply" && "پاسخ جدید ادمین ارسال شد."}
                      {act.type === "customer_message" && "پیام جدید مشتری دریافت شد."}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground text-[11px]">فعالیتی ثبت نشده است.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Reply Selector Modal */}
      <QuickReplySelectorModal
        isOpen={isQuickReplyOpen}
        onClose={() => setIsQuickReplyOpen(false)}
        quickReplies={quickReplies}
        onSelectQuickReply={(msgText) => {
          setReplyText((prev) => (prev ? `${prev}\n${msgText}` : msgText));
        }}
        onOpenManageModal={() => setIsManageQuickRepliesOpen(true)}
      />

      {/* Manage Quick Replies Modal */}
      <ManageQuickRepliesModal
        isOpen={isManageQuickRepliesOpen}
        onClose={() => setIsManageQuickRepliesOpen(false)}
        onUpdated={() => {
          // Re-render
        }}
      />
    </div>
  );
}
