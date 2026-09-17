"use client";

import React from "react";
import Link from "next/link";
import {
  SupportTicket,
  SupportTicketStatus,
  SupportPriority,
  supportCategoryLabels,
  supportStatusLabelsAdmin,
  supportPriorityLabels,
} from "@/types/support";
import {
  Package,
  RotateCcw,
  User,
  ChevronLeft,
  Clock,
  Eye,
  MessageSquare,
  AlertCircle,
} from "lucide-react";

interface AdminTicketTableProps {
  tickets: SupportTicket[];
}

export function AdminTicketTable({ tickets }: AdminTicketTableProps) {
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

  const getPriorityBadgeClass = (priority: SupportPriority) => {
    switch (priority) {
      case "urgent":
        return "bg-rose-500/10 text-rose-700 border-rose-500/20 font-bold";
      case "important":
        return "bg-amber-500/10 text-amber-700 border-amber-500/20";
      case "normal":
      default:
        return "bg-surface-subtle text-muted-foreground border-border-subtle";
    }
  };

  return (
    <div className="space-y-4">
      {/* Desktop Data Table */}
      <div className="hidden lg:block bg-surface border border-border rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-surface-subtle border-b border-border text-muted-foreground font-bold">
              <tr>
                <th className="py-3 px-4">تیکت</th>
                <th className="py-3 px-4">مشتری</th>
                <th className="py-3 px-4">موضوع</th>
                <th className="py-3 px-4">دسته‌بندی</th>
                <th className="py-3 px-4">مرتبط با</th>
                <th className="py-3 px-4">وضعیت</th>
                <th className="py-3 px-4">اولویت</th>
                <th className="py-3 px-4">مسئول</th>
                <th className="py-3 px-4">آخرین فعالیت</th>
                <th className="py-3 px-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tickets.map((t) => {
                const hasNewMessage = t.unreadForAdmin || t.lastMessageSender === "customer";

                return (
                  <tr
                    key={t.id}
                    className="hover:bg-surface-subtle/50 transition-colors group"
                  >
                    {/* Ticket ID & Unread Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-foreground">
                        {hasNewMessage && (
                          <span
                            className="w-2 h-2 rounded-full bg-primary animate-ping shrink-0"
                            title="پیام جدید مشتری"
                          />
                        )}
                        <span dir="ltr">#{t.ticketNumber}</span>
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <div className="font-bold text-foreground">{t.customerName}</div>
                        <div className="text-[10px] text-muted-foreground font-mono" dir="ltr">
                          {t.customerPhone}
                        </div>
                      </div>
                    </td>

                    {/* Subject */}
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/support/${t.id}`}
                        className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1"
                      >
                        {t.subject}
                      </Link>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-surface-subtle border border-border text-[11px]">
                        {supportCategoryLabels[t.category]}
                      </span>
                    </td>

                    {/* Related Order / Return / Product */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {t.orderNumber && (
                        <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                          <Package className="w-3.5 h-3.5 text-primary" />
                          <span>سفارش #{t.orderNumber}</span>
                        </div>
                      )}

                      {t.returnId && (
                        <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                          <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                          <span>مرجوعی #{t.returnId}</span>
                        </div>
                      )}

                      {!t.orderNumber && !t.returnId && (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(
                          t.status
                        )}`}
                      >
                        {supportStatusLabelsAdmin[t.status]}
                      </span>
                    </td>

                    {/* Priority Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-md border ${getPriorityBadgeClass(
                          t.priority
                        )}`}
                      >
                        {supportPriorityLabels[t.priority]}
                      </span>
                    </td>

                    {/* Assigned To */}
                    <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">
                      {t.assignedTo || <span className="text-muted-foreground/50">تخصیص‌نیافته</span>}
                    </td>

                    {/* Last Activity */}
                    <td className="py-3 px-4 whitespace-nowrap text-muted-foreground text-[11px]">
                      {t.lastMessageAt || t.updatedAt}
                    </td>

                    {/* Action Link */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <Link
                        href={`/admin/support/${t.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-[11px] font-bold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>بررسی</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View (Avoids wide horizontal scrolling on mobile) */}
      <div className="lg:hidden space-y-3">
        {tickets.map((t) => {
          const hasNewMessage = t.unreadForAdmin || t.lastMessageSender === "customer";

          return (
            <Link
              key={t.id}
              href={`/admin/support/${t.id}`}
              className="block bg-surface border border-border rounded-2xl p-4 space-y-3 shadow-2xs hover:border-primary transition-colors"
            >
              <div className="flex items-center justify-between gap-2 border-b border-border pb-2.5">
                <div className="flex items-center gap-1.5">
                  {hasNewMessage && (
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping shrink-0" />
                  )}
                  <span className="text-xs font-mono font-bold text-foreground" dir="ltr">
                    #{t.ticketNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-subtle text-[10px] text-muted-foreground border">
                    {supportCategoryLabels[t.category]}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(
                      t.status
                    )}`}
                  >
                    {supportStatusLabelsAdmin[t.status]}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded border ${getPriorityBadgeClass(
                      t.priority
                    )}`}
                  >
                    {supportPriorityLabels[t.priority]}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-xs font-bold text-foreground leading-snug">
                  {t.subject}
                </h3>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3 text-muted-foreground" />
                    <span>{t.customerName}</span>
                    <span className="font-mono" dir="ltr">
                      ({t.customerPhone})
                    </span>
                  </div>

                  <span className="text-[10px]">{t.lastMessageAt || t.updatedAt}</span>
                </div>
              </div>

              {(t.orderNumber || t.returnId || t.assignedTo) && (
                <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    {t.orderNumber && (
                      <span className="flex items-center gap-1 font-mono">
                        <Package className="w-3 h-3 text-primary" />
                        <span>#{t.orderNumber}</span>
                      </span>
                    )}
                    {t.returnId && (
                      <span className="flex items-center gap-1 font-mono">
                        <RotateCcw className="w-3 h-3 text-amber-600" />
                        <span>#{t.returnId}</span>
                      </span>
                    )}
                  </div>

                  {t.assignedTo && (
                    <span>مسئول: {t.assignedTo}</span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
