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
    <div className="bg-surface border border-border rounded-2xl flex flex-col h-[650px] max-h-[80vh] overflow-hidden animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-surface-subtle/50 shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono" dir="ltr">
                #{ticket.ticketNumber}
              </span>
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                {ticket.subject}
              </h3>
            </div>
            {ticket.orderNumber && (
              <span className="text-[11px] text-muted-foreground block">
                مربوط به سفارش <strong className="text-foreground" dir="ltr">#{ticket.orderNumber}</strong>
              </span>
            )}
          </div>
        </div>

        <span
          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadgeClass()}`}
        >
          {ticketStatusLabels[ticket.status]}
        </span>
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-surface-subtle/20">
        {ticket.messages.map((msg) => {
          const isUser = msg.sender === "user";

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface border border-border text-foreground"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Headset className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm space-y-2 ${
                  isUser
                    ? "bg-primary text-primary-foreground rounded-tl-none shadow-2xs"
                    : "bg-surface border border-border text-foreground rounded-tr-none shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] opacity-80 pb-1 border-b border-white/10">
                  <span className="font-bold">{isUser ? "شما" : "پشتیبانی مپوشام"}</span>
                  <span>{msg.createdAt}</span>
                </div>
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                {/* Message Attachments */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    <span className="text-[10px] font-bold opacity-80 block">
                      فایل‌های پیوست:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {msg.attachments.map((att) => (
                        <a
                          key={att.id}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-[11px] font-medium transition-opacity ${
                            isUser
                              ? "bg-white/20 text-white hover:bg-white/30"
                              : "bg-surface-subtle text-foreground hover:bg-surface-muted"
                          }`}
                        >
                          {att.type.startsWith("image/") ? (
                            <ImageIcon className="w-3.5 h-3.5" />
                          ) : (
                            <FileText className="w-3.5 h-3.5" />
                          )}
                          <span className="truncate max-w-[120px] font-mono">
                            {att.name}
                          </span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
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

      {/* Reply Input Box */}
      <div className="p-3 sm:p-4 border-t border-border bg-surface shrink-0 space-y-3">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="px-2.5 py-1 bg-surface-subtle border border-border rounded-lg flex items-center gap-1.5 text-[11px] text-foreground"
              >
                <Paperclip className="w-3 h-3 text-primary" />
                <span className="truncate max-w-[100px] font-mono">{att.name}</span>
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

        <form onSubmit={handleSend} className="space-y-2">
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
              className="w-11 h-11 rounded-xl bg-surface-subtle border border-border hover:border-primary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors cursor-pointer shrink-0"
              title="افزودن فایل پیوست"
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
              className="flex-1 h-11 bg-surface-subtle border border-border rounded-xl px-3.5 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary focus:bg-background transition-colors"
            />

            <Button type="submit" size="md" className="font-bold px-4 shrink-0 cursor-pointer">
              <Send className="w-4 h-4 ml-1" />
              ارسال
            </Button>
          </div>
          {error && <p className="text-xs text-error">{error}</p>}
        </form>
      </div>
    </div>
  );
}
