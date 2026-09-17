"use client";

import React from "react";
import Link from "next/link";
import { SupportTicket, ticketStatusLabels } from "@/types/account";
import { routes } from "@/lib/routes";
import { Headset, ChevronLeft, Plus, MessageSquare } from "lucide-react";

interface SupportSectionProps {
  tickets: SupportTicket[];
  orders?: any[];
  onCreateTicket?: any;
  onSendMessage?: any;
  prefilledOrderForTicket?: any;
  onClearPrefilledOrder?: any;
}

export function SupportSection({ tickets }: SupportSectionProps) {
  const openTicketsCount = tickets.filter(
    (t) => t.status === "open" || t.status === "waiting-support" || t.status === "waiting-user"
  ).length;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Headset className="w-4 h-4 text-primary" />
          <span>پشتیبانی و تیکت‌ها</span>
        </h2>

        <Link
          href={routes.account.support.list()}
          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
        >
          <span>ورود به مرکز پشتیبانی</span>
          <ChevronLeft className="w-4 h-4 ml-0.5" />
        </Link>
      </div>

      {/* Main Support Summary Card */}
      <div className="p-4 bg-surface-subtle/50 border border-border/80 rounded-2xl space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-foreground">
              مرکز پاسخگویی و راهنمای خرید
            </h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              سوالات متداول، راهنمای ثبت سفارش و پیگیری تیکت‌های شما در صفحه اختصاصی پشتیبانی.
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
        </div>

        {/* Quick Ticket Status Pill */}
        {tickets.length > 0 ? (
          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">تعداد کل تیکت‌ها:</span>
            <span className="font-bold font-mono text-foreground">{tickets.length} تیکت</span>
          </div>
        ) : null}

        {/* Call-to-action buttons */}
        <div className="pt-1 flex gap-2">
          <Link
            href={routes.account.support.list()}
            className="flex-1 py-2 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-hover transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ثبت یا پیگیری تیکت</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
