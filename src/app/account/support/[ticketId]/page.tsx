"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/store/auth/auth.store";
import { supportService } from "@/lib/support/supportService";
import { accountService } from "@/lib/account/accountService";
import { SupportTicket } from "@/types/support";
import { Order } from "@/types/account";
import { CustomerTicketDetail } from "@/components/account/support/CustomerTicketDetail";
import { AccountPageHeader } from "@/components/account/AccountPageHeader";
import { Container } from "@/components/ui/Container";
import { MessageSquare, ArrowRight, AlertCircle } from "lucide-react";

export default function CustomerTicketDetailPage() {
  const params = useParams();
  const ticketId = params.ticketId as string;

  const { isAuthenticated, isAuthLoading } = useAuth();

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (ticketId) {
      const found = supportService.getTicketById(ticketId);
      if (found) {
        setTicket(found);
        // Mark as read for customer
        supportService.markAsReadForCustomer(found.id);

        if (found.orderId || found.orderNumber) {
          const ord = accountService.getOrderById(found.orderId || found.orderNumber!);
          setOrder(ord);
        }
      } else {
        setNotFound(true);
      }
    }
  }, [ticketId]);

  if (isAuthLoading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (notFound || !ticket) {
    return (
      <div className="py-12 bg-background min-h-[60vh]">
        <Container>
          <div className="bg-surface border border-border rounded-2xl p-8 text-center max-w-md mx-auto space-y-4 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-error/10 text-error mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h1 className="text-base font-bold text-foreground">تیکت مورد نظر یافت نشد</h1>
              <p className="text-xs text-muted-foreground">
                تیکت درخواستی شما وجود ندارد یا حذف شده است.
              </p>
            </div>
            <Link
              href="/account/support"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary-hover transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به لیست تیکت‌ها</span>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-10 bg-background min-h-screen pb-24 md:pb-12">
      <Container>
        <div className="space-y-6">
          <AccountPageHeader
            title={`جزئیات تیکت #${ticket.ticketNumber}`}
            description={ticket.subject}
            icon={MessageSquare}
            backUrl="/account/support"
            backLabel="بازگشت به لیست تیکت‌ها"
          />

          <CustomerTicketDetail ticket={ticket} order={order} />
        </div>
      </Container>
    </div>
  );
}
