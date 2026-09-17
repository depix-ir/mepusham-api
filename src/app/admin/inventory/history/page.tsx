"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  History,
  RotateCcw,
  Calendar,
  Package,
  User,
  Tag,
} from "lucide-react";

import { getInventoryHistoryLogs } from "@/lib/inventory/inventoryService";
import { InventoryHistoryLog } from "@/lib/inventory/inventoryTypes";

const formatDate = (dateString: string) => {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return dateString;
  }
};

export default function InventoryHistoryPage() {
  const [logs] = useState<InventoryHistoryLog[]>(() => getInventoryHistoryLogs());
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase().trim();
    return logs.filter(
      (log) =>
        log.productTitle.toLowerCase().includes(q) ||
        log.variantDisplay.toLowerCase().includes(q) ||
        log.sku?.toLowerCase().includes(q) ||
        log.reason.toLowerCase().includes(q) ||
        log.actor.toLowerCase().includes(q)
    );
  }, [logs, searchQuery]);

  return (
    <div className="space-y-6 pb-12 dir-rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/inventory"
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
              title="بازگشت به موجودی"
            >
              <ArrowRight className="" />
            </Link>
            <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
              تاریخچه تغییرات موجودی
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1 mr-8 leading-relaxed">
            ثبت و مشاهده دقیق وقایع افزایش، کاهش، فروش و اصلاح موجودی کالاها
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-background p-4 rounded-md border border-border flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="جستجو در محصول، SKU، علت یا کاربر..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pr-9 pl-4 bg-surface-subtle border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* History Table */}
      <div className="bg-background border border-border rounded-md overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground space-y-2">
            <History className="w-8 h-8 mx-auto text-muted-foreground/60" />
            <p className="font-bold">هیچ رکوردی پیدا نشد.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-surface-subtle border-b border-border text-muted-foreground text-[11px] font-semibold">
                  <th className="py-3 px-3">زمان</th>
                  <th className="py-3 px-3">محصول</th>
                  <th className="py-3 px-3">واریانت</th>
                  <th className="py-3 px-3">SKU</th>
                  <th className="py-3 px-3 text-center">موجودی قبلی</th>
                  <th className="py-3 px-3 text-center">تغییر</th>
                  <th className="py-3 px-3 text-center">موجودی جدید</th>
                  <th className="py-3 px-3">دلیل</th>
                  <th className="py-3 px-3">اپراتور</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredLogs.map((log) => {
                  const isPositive = log.changeAmount > 0;
                  const isNegative = log.changeAmount < 0;

                  return (
                    <tr key={log.id} className="hover:bg-surface-subtle/50 transition-colors">
                      <td className="py-3 px-3 text-[11px] text-muted-foreground whitespace-nowrap">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="py-3 px-3 font-bold text-foreground">
                        {log.productTitle}
                      </td>
                      <td className="py-3 px-3 font-semibold text-primary">
                        {log.variantDisplay}
                      </td>
                      <td className="py-3 px-3 font-mono text-muted-foreground dir-ltr text-right">
                        {log.sku || "—"}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-muted-foreground">
                        {log.previousStock}
                      </td>
                      <td className="py-3 px-3 text-center font-extrabold">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                            isPositive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isNegative
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {isPositive ? `+${log.changeAmount}` : log.changeAmount}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-black text-foreground">
                        {log.newStock}
                      </td>
                      <td className="py-3 px-3 font-medium text-foreground">
                        {log.reason}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground text-[11px]">
                        {log.actor}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
