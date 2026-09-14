"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/store/auth/auth.store";
import { accountService } from "@/lib/account/accountService";
import { SupportTicket, Order, ticketStatusLabels, TicketAttachment } from "@/types/account";
import { Container } from "@/components/ui/Container";
import { FAQSection } from "@/components/support/FAQSection";
import { PurchaseGuidesSection } from "@/components/support/PurchaseGuidesSection";
import { TicketForm } from "@/components/support/TicketForm";
import { TicketDetailView } from "@/components/support/TicketDetailView";
import Link from "next/link";
import {
  Headset,
  Plus,
  MessageSquare,
  ChevronLeft,
  LogIn,
  HelpCircle,
  BookOpen,
  Sparkles,
  ArrowRight,
} from "lucide-react";

type ActiveTab = "faqs" | "guides" | "tickets";

export default function SupportPage() {
  const { user, isAuthenticated, isAuthLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>("tickets");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [viewMode, setViewMode] = useState<"list" | "create" | "detail">("list");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Load account tickets & orders when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setTickets(accountService.getTickets());
      setOrders(accountService.getOrders());
    }
  }, [isAuthenticated]);

  const handleCreateTicket = useCallback(
    (data: {
      subject: string;
      orderId?: string;
      orderNumber?: string;
      message: string;
      attachments?: TicketAttachment[];
    }) => {
      accountService.createTicket(data);
      const updatedTickets = accountService.getTickets();
      setTickets(updatedTickets);
      setViewMode("list");
    },
    []
  );

  const handleSendMessage = useCallback(
    (ticketId: string, text: string, attachments?: TicketAttachment[]) => {
      accountService.addTicketMessage(ticketId, text, attachments);
      const updatedTickets = accountService.getTickets();
      setTickets(updatedTickets);

      // Keep active ticket updated
      const updated = updatedTickets.find((t) => t.id === ticketId);
      if (updated) setSelectedTicket(updated);
    },
    []
  );

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
    <div className="py-6 sm:py-10 bg-background min-h-screen pb-24 md:pb-12">
      <Container>
        <div className="space-y-6 sm:space-y-8">
          {/* Top Header & Breadcrumb */}
          <div className="bg-primary/100 rounded-2xl p-5 sm:p-8 text-primary-foreground space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <Link
                href="/account"
                className="inline-flex items-center gap-1.5 text-xs text-primary-foreground/80 hover:text-white transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                <span>بازگشت به حساب کاربری</span>
              </Link>
              <div className="flex items-center gap-1.5 text-xs bg-white/10 px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>پشتیبانی آنلاین مپوشام</span>
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Headset className="w-6 h-6" />
                <span>مرکز پشتیبانی و تیکت‌ها</span>
              </h1>
              <p className="text-xs sm:text-sm opacity-90 leading-relaxed max-w-xl">
                پاسخ به سوالات متداول، راهنماهای خرید و ارسال تیکت به کارشناسان پشتیبانی
              </p>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => {
                setActiveTab("tickets");
                setViewMode("list");
              }}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "tickets"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:bg-surface-subtle"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>تیکت‌های من</span>
              {tickets.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-white/20 text-white text-[10px] flex items-center justify-center font-mono">
                  {tickets.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("faqs")}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "faqs"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:bg-surface-subtle"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>سوالات متداول</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("guides")}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "guides"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:bg-surface-subtle"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>راهنمای خرید</span>
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="pt-2">
            {activeTab === "faqs" && <FAQSection />}

            {activeTab === "guides" && <PurchaseGuidesSection />}

            {activeTab === "tickets" && (
              <div className="space-y-6">
                {!isAuthenticated ? (
                  /* Unauthenticated State Prompt */
                  <div className="bg-surface border border-border rounded-2xl p-6 sm:p-10 text-center max-w-lg mx-auto space-y-4 shadow-2xs">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
                      <LogIn className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-foreground">
                        برای ثبت و پیگیری تیکت وارد شوید
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        مشاهده سوالات متداول و راهنماها نیازی به ورود ندارد، اما برای ارتباط با پشتیبانی باید وارد حساب کاربری خود شوید.
                      </p>
                    </div>
                    <Link
                      href="/account"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-hover transition-colors shadow-2xs"
                    >
                      <span>ورود به حساب کاربری</span>
                      <ChevronLeft className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  /* Authenticated Ticket System Workflow */
                  <div>
                    {viewMode === "create" && (
                      <TicketForm
                        orders={orders}
                        onCancel={() => setViewMode("list")}
                        onSubmit={handleCreateTicket}
                      />
                    )}

                    {viewMode === "detail" && selectedTicket && (
                      <TicketDetailView
                        ticket={selectedTicket}
                        onBack={() => {
                          setViewMode("list");
                          setSelectedTicket(null);
                        }}
                        onSendMessage={handleSendMessage}
                      />
                    )}

                    {viewMode === "list" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h2 className="text-base sm:text-lg font-bold text-foreground">
                            فهرست تیکت‌های پشتیبانی
                          </h2>
                          <button
                            type="button"
                            onClick={() => setViewMode("create")}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-hover transition-colors shadow-2xs cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>ثبت تیکت جدید</span>
                          </button>
                        </div>

                        {tickets.length > 0 ? (
                          <div className="grid grid-cols-1 gap-3">
                            {tickets.map((t) => (
                              <div
                                key={t.id}
                                onClick={() => {
                                  setSelectedTicket(t);
                                  setViewMode("detail");
                                }}
                                className="p-4 bg-surface border border-border rounded-2xl flex items-center justify-between gap-4 hover:border-primary/50 transition-all cursor-pointer group shadow-2xs"
                              >
                                <div className="space-y-1.5 min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground font-mono" dir="ltr">
                                      #{t.ticketNumber}
                                    </span>
                                    <h3 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                      {t.subject}
                                    </h3>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                    {t.orderNumber && (
                                      <span>
                                        سفارش <strong className="text-foreground font-mono">#{t.orderNumber}</strong>
                                      </span>
                                    )}
                                    <span>آخرین بروزرسانی: {t.updatedAt}</span>
                                    <span>{t.messages.length} پیام</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                  <span
                                    className={`text-[11px] font-bold px-3 py-1 rounded-full border ${getStatusBadgeClass(
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
                          <div className="p-8 border border-dashed border-border rounded-2xl text-center space-y-3 bg-surface-subtle/30">
                            <div className="w-10 h-10 rounded-full bg-surface-muted text-muted-foreground mx-auto flex items-center justify-center">
                              <MessageSquare className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-foreground">
                                هیچ تیکتی ثبت نشده است
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                اگر درباره محصولات یا سفارش خود سوالی دارید، می‌توانید اولین تیکت خود را ارسال کنید.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setViewMode("create")}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-hover transition-colors cursor-pointer"
                            >
                              <Plus className="w-4 h-4" />
                              <span>ایجاد تیکت جدید</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
