"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/store/auth/auth.store";
import { supportService } from "@/lib/support/supportService";
import { SupportTicket } from "@/types/support";
import { CustomerTicketList } from "@/components/account/support/CustomerTicketList";
import { AccountPageHeader } from "@/components/account/AccountPageHeader";
import { Container } from "@/components/ui/Container";
import { ErrorState } from "@/components/ui/ErrorState";
import { routes } from "@/lib/routes";
import { MessageSquare, LogIn, ChevronLeft } from "lucide-react";

export default function AccountSupportPage() {
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const loadTickets = useCallback(() => {
    setIsLoading(true);
    setIsError(false);
    try {
      const data = supportService.getTickets();
      setTickets(data);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadTickets();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, loadTickets]);

  if (isAuthLoading || isLoading) {
    return (
      <div className="py-20 flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="py-12 bg-background min-h-[60vh]">
        <Container>
          <div className="bg-surface border border-border rounded-2xl p-6 sm:p-10 text-center max-w-lg mx-auto space-y-4 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
              <LogIn className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h1 className="text-base font-bold text-foreground">
                ورود به حساب کاربری جهت مشاهده تیکت‌ها
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                برای مشاهده تاریخچه پیام‌ها و ثبت تیکت پشتیبانی ابتدا وارد حساب کاربری خود شوید.
              </p>
            </div>
            <Link
              href={routes.account.root}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-hover transition-colors shadow-2xs"
            >
              <span>ورود به حساب کاربری</span>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-10 bg-background min-h-screen pb-24 md:pb-12">
      <div className="max-w-[800px] mx-auto">
        <div className="space-y-6">
          <AccountPageHeader
            title="پشتیبانی و تیکت‌ها"
            description="مشاهده و مدیریت تیکت‌های پشتیبانی"
            icon={MessageSquare}
            backUrl={routes.account.root}
            backLabel="بازگشت به حساب کاربری"
          />

          {isError ? (
            <ErrorState
              title="دریافت اطلاعات تیکت‌ها با خطا مواجه شد"
              description="مشکلی در بارگیری درخواست‌های پشتیبانی پیش آمده است. لطفاً دوباره تلاش کنید."
              onAction={loadTickets}
              actionLabel="تلاش دوباره"
            />
          ) : (
            <CustomerTicketList tickets={tickets} />
          )}
        </div>
      </div>
    </div>
  );
}
