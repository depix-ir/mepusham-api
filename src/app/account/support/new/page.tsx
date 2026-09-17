"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/store/auth/auth.store";
import { accountService } from "@/lib/account/accountService";
import { Order } from "@/types/account";
import { SupportCategory } from "@/types/support";
import { CustomerTicketForm } from "@/components/account/support/CustomerTicketForm";
import { AccountPageHeader } from "@/components/account/AccountPageHeader";
import { Container } from "@/components/ui/Container";
import { PlusCircle, LogIn, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NewTicketPage() {
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState<Order[]>([]);

  const orderIdParam = searchParams.get("orderId") || undefined;
  const returnIdParam = searchParams.get("returnId") || undefined;
  const categoryParam = (searchParams.get("category") as SupportCategory) || undefined;

  useEffect(() => {
    if (isAuthenticated) {
      setOrders(accountService.getOrders());
    }
  }, [isAuthenticated]);

  if (isAuthLoading) {
    return (
      <div className="py-20 flex justify-center items-center">
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
                ورود به حساب کاربری جهت ثبت تیکت
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                برای ثبت تیکت پشتیبانی ابتدا باید وارد حساب کاربری خود شوید.
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
        </Container>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-10 bg-background min-h-screen pb-24 md:pb-12">
      <Container>
        <div className="space-y-6">
          <AccountPageHeader
            title="ایجاد تیکت جدید"
            description="ارسال پیام به تیم پشتیبانی مپوشام"
            icon={PlusCircle}
            backUrl="/account/support"
            backLabel="بازگشت به پشتیبانی"
          />

          <CustomerTicketForm
            orders={orders}
            defaultOrderId={orderIdParam}
            defaultReturnId={returnIdParam}
            defaultCategory={categoryParam}
          />
        </div>
      </Container>
    </div>
  );
}
