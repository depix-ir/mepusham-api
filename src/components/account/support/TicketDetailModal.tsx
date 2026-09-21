"use client";

import React, { useState, useEffect } from "react";
import { SupportTicket, ticketStatusLabels } from "@/types/account";
import { Button } from "@/components/ui/Button";
import { X, Send, HelpCircle, User, Headset } from "lucide-react";

interface TicketDetailModalProps {
  ticket: SupportTicket | null;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (ticketId: string, messageText: string) => void;
}

export function TicketDetailModal({
  ticket,
  isOpen,
  onClose,
  onSendMessage,
}: TicketDetailModalProps) {
  const [replyText, setReplyText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setReplyText("");
    setError(null);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !ticket) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) {
      setError("متن پیام را وارد کنید.");
      return;
    }
    setError(null);
    onSendMessage(ticket.id, replyText.trim());
    setReplyText("");
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="ticket-detail-title"
    >
      <div
        className="relative w-full max-w-xl bg-background border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col h-[85vh] max-h-[700px] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-subtle bg-surface-subtle/50 shrink-0">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono" dir="ltr">
                #{ticket.ticketNumber}
              </span>
              <h3 id="ticket-detail-title" className="text-sm sm:text-base font-bold text-foreground">
                {ticket.subject}
              </h3>
            </div>
            {ticket.orderNumber && (
              <span className="text-[11px] text-muted-foreground block">
                مربوط به سفارش <strong className="text-foreground" dir="ltr">#{ticket.orderNumber}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadgeClass()}`}
            >
              {ticketStatusLabels[ticket.status]}
            </span>
            <button
              type="button"
              onClick={onClose}
              className=""
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Conversation History */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-surface-subtle/20">
          {ticket.messages.map((msg) => {
            const isUser = msg.sender === "user";

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface-muted text-foreground border border-border-subtle"
                  }`}
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : <Headset className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm space-y-1.5 ${
                    isUser
                      ? "bg-primary text-primary-foreground rounded-tl-none shadow-2xs"
                      : "bg-background border border-border-subtle text-foreground rounded-tr-none shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] opacity-80">
                    <span className="font-bold">{isUser ? "شما" : "پشتیبانی مپوشــــم"}</span>
                    <span>{msg.createdAt}</span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reply Area */}
        <div className="p-3 sm:p-4 border-t border-border-subtle bg-background shrink-0">
          <form onSubmit={handleSend} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => {
                  setReplyText(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="پاسخ خود را بنویسید..."
                className="flex-1 h-11 bg-surface-subtle border border-transparent rounded-xl px-3.5 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary focus:bg-background transition-colors"
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
    </div>
  );
}
