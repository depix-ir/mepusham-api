"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/store/auth/auth.store";
import { returnService } from "@/lib/returns/returnService";
import { ReturnRequest, RETURN_STATUS_LABELS, RequestType } from "@/types/return";
import { Container } from "@/components/ui/Container";
import { AccountPageHeader } from "@/components/account/AccountPageHeader";
import { formatPrice } from "@/lib/formatting/currency";
import { TomanIcon } from "@/components/icons";
import {
  RotateCcw,
  ChevronLeft,
  Package,
  Calendar,
} from "lucide-react";

export default function CustomerReturnsListPage() {
  const { isAuthLoading, isAuthenticated } = useAuth();
  const [requests, setRequests] = useState<ReturnRequest[]>([]);

  useEffect(() => {
    const data = returnService.getReturnRequests();
    setRequests(data.items);
  }, []);

  if (isAuthLoading) {
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
            href="/account"
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
          title="درخواست‌های مرجوعی و تعویض"
          description="مدیریت و پیگیری وضعیت درخواست‌ها"
          icon={RotateCcw}
          backUrl="/account"
          backLabel="بازگشت به حساب کاربری"
        />

        {/* Support Link Header Bar */}
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-border-subtle">
          <span className="text-xs text-muted-foreground">
            تعداد کل درخواست‌ها: {requests.length}
          </span>
          <Link
            href="/support"
            className="text-xs font-medium text-primary hover:underline transition-colors"
          >
            ارتباط با پشتیبانی
          </Link>
        </div>

        {/* Requests List */}
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
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border-subtle text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">
                        کد درخواست: <span dir="ltr" className="font-mono text-primary">{req.requestNumber}</span>
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">
                        سفارش: <Link href={`/orders/${req.orderId}`} className="font-mono hover:underline" dir="ltr">#{req.orderNumber}</Link>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          req.type === "return" ? "bg-primary/10 text-primary border-primary/20" : "bg-purple-500/10 text-purple-700 border-purple-500/20"
                        }`}
                      >
                        {req.type === "return" ? "مرجوعی کالا" : "تعویض کالا"}
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
                  <div className="flex items-center justify-between pt-3 border-t border-border-subtle text-xs">
                    {req.type === "return" ? (
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">مبلغ استرداد:</span>
                        <span className="font-bold text-primary">{formatPrice(req.refund?.amount || 0)}</span>
                        <TomanIcon className="w-3.5 h-3.5 text-primary" />
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-[11px]">
                        جایگزین: <strong className="text-foreground">{req.exchange?.replacementVariantDisplay || "تنوع جدید"}</strong>
                      </div>
                    )}

                    <Link
                      href={`/account/returns/${req.id}`}
                      className="inline-flex items-center gap-1 font-bold text-primary hover:underline text-xs"
                    >
                      <span>جزئیات و پیگیری</span>
                      <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-surface-subtle/50 rounded-2xl p-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-surface-muted text-muted-foreground mx-auto flex items-center justify-center">
              <RotateCcw className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-foreground">هیچ درخواست مرجوعی یا تعویضی ثبت نشده است.</h2>
              <p className="text-xs text-muted-foreground">
                در صورت نیاز می‌توانید از بخش جزئیات سفارش‌های تحویل شده، درخواست مرجوعی ثبت کنید.
              </p>
            </div>
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary-hover transition-colors shadow-xs"
            >
              <Package className="w-4 h-4" />
              <span>مشاهده سفارش‌های من</span>
            </Link>
          </div>
        )}
      </Container>
    </div>
  );
}
