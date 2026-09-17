"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/store/auth/auth.store";
import { supportService } from "@/lib/support/supportService";
import { SupportTicket } from "@/types/support";
import { Container } from "@/components/ui/Container";
import { FAQSection } from "@/components/support/FAQSection";
import { PurchaseGuidesSection } from "@/components/support/PurchaseGuidesSection";
import { CustomerTicketList } from "@/components/account/support/CustomerTicketList";
import { AccountPageHeader } from "@/components/account/AccountPageHeader";
import {
  Headset,
  MessageSquare,
  LogIn,
  HelpCircle,
  BookOpen,
  ChevronLeft,
} from "lucide-react";

type ActiveTab = "faqs" | "guides" | "tickets";

export default function PublicSupportPage() {
  const { user, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>("tickets");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  // Parse tab param from URL on initial load if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab");
      if (tabParam === "faqs" || tabParam === "guides" || tabParam === "tickets") {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // Load support tickets when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setTickets(supportService.getTickets());
    }
  }, [isAuthenticated]);

  return (
    <div className="py-6 sm:py-10 bg-background min-h-screen pb-24 md:pb-12">
      <Container>
        <div className="space-y-6 sm:space-y-8">
          {/* Top Header */}
          <AccountPageHeader
            title="مرکز پشتیبانی و تیکت‌ها"
            description="راهنمای مشتریان، سوالات متداول و ثبت تیکت پشتیبانی"
            icon={Headset}
            backUrl="/account"
            backLabel="بازگشت به حساب کاربری"
          />

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab("tickets")}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "tickets"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:bg-surface-subtle"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>تیکت‌های من</span>
              {tickets.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[11px] font-mono font-bold">
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
              <div>
                {!isAuthenticated ? (
                  /* Unauthenticated State Prompt */
                  <div className="bg-surface border border-border rounded-2xl p-6 sm:p-10 text-center max-w-lg mx-auto space-y-4 shadow-2xs">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
                      <LogIn className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-base font-bold text-foreground">
                        برای ثبت و پیگیری تیکت وارد شوید
                      </h2>
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
                  <CustomerTicketList tickets={tickets} />
                )}
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
