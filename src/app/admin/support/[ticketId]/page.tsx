"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supportService } from "@/lib/support/supportService";
import { SupportTicket } from "@/types/support";
import { AdminTicketDetail } from "@/components/admin/support/AdminTicketDetail";
import { ArrowRight, AlertCircle } from "lucide-react";

export default function AdminTicketDetailPage() {
  const params = useParams();
  const ticketId = params.ticketId as string;

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (ticketId) {
      const found = supportService.getTicketById(ticketId);
      if (found) {
        setTicket(found);
        supportService.markAsReadForAdmin(found.id);
      } else {
        setNotFound(true);
      }
    }
  }, [ticketId]);

  if (notFound || !ticket) {
    return (
      <div className="py-12">
        <div className="bg-surface border border-border rounded-2xl p-8 text-center max-w-md mx-auto space-y-4 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-error/10 text-error mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-base font-bold text-foreground">تیکت مورد نظر یافت نشد</h1>
            <p className="text-xs text-muted-foreground">
              تیکت درخواستی وجود ندارد یا شناسه آن اشتباه است.
            </p>
          </div>
          <Link
            href="/admin/support"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary-hover transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به پشتیبانی ادمین</span>
          </Link>
        </div>
      </div>
    );
  }

  return <AdminTicketDetail ticket={ticket} />;
}
