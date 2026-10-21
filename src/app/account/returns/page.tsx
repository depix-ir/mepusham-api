"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/store/auth/auth.store";
import { returnService } from "@/lib/returns/returnService";
import { ReturnRequest, RETURN_STATUS_LABELS } from "@/types/return";
import { Container } from "@/components/ui/Container";
import { AccountPageHeader } from "@/components/account/AccountPageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatPrice } from "@/lib/formatting/currency";
import { TomanIcon } from "@/components/icons";
import { routes } from "@/lib/routes";
import {
  RotateCcw,
  Calendar,
  ChevronRight,
} from "lucide-react";

export default function CustomerReturnsListPage() {
  const { isAuthLoading, isAuthenticated } = useAuth();
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const loadReturns = useCallback(() => {
    setIsLoading(true);
    setIsError(false);
    try {
      const items = returnService.getReturnRequestsForCustomer();
      setRequests(items);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadReturns();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, loadReturns]);

  if (isAuthLoading || isLoading) {
    return (
      <div className="py-20 text-center min-h-[60vh] flex items-center justify-center">
        <Container>
          <div className="w-10 h-10 rounded-full border-3 border-primary/30 border-t-primary animate-spin mx-auto" />
        </Container>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Container className="max-w-md mx-auto space-y-4">
          <p className="text-sm font-bold text-foreground">
            برای مشاهده درخواست‌های مرجوعی باید وارد حساب کاربری شوید.
          </p>
          <Link
            href={routes.account.root}
            className="inline-block px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary-hover transition-colors shadow-xs"
          >
            ورود به حساب کاربری
          </Link>
        </Container>
      </div>
    );
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "requested":
      case "under_review":
        return "bg-amber-500/10 text-amber-700 border-amber-500/20";
      case "approved":
      case "awaiting_customer_shipment":
      case "in_transit":
      case "received":
      case "inspection":
        return "bg-blue-500/10 text-blue-700 border-blue-500/20";
      case "inspection_approved":
      case "refunded":
      case "replacement_shipped":
      case "completed":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20";
      case "rejected":
      case "inspection_rejected":
        return "bg-rose-500/10 text-rose-700 border-rose-500/20";
      default:
        return "bg-surface-subtle text-foreground border-border-subtle";
    }
  };

  return (
    <div className="py-6 sm:py-10 max-w-[800px] m-auto bg-background min-h-screen pb-24 md:pb-12">
      <Container className="max-w-3xl space-y-6">
        {/* Header */}
        <AccountPageHeader
          title="درخواست‌های مرجوعی"
          description="مدیریت و پیگیری وضعیت درخواست‌های مرجوعی"
          icon={RotateCcw}
          backUrl={routes.account.root}
          backLabel="بازگشت به حساب کاربری"
        />

        {isError ? (
          <ErrorState
            title="دریافت درخواست‌های مرجوعی با خطا مواجه شد"
            description="مشکلی در بارگیری لیست مرجوعی‌ها پیش آمده است. لطفاً دوباره تلاش کنید."
            onAction={loadReturns}
            actionLabel="تلاش دوباره"
          />
        ) : (
          <>
            {/* Support Link Header Bar */}
            {requests.length > 0 && (
              <div className="flex items-center justify-between gap-3 pb-2 border-b border-border-subtle">
                <span className="text-xs text-muted-foreground">
                  تعداد کل درخواست‌ها: {requests.length}
                </span>
                <Link
                  href={routes.account.support.list()}
                  className="text-xs font-medium text-primary hover:underline transition-colors"
                >
                  ارتباط با پشتیبانی
                </Link>
              </div>
            )}

            {/* Requests List or Empty State */}
            {requests.length > 0 ? (
              <div className="space-y-4">
                {requests.map((req) => {
                  const firstItem = req.items[0];

                  return (
                    <div
                      key={req.id}
                      className="bg-background border border-border rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs hover:border-primary/40 transition-colors"
                    >
                      {/* Card Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">
                            کد درخواست: <span dir="ltr" className="font-mono text-primary">{req.requestNumber}</span>
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">
                            سفارش: <Link href={routes.account.orders.detail(req.orderId)} className="font-mono hover:underline" dir="ltr">#{req.orderNumber}</Link>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20">
                            مرجوعی کالا
                          </span>

                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(req.status)}`}>
                            {RETURN_STATUS_LABELS[req.status] || req.status}
                          </span>
                        </div>
                      </div>

                      {/* Card Body - Items Preview */}
                      <div className="flex items-center gap-3">
                        {firstItem && (
                          <div className="relative w-16 h-16 rounded-xl bg-surface-muted overflow-hidden shrink-0">
                            <Image src={firstItem.productImage} alt={firstItem.productTitle} fill className="object-cover" />
                          </div>
                        )}

                        <div className="flex-1 space-y-1 min-w-0 text-xs">
                          <h3 className="font-bold text-foreground truncate">{firstItem?.productTitle || "کالای سفارش"}</h3>
                          {firstItem?.variantDisplay && (
                            <p className="text-muted-foreground text-[11px]">
                              تنوع: {firstItem.variantDisplay}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <span>تعداد: {firstItem?.quantity} عدد</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(req.createdAt).toLocaleDateString("fa-IR")}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="flex items-center justify-between pt-3 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">مبلغ استرداد:</span>
                          <span className="font-bold text-primary">{formatPrice(req.refund?.amount || 0)}</span>
                          <TomanIcon className="w-3.5 h-3.5 text-primary" />
                        </div>

                        <Link
                          href={routes.account.returns.detail(req.id)}
                          className="inline-flex items-center gap-1 font-bold text-primary hover:underline text-xs"
                        >
                          <span>جزئیات و پیگیری</span>
                          <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="هنوز درخواست مرجوعی ندارید"
                description="در صورت نیاز می‌توانید از بخش جزئیات سفارش‌های تحویل شده، درخواست مرجوعی ثبت کنید."
                actionLabel="ایجاد مرجوعی"
                href={routes.account.orders.list}
                icon={<RotateCcw className="w-7 h-7 text-muted-foreground" />}
              />
            )}
          </>
        )}
      </Container>
    </div>
  );
}
