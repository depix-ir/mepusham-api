import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ReturnRequest } from "@/types/return";
import {
  ReturnStatusBadge,
  RequestTypeBadge,
  ReturnReasonBadge,
} from "./ReturnStatusBadge";
import { Eye, ArrowLeft, RefreshCw, AlertCircle, Image as ImageIcon } from "lucide-react";
import { formatToman } from "@/lib/formatting/currency";

interface ReturnsTableProps {
  requests: ReturnRequest[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function ReturnsTable({ requests, isLoading, onRefresh }: ReturnsTableProps) {
  if (isLoading) {
    return (
      <div className="bg-background border border-border rounded-lg p-6 space-y-4 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-surface-subtle rounded-md w-full" />
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-background border border-border rounded-lg p-12 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-surface-subtle flex items-center justify-center text-muted-foreground mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">
          درخواستی برای مرجوعی یا تعویض یافت نشد
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mb-4">
          هیچ درخواستی مطابق با فیلترها و عبارت جستجوی انتخابی پیدا نشد.
        </p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary border border-primary/30 rounded-md hover:bg-primary/5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>بازنشانی نتایج</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View (lg and above) */}
      <div className="hidden lg:block bg-background border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-surface-subtle text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-4 py-3">شماره درخواست / تاریخ</th>
                <th className="px-4 py-3">شماره سفارش</th>
                <th className="px-4 py-3">مشتری</th>
                <th className="px-4 py-3">نوع</th>
                <th className="px-4 py-3">کالاهای درخواستی</th>
                <th className="px-4 py-3">دلیل</th>
                <th className="px-4 py-3">وضعیت</th>
                <th className="px-4 py-3">مبلغ بازپرداخت</th>
                <th className="px-4 py-3 text-left">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.map((req) => {
                const firstItem = req.items[0];
                const totalItemCount = req.items.reduce((s, i) => s + i.quantity, 0);

                return (
                  <tr
                    key={req.id}
                    className="hover:bg-surface-subtle/50 transition-colors group"
                  >
                    {/* Request Number & Date */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-bold text-foreground">
                        {req.requestNumber}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {new Date(req.createdAt).toLocaleDateString("fa-IR")}
                      </div>
                    </td>

                    {/* Order Number */}
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-primary">
                      <Link
                        href={`/admin/orders/${req.orderId}`}
                        className="hover:underline"
                      >
                        #{req.orderNumber}
                      </Link>
                    </td>

                    {/* Customer Info */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-foreground">
                        {req.customerName}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 dir-ltr text-right">
                        {req.customerPhone}
                      </div>
                    </td>

                    {/* Request Type */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <RequestTypeBadge type={req.type} />
                    </td>

                    {/* Items */}
                    <td className="px-4 py-3 max-w-xs">
                      {firstItem ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded bg-surface-subtle relative overflow-hidden shrink-0 border border-border">
                            {firstItem.productImage ? (
                              <Image
                                src={firstItem.productImage}
                                alt={firstItem.productTitle}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-medium text-foreground max-w-[140px]" title={firstItem.productTitle}>
                              {firstItem.productTitle}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate">
                              {firstItem.variantDisplay ? firstItem.variantDisplay : `تعداد: ${firstItem.quantity}`}
                              {req.items.length > 1 && ` (+${req.items.length - 1} کالا)`}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>

                    {/* Reason */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <ReturnReasonBadge reason={req.reason} />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <ReturnStatusBadge status={req.status} />
                    </td>

                    {/* Refund Amount */}
                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-foreground">
                      {req.type === "return" ? (
                        formatToman(req.refund?.amount || 0)
                      ) : (
                        <span className="text-muted-foreground font-normal text-[11px]">
                          تعویض پایاپای
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 whitespace-nowrap text-left">
                      <Link
                        href={`/admin/returns/${req.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-surface-subtle text-foreground hover:bg-primary hover:text-primary-foreground border border-border rounded-md transition-colors"
                      >
                        <span>بررسی و مدیریت</span>
                        <ArrowLeft className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List (Below lg breakpoint) */}
      <div className="lg:hidden space-y-3">
        {requests.map((req) => {
          const firstItem = req.items[0];

          return (
            <div
              key={req.id}
              className="bg-background border border-border rounded-lg p-3.5 space-y-3 shadow-2xs"
            >
              {/* Header: Request ID, Type badge, Status */}
              <div className="flex items-center justify-between pb-2.5 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-foreground">
                    {req.requestNumber}
                  </span>
                  <RequestTypeBadge type={req.type} />
                </div>
                <ReturnStatusBadge status={req.status} />
              </div>

              {/* Order & Customer info */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">شماره سفارش:</span>
                  <Link
                    href={`/admin/orders/${req.orderId}`}
                    className="font-medium text-primary hover:underline"
                  >
                    #{req.orderNumber}
                  </Link>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">نام مشتری:</span>
                  <span className="font-medium text-foreground">{req.customerName}</span>
                </div>
              </div>

              {/* Item Preview */}
              {firstItem && (
                <div className="flex items-center gap-2.5 bg-surface-subtle/70 p-2 rounded-md border border-border/50">
                  <div className="w-10 h-10 rounded bg-background relative overflow-hidden shrink-0 border border-border">
                    {firstItem.productImage ? (
                      <Image
                        src={firstItem.productImage}
                        alt={firstItem.productTitle}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <ImageIcon className=" text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 text-xs">
                    <div className="font-medium text-foreground truncate">
                      {firstItem.productTitle}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {firstItem.variantDisplay || `تعداد: ${firstItem.quantity}`}
                      {req.items.length > 1 && ` (+${req.items.length - 1} کالای دیگر)`}
                    </div>
                  </div>
                </div>
              )}

              {/* Reason & Amount */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div>
                  <span className="text-muted-foreground text-[11px] ml-1">دلیل:</span>
                  <ReturnReasonBadge reason={req.reason} />
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground text-[11px] block">مبلغ:</span>
                  <span className="font-bold text-foreground">
                    {req.type === "return"
                      ? formatToman(req.refund?.amount || 0)
                      : "تعویض پایاپای"}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-border/80 flex justify-end">
                <Link
                  href={`/admin/returns/${req.id}`}
                  className="w-full text-center py-2 px-3 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>مشاهده جزئیات و مدیریت</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
