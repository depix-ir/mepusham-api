"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  SupportTicket,
  SupportTicketStatus,
  supportCategoryLabels,
  supportStatusLabelsCustomer,
} from "@/types/support";
import {
  Plus,
  MessageSquare,
  Search,
  Filter,
  ChevronLeft,
  Clock,
  Package,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface CustomerTicketListProps {
  tickets: SupportTicket[];
}

export function CustomerTicketList({ tickets }: CustomerTicketListProps) {
  const [selectedStatus, setSelectedStatus] = useState<SupportTicketStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchStatus = selectedStatus === "all" || t.status === selectedStatus;
      const matchSearch =
        !searchQuery.trim() ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.ticketNumber.includes(searchQuery) ||
        (t.orderNumber && t.orderNumber.includes(searchQuery));
      return matchStatus && matchSearch;
    });
  }, [tickets, selectedStatus, searchQuery]);

  // Stat counts
  const totalCount = tickets.length;
  const activeCount = tickets.filter(
    (t) => t.status === "new" || t.status === "in_progress" || t.status === "replied"
  ).length;
  const waitingUserCount = tickets.filter((t) => t.status === "waiting_for_customer").length;
  const resolvedCount = tickets.filter(
    (t) => t.status === "resolved" || t.status === "closed"
  ).length;

  const getStatusBadgeClass = (status: SupportTicketStatus) => {
    switch (status) {
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
    <div className="space-y-6">
      {/* Top Header & New Ticket CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-2xs">
        <div className="space-y-1">
          <h1 className="text-base sm:text-xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span>پشتیبانی و تیکت‌های من</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            لیست درخواست‌ها و تاریخچه گفتگوهای شما با تیم پشتیبانی فروشگاه
          </p>
        </div>

        <Link
          href="/account/support/new"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-hover transition-colors shadow-2xs cursor-pointer shrink-0 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>ایجاد تیکت جدید</span>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setSelectedStatus("all")}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
            selectedStatus === "all"
              ? "bg-primary/5 border-primary shadow-2xs"
              : "bg-surface border-border hover:border-border-muted"
          }`}
        >
          <span className="text-[11px] text-muted-foreground font-medium block">کل تیکت‌ها</span>
          <span className="text-lg font-bold text-foreground mt-1 block">{totalCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus("in_progress")}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
            selectedStatus === "in_progress"
              ? "bg-amber-500/10 border-amber-500 shadow-2xs"
              : "bg-surface border-border hover:border-border-muted"
          }`}
        >
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[11px] font-medium">در حال بررسی</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <span className="text-lg font-bold text-foreground mt-1 block">{activeCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus("waiting_for_customer")}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
            selectedStatus === "waiting_for_customer"
              ? "bg-rose-500/10 border-rose-500 shadow-2xs"
              : "bg-surface border-border hover:border-border-muted"
          }`}
        >
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-[11px] font-medium">منتظر پاسخ شما</span>
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
          <span className="text-lg font-bold text-foreground mt-1 block">{waitingUserCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus("resolved")}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
            selectedStatus === "resolved"
              ? "bg-emerald-500/10 border-emerald-500 shadow-2xs"
              : "bg-surface border-border hover:border-border-muted"
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[11px] font-medium">حل‌شده</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-lg font-bold text-foreground mt-1 block">{resolvedCount}</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در موضوع، شماره تیکت یا سفارش..."
            className="w-full h-11 bg-surface border border-border rounded-xl pr-9 pl-3 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0 hidden sm:block" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as SupportTicketStatus | "all")}
            className="w-full sm:w-44 h-11 bg-surface border border-border rounded-xl px-3 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="new">جدید</option>
            <option value="in_progress">در حال بررسی</option>
            <option value="waiting_for_customer">منتظر پاسخ شما</option>
            <option value="replied">پاسخ داده شد</option>
            <option value="resolved">حل شده</option>
            <option value="closed">بسته شده</option>
          </select>
        </div>
      </div>

      {/* Ticket List */}
      {filteredTickets.length > 0 ? (
        <div className="space-y-3">
          {filteredTickets.map((t) => (
            <Link
              key={t.id}
              href={`/account/support/${t.id}`}
              className="group bg-surface border border-border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 hover:border-primary/50 transition-all shadow-2xs"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono font-bold text-muted-foreground" dir="ltr">
                    #{t.ticketNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-surface-subtle text-[10px] font-bold text-foreground">
                    {supportCategoryLabels[t.category]}
                  </span>
                  <h2 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {t.subject}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                  {t.orderNumber && (
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3 text-muted-foreground" />
                      <span>سفارش:</span>
                      <strong className="text-foreground font-mono" dir="ltr">
                        #{t.orderNumber}
                      </strong>
                    </span>
                  )}

                  {t.returnId && (
                    <span className="flex items-center gap-1">
                      <RotateCcw className="w-3 h-3 text-muted-foreground" />
                      <span>مرجوعی:</span>
                      <strong className="text-foreground font-mono" dir="ltr">
                        #{t.returnId}
                      </strong>
                    </span>
                  )}

                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span>بروزرسانی: {t.lastMessageAt || t.updatedAt}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-border shrink-0">
                <span
                  className={`text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full border ${getStatusBadgeClass(
                    t.status
                  )}`}
                >
                  {supportStatusLabelsCustomer[t.status]}
                </span>

                <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-10 border border-dashed border-border rounded-2xl text-center space-y-3 bg-surface-subtle/30">
          <div className="w-12 h-12 rounded-full bg-surface-subtle text-muted-foreground mx-auto flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">هیچ تیکتی پیدا نشد</p>
            <p className="text-xs text-muted-foreground">
              {searchQuery || selectedStatus !== "all"
                ? "با فیلترهای انتخاب شده تیکتی وجود ندارد."
                : "اگر درباره محصولات، سفارش یا مرجوعی سوالی دارید، می‌توانید تیکت جدید ثبت کنید."}
            </p>
          </div>
          <Link
            href="/account/support/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-hover transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت تیکت جدید</span>
          </Link>
        </div>
      )}
    </div>
  );
}
