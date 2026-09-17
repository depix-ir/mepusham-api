"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supportService } from "@/lib/support/supportService";
import {
  SupportTicket,
  SupportTicketStatus,
  SupportPriority,
  SupportCategory,
  supportCategoryLabels,
} from "@/types/support";
import { AdminTicketTable } from "@/components/admin/support/AdminTicketTable";
import { ManageQuickRepliesModal } from "@/components/admin/support/ManageQuickRepliesModal";
import {
  Headphones,
  Search,
  Filter,
  Zap,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle2,
  Inbox,
} from "lucide-react";

export default function AdminSupportDashboardPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  // Filters state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<SupportPriority | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<SupportCategory | "all">("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");

  const [isManageQuickRepliesOpen, setIsManageQuickRepliesOpen] = useState(false);

  // Load tickets on mount
  useEffect(() => {
    setTickets(supportService.getTickets());
  }, []);

  // Filtered tickets memo
  const filteredTickets = useMemo(() => {
    return supportService.getTickets({
      search,
      status: statusFilter,
      priority: priorityFilter,
      category: categoryFilter,
      assignedTo: assigneeFilter,
    });
  }, [tickets, search, statusFilter, priorityFilter, categoryFilter, assigneeFilter]);

  // Stat counts
  const totalCount = tickets.length;
  const newCount = tickets.filter((t) => t.status === "new").length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;
  const waitingCustomerCount = tickets.filter((t) => t.status === "waiting_for_customer").length;
  const urgentCount = tickets.filter((t) => t.priority === "urgent").length;
  const resolvedCount = tickets.filter(
    (t) => t.status === "resolved" || t.status === "closed"
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-2xs">
        <div className="space-y-1">
          <h1 className="text-base sm:text-xl font-bold text-foreground flex items-center gap-2">
            <Headphones className="w-4 h-4 text-primary" />
            <span>مدیریت پشتیبانی و تیکت‌ها</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            پاسخگویی به درخواست‌های مشتریان، پیگیری وضعیت تیکت‌ها و پیام‌های آماده
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsManageQuickRepliesOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500/10 text-amber-800 border border-amber-500/20 text-xs font-bold hover:bg-amber-500/20 transition-colors cursor-pointer shrink-0 w-full sm:w-auto"
        >
          <Zap className="w-4 h-4 text-amber-600" />
          <span>مدیریت پیام‌های آماده</span>
        </button>
      </div>

      {/* Summary Cards (Clickable Filters) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total */}
        <button
          type="button"
          onClick={() => setStatusFilter("all")}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
            statusFilter === "all"
              ? "bg-primary/5 border-primary shadow-2xs"
              : "bg-surface border-border hover:border-border-muted"
          }`}
        >
          <span className="text-[11px] text-muted-foreground font-medium block">کل تیکت‌ها</span>
          <span className="text-lg font-bold text-foreground mt-1 block">{totalCount}</span>
        </button>

        {/* New */}
        <button
          type="button"
          onClick={() => setStatusFilter("new")}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
            statusFilter === "new"
              ? "bg-blue-500/10 border-blue-500 shadow-2xs"
              : "bg-surface border-border hover:border-border-muted"
          }`}
        >
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-[11px] font-medium">تیکت‌های جدید</span>
            <Inbox className="w-3.5 h-3.5" />
          </div>
          <span className="text-lg font-bold text-foreground mt-1 block">{newCount}</span>
        </button>

        {/* In Progress */}
        <button
          type="button"
          onClick={() => setStatusFilter("in_progress")}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
            statusFilter === "in_progress"
              ? "bg-amber-500/10 border-amber-500 shadow-2xs"
              : "bg-surface border-border hover:border-border-muted"
          }`}
        >
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[11px] font-medium">در حال بررسی</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <span className="text-lg font-bold text-foreground mt-1 block">{inProgressCount}</span>
        </button>

        {/* Waiting Customer */}
        <button
          type="button"
          onClick={() => setStatusFilter("waiting_for_customer")}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
            statusFilter === "waiting_for_customer"
              ? "bg-purple-500/10 border-purple-500 shadow-2xs"
              : "bg-surface border-border hover:border-border-muted"
          }`}
        >
          <div className="flex items-center justify-between text-purple-600">
            <span className="text-[11px] font-medium">منتظر مشتری</span>
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <span className="text-lg font-bold text-foreground mt-1 block">{waitingCustomerCount}</span>
        </button>

        {/* Urgent */}
        <button
          type="button"
          onClick={() => {
            setPriorityFilter("urgent");
            setStatusFilter("all");
          }}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
            priorityFilter === "urgent"
              ? "bg-rose-500/10 border-rose-500 shadow-2xs"
              : "bg-surface border-border hover:border-border-muted"
          }`}
        >
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-[11px] font-medium">تیکت‌های فوری</span>
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
          <span className="text-lg font-bold text-foreground mt-1 block">{urgentCount}</span>
        </button>

        {/* Resolved */}
        <button
          type="button"
          onClick={() => setStatusFilter("resolved")}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
            statusFilter === "resolved"
              ? "bg-emerald-500/10 border-emerald-500 shadow-2xs"
              : "bg-surface border-border hover:border-border-muted"
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[11px] font-medium">حل‌شده / بسته</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-lg font-bold text-foreground mt-1 block">{resolvedCount}</span>
        </button>
      </div>

      {/* Search & Filters Controls */}
      <div className="bg-surface border border-border rounded-2xl p-4 space-y-3 shadow-2xs">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو بر اساس شماره تیکت، نام مشتری، موبایل، موضوع یا شماره سفارش..."
              className="w-full h-10 bg-surface-subtle border border-border rounded-xl pr-9 pl-3 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as SupportTicketStatus | "all")}
              className="h-10 bg-surface-subtle border border-border rounded-xl px-2.5 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="new">جدید</option>
              <option value="in_progress">در حال بررسی</option>
              <option value="waiting_for_customer">منتظر پاسخ مشتری</option>
              <option value="replied">پاسخ داده شد</option>
              <option value="resolved">حل شده</option>
              <option value="closed">بسته شده</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as SupportPriority | "all")}
              className="h-10 bg-surface-subtle border border-border rounded-xl px-2.5 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">همه اولویت‌ها</option>
              <option value="normal">عادی</option>
              <option value="important">مهم</option>
              <option value="urgent">فوری</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as SupportCategory | "all")}
              className="h-10 bg-surface-subtle border border-border rounded-xl px-2.5 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">همه دسته‌ها</option>
              {(Object.keys(supportCategoryLabels) as SupportCategory[]).map((cat) => (
                <option key={cat} value={cat}>
                  {supportCategoryLabels[cat]}
                </option>
              ))}
            </select>

            {/* Assignee Filter */}
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="h-10 bg-surface-subtle border border-border rounded-xl px-2.5 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">همه مسئولین</option>
              <option value="unassigned">اختصاص داده نشده</option>
              <option value="پشتیبانی ۱ (رضا)">پشتیبانی ۱ (رضا)</option>
              <option value="پشتیبانی ۲ (مریم)">پشتیبانی ۲ (مریم)</option>
              <option value="مدیریت پشتیبانی">مدیریت پشتیبانی</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ticket List Table / Cards */}
      {filteredTickets.length > 0 ? (
        <AdminTicketTable tickets={filteredTickets} />
      ) : (
        <div className="p-12 border border-dashed border-border rounded-2xl text-center space-y-3 bg-surface-subtle/30">
          <div className="w-12 h-12 rounded-full bg-surface-subtle text-muted-foreground mx-auto flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">هیچ تیکتی پیدا نشد</p>
            <p className="text-xs text-muted-foreground">
              با فیلترها و عبارت جستجوی فعلی هیچ تیکتی وجود ندارد.
            </p>
          </div>
        </div>
      )}

      {/* Manage Quick Replies Modal */}
      <ManageQuickRepliesModal
        isOpen={isManageQuickRepliesOpen}
        onClose={() => setIsManageQuickRepliesOpen(false)}
        onUpdated={() => {
          setTickets(supportService.getTickets());
        }}
      />
    </div>
  );
}
