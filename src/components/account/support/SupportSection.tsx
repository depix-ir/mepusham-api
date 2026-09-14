"use client";

import React, { useState } from "react";
import { SupportTicket, Order, ticketStatusLabels } from "@/types/account";
import { CreateTicketModal } from "./CreateTicketModal";
import { TicketDetailModal } from "./TicketDetailModal";
import { Headset, Plus, MessageSquare, ChevronLeft } from "lucide-react";

interface SupportSectionProps {
  tickets: SupportTicket[];
  orders: Order[];
  onCreateTicket: (data: {
    subject: string;
    orderId?: string;
    orderNumber?: string;
    message: string;
  }) => void;
  onSendMessage: (ticketId: string, messageText: string) => void;
  prefilledOrderForTicket?: Order | null;
  onClearPrefilledOrder?: () => void;
}

export function SupportSection({
  tickets,
  orders,
  onCreateTicket,
  onSendMessage,
  prefilledOrderForTicket,
  onClearPrefilledOrder,
}: SupportSectionProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Auto-open create modal if prefilledOrderForTicket is passed
  React.useEffect(() => {
    if (prefilledOrderForTicket) {
      setIsCreateOpen(true);
    }
  }, [prefilledOrderForTicket]);

  const handleCloseCreate = () => {
    setIsCreateOpen(false);
    if (onClearPrefilledOrder) onClearPrefilledOrder();
  };

  const getStatusBadgeClass = (status: SupportTicket["status"]) => {
    switch (status) {
      case "waiting-user":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
      case "waiting-support":
        return "bg-amber-500/10 text-amber-700 border-amber-500/20";
      case "open":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20";
      default:
        return "bg-surface-subtle text-muted-foreground border-border-subtle";
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
          <Headset className="w-4 h-4 text-primary" />
          <span>پشتیبانی و تیکت‌ها</span>
        </h2>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>ایجاد تیکت جدید</span>
        </button>
      </div>

      {/* Ticket List */}
      {tickets.length > 0 ? (
        <div className="space-y-2.5">
          {tickets.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTicket(t)}
              className="p-3.5 bg-background border border-border/80 rounded-2xl flex items-center justify-between gap-3 hover:border-border transition-colors cursor-pointer group"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono" dir="ltr">
                    #{t.ticketNumber}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    {t.subject}
                  </h4>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-muted-foreground">
                  {t.orderNumber && (
                    <span>سفارش <strong className="text-foreground" dir="ltr">#{t.orderNumber}</strong></span>
                  )}
                  <span>به‌روزرسانی: {t.updatedAt}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadgeClass(
                    t.status
                  )}`}
                >
                  {ticketStatusLabels[t.status]}
                </span>
                <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 border border-dashed border-border rounded-2xl text-center space-y-3 bg-surface-subtle/30">
          <div className="w-10 h-10 rounded-full bg-surface-muted text-muted-foreground mx-auto flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-foreground">مشکلی در سفارش یا سوالی دارید؟</p>
            <p className="text-[11px] text-muted-foreground">
              از طریق ارسال تیکت با پشتیبانی ما در ارتباط باشید.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-hover transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت تیکت پشتیبانی</span>
          </button>
        </div>
      )}

      {/* Create Ticket Modal */}
      <CreateTicketModal
        orders={orders}
        prefilledOrder={prefilledOrderForTicket}
        isOpen={isCreateOpen}
        onClose={handleCloseCreate}
        onSubmit={onCreateTicket}
      />

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onSendMessage={(ticketId, text) => {
          onSendMessage(ticketId, text);
          // Keep active ticket updated with new message
          const updated = tickets.find((t) => t.id === ticketId);
          if (updated) setSelectedTicket(updated);
        }}
      />
    </div>
  );
}
