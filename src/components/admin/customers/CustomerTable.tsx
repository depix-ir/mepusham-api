"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CustomerAccount } from "@/lib/customer/customerService";
import { CustomerStatusBadge } from "./CustomerStatusBadge";
import { formatPrice } from "@/lib/formatting/currency";
import { routes } from "@/lib/routes";
import { Eye, UserX, UserCheck, ShoppingBag, ArrowUpRight } from "lucide-react";
import { TomanIcon } from "@/components/icons";

interface CustomerTableProps {
  customers: CustomerAccount[];
  onToggleStatus: (customer: CustomerAccount) => void;
}

export function CustomerTable({ customers, onToggleStatus }: CustomerTableProps) {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-2xs">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-surface-subtle/60 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              <th className="py-3.5 px-4">مشتری</th>
              <th className="py-3.5 px-4">شماره موبایل</th>
              <th className="py-3.5 px-4 text-center">وضعیت</th>
              <th className="py-3.5 px-4 text-center">سفارش‌ها</th>
              <th className="py-3.5 px-4 text-left">مجموع خرید</th>
              <th className="py-3.5 px-4">آخرین سفارش</th>
              <th className="py-3.5 px-4 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs text-foreground">
            {customers.map((c) => {
              const initials = (c.firstName[0] || "") + (c.lastName[0] || "");

              return (
                <tr key={c.id} className="hover:bg-surface-subtle/40 transition-colors group">
                  {/* Customer Cell */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 uppercase">
                        {initials || "C"}
                      </div>
                      <div className="flex flex-col">
                        <Link
                          href={routes.admin.customerDetail(c.id)}
                          className="font-bold text-foreground hover:text-primary transition-colors text-sm"
                        >
                          {c.fullName}
                        </Link>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          عضویت: {c.createdAt}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="py-3.5 px-4 font-mono dir-ltr text-right text-foreground/80">
                    {c.phone}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center">
                    <CustomerStatusBadge status={c.status} />
                  </td>

                  {/* Orders Count */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-bold text-foreground bg-surface-subtle px-2.5 py-1 rounded-full text-xs">
                      {c.ordersCount}
                    </span>
                  </td>

                  {/* Purchase Total */}
                  <td className="py-3.5 px-4 text-left font-bold text-foreground">
                    <div className="flex items-center justify-end gap-1.5">
                      <span>{formatPrice(c.totalSpent)}</span>
                      <TomanIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  </td>

                  {/* Last Order */}
                  <td className="py-3.5 px-4">
                    {c.lastOrderNumber ? (
                      <Link
                        href={routes.admin.orders}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>#{c.lastOrderNumber}</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">-</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Link
                        href={routes.admin.customerDetail(c.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="مشاهده جزئیات مشتری"
                        aria-label={`مشاهده جزئیات مشتری ${c.fullName}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => onToggleStatus(c)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          c.status === "active"
                            ? "text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                            : "text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50"
                        }`}
                        title={c.status === "active" ? "غیرفعال کردن مشتری" : "فعال کردن مشتری"}
                        aria-label={`${c.status === "active" ? "غیرفعال کردن" : "فعال کردن"} ${c.fullName}`}
                      >
                        {c.status === "active" ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Compact Cards List */}
      <div className="lg:hidden divide-y divide-border">
        {customers.map((c) => {
          const initials = (c.firstName[0] || "") + (c.lastName[0] || "");

          return (
            <div key={c.id} className="p-4 space-y-3 bg-surface hover:bg-surface-subtle/30 transition-colors">
              {/* Header Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 uppercase">
                    {initials || "C"}
                  </div>
                  <div>
                    <Link
                      href={routes.admin.customerDetail(c.id)}
                      className="font-bold text-foreground text-sm hover:text-primary transition-colors block"
                    >
                      {c.fullName}
                    </Link>
                    <span className="text-[11px] text-muted-foreground font-mono dir-ltr block">
                      {c.phone}
                    </span>
                  </div>
                </div>

                <CustomerStatusBadge status={c.status} />
              </div>

              {/* Data Row */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-surface-subtle/60 p-2.5 rounded-xl border border-border/60">
                <div>
                  <span className="text-muted-foreground text-[10px] block">سفارش‌ها:</span>
                  <span className="font-bold text-foreground">{c.ordersCount} سفارش</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">مجموع خرید:</span>
                  <div className="flex items-center gap-1 font-bold text-foreground mt-0.5">
                    <span>{formatPrice(c.totalSpent)}</span>
                    <TomanIcon className="w-3 h-3 text-muted-foreground" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <div className="text-[11px] text-muted-foreground">
                  {c.lastOrderNumber ? (
                    <span className="inline-flex items-center gap-1">
                      آخرین سفارش:
                      <strong className="text-foreground">#{c.lastOrderNumber}</strong>
                    </span>
                  ) : (
                    <span>بدون سفارش ثبت‌شده</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleStatus(c)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      c.status === "active"
                        ? "text-rose-600 border-rose-200 bg-rose-50/50 hover:bg-rose-100"
                        : "text-emerald-600 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100"
                    }`}
                  >
                    {c.status === "active" ? "غیرفعال‌سازی" : "فعال‌سازی"}
                  </button>

                  <Link
                    href={routes.admin.customerDetail(c.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-colors"
                  >
                    <span>مشاهده</span>
                    <Eye className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
