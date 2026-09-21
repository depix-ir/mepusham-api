"use client";

import React, { useState, useRef } from "react";
import { SupportTicket, ticketStatusLabels, TicketAttachment } from "@/types/account";
import { Button } from "@/components/ui/Button";
import {
  ArrowRight,
  Send,
  User,
  Headset,
  Paperclip,
  Image as ImageIcon,
  FileText,
  X,
  ExternalLink,
} from "lucide-react";

interface TicketDetailViewProps {
  ticket: SupportTicket;
  onBack: () => void;
  onSendMessage: (ticketId: string, messageText: string, attachments?: TicketAttachment[]) => void;
}

export function TicketDetailView({ ticket, onBack, onSendMessage }: TicketDetailViewProps) {
  const [replyText, setReplyText] = useState("");
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: TicketAttachment[] = Array.from(files).map((file, idx) => ({
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
      setError("لطفاً متن پاسخ یا پیوست فایل را وارد کنید.");
      return;
    }
    setError(null);
    onSendMessage(
      ticket.id,
      replyText.trim(),
      attachments.length > 0 ? attachments : undefined
    );
    setReplyText("");
    setAttachments([]);
  };

  const getStatusBadgeClass = () => {
    switch (ticket.status) {
      case "waiting-user":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
      case "waiting-support":
        return "bg-amber-500/10 text-amber-700 border-amber-500/20";
      case "open":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20";
      case "closed":
        return "bg-surface-subtle text-muted-foreground border-border-subtle";
      default:
        return "bg-surface-subtle text-foreground border-border-subtle";
    }
  };

  return (
    <div className="bg-surface border border-border rounded-2xl flex flex-col h-[520px] sm:h-[600px] max-h-[82vh] overflow-hidden shadow-sm animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-border bg-surface-subtle/60 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-xl bg-surface border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
            title="بازگشت به فهرست"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-muted-foreground font-mono font-bold" dir="ltr">
                #{ticket.ticketNumber}
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-foreground truncate max-w-[180px] sm:max-w-md">
                {ticket.subject}
              </h3>
            </div>
            {ticket.orderNumber && (
              <span className="text-[10px] text-muted-foreground block truncate">
                سفارش <strong className="text-foreground font-mono" dir="ltr">#{ticket.orderNumber}</strong>
              </span>
            )}
          </div>
        </div>

        <span
          className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${getStatusBadgeClass()}`}
        >
          {ticketStatusLabels[ticket.status]}
        </span>
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-3.5 bg-surface-subtle/30">
        {ticket.messages.map((msg) => {
          const isUser = msg.sender === "user";

          return (
            <div
              key={msg.id}
              className={`flex gap-2 items-end ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mb-1 ${
                  isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface border border-border text-foreground"
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Headset className="w-3.5 h-3.5 text-primary" />}
              </div>

              <div
                className={`max-w-[88%] sm:max-w-[78%] rounded-2xl p-3 sm:p-4 text-xs sm:text-sm space-y-1.5 ${
                  isUser
                    ? "bg-primary text-primary-foreground rounded-bl-xs shadow-2xs"
                    : "bg-surface border border-border text-foreground rounded-br-xs shadow-2xs"
                }`}
              >
                <div className={`flex items-center justify-between gap-3 text-[10px] pb-1 border-b ${
                  isUser ? "border-white/15 text-primary-foreground/80" : "border-border-subtle text-muted-foreground"
                }`}>
                  <span className="font-bold">{isUser ? "شما" : "پشتیبانی مپوشــــم"}</span>
                  <span dir="ltr">{msg.createdAt}</span>
                </div>

                <p className="leading-relaxed whitespace-pre-wrap text-xs sm:text-sm pt-0.5">{msg.text}</p>

                {/* Message Attachments */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className={`pt-2 border-t space-y-1 ${
                    isUser ? "border-white/15" : "border-border-subtle"
                  }`}>
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
                            isUser
                              ? "bg-white/20 text-white hover:bg-white/30"
                              : "bg-surface-subtle text-foreground hover:bg-surface-muted"
                          }`}
                        >
                          {att.type.startsWith("image/") ? (
                            <ImageIcon className="w-3 h-3" />
                          ) : (
                            <FileText className="w-3 h-3" />
                          )}
                          <span className="truncate max-w-[100px] font-mono">
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

      {/* Reply Bar */}
      <div className="p-2.5 sm:p-3 border-t border-border bg-surface shrink-0 space-y-2">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-1">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="px-2 py-1 bg-surface-subtle border border-border rounded-lg flex items-center gap-1.5 text-[10px] sm:text-[11px] text-foreground"
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
          <div className="flex items-center gap-1.5">
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
              className="flex-1 h-10 bg-surface-subtle border border-border rounded-xl px-3 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary focus:bg-background transition-colors"
            />

            <button
              type="submit"
              className="h-10 px-3.5 sm:px-4 bg-primary text-primary-foreground font-bold text-xs rounded-xl flex items-center gap-1 hover:bg-primary-hover transition-colors shrink-0 cursor-pointer shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ارسال</span>
            </button>
          </div>
          {error && <p className="text-[11px] text-error pr-1">{error}</p>}
        </form>
      </div>
    </div>
  );
}
