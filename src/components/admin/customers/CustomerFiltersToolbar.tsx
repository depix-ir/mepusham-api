"use client";

import React, { useState } from "react";
import { CustomerStatus } from "@/lib/customer/customerService";
import { Search, Filter, X, RotateCcw } from "lucide-react";

interface CustomerFiltersToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: CustomerStatus | "all";
  onStatusFilterChange: (value: CustomerStatus | "all") => void;
  purchaseHistoryFilter: "all" | "has_orders" | "no_orders";
  onPurchaseHistoryFilterChange: (value: "all" | "has_orders" | "no_orders") => void;
  sortBy: "newest" | "oldest" | "most_orders" | "highest_spend";
  onSortByChange: (value: "newest" | "oldest" | "most_orders" | "highest_spend") => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function CustomerFiltersToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  purchaseHistoryFilter,
  onPurchaseHistoryFilterChange,
  sortBy,
  onSortByChange,
  onClearFilters,
  hasActiveFilters,
}: CustomerFiltersToolbarProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 space-y-3 shadow-2xs">
      {/* Search & Main Row */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="جستجو بین نام یا شماره موبایل مشتری..."
            className="w-full h-10 bg-surface-subtle border border-border rounded-xl pr-10 pl-9 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
              title="پاک کردن جستجو"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mobile Filter Toggle Button */}
        <div className="flex md:hidden items-center gap-2 w-full">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="flex-1 h-10 bg-surface-subtle border border-border rounded-xl px-3 flex items-center justify-center gap-2 text-xs font-bold text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <Filter className="w-4 h-4 text-primary" />
            <span>فیلترها و مرتب‌سازی</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-primary" />
            )}
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="h-10 px-3 border border-border rounded-xl text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 font-bold transition-colors cursor-pointer shrink-0"
              title="پاک کردن فیلترها"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Desktop Filter Options */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as CustomerStatus | "all")}
            className="h-10 bg-surface-subtle border border-border rounded-xl px-3 text-xs font-medium text-foreground focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="active">مشتریان فعال</option>
            <option value="inactive">مشتریان غیرفعال</option>
          </select>

          {/* Purchase History Filter */}
          <select
            value={purchaseHistoryFilter}
            onChange={(e) =>
              onPurchaseHistoryFilterChange(e.target.value as "all" | "has_orders" | "no_orders")
            }
            className="h-10 bg-surface-subtle border border-border rounded-xl px-3 text-xs font-medium text-foreground focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="all">همه سوابق خرید</option>
            <option value="has_orders">دارای سفارش</option>
            <option value="no_orders">بدون سفارش</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) =>
              onSortByChange(
                e.target.value as "newest" | "oldest" | "most_orders" | "highest_spend"
              )
            }
            className="h-10 bg-surface-subtle border border-border rounded-xl px-3 text-xs font-medium text-foreground focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="newest">جدیدترین</option>
            <option value="oldest">قدیمی‌ترین</option>
            <option value="most_orders">بیشترین تعداد سفارش</option>
            <option value="highest_spend">بیشترین مبلغ خرید</option>
          </select>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="h-10 px-3 border border-border rounded-xl text-xs font-bold text-rose-600 bg-rose-50/60 hover:bg-rose-100 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>پاک کردن فیلترها</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer / Bottom Sheet */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative bg-surface border-t border-border rounded-t-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto z-10 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="font-bold text-sm text-foreground flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                <span>فیلتر و مرتب‌سازی مشتریان</span>
              </span>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-muted-foreground font-bold mb-1.5">وضعیت حساب</label>
                <select
                  value={statusFilter}
                  onChange={(e) => onStatusFilterChange(e.target.value as CustomerStatus | "all")}
                  className="w-full h-10 bg-surface-subtle border border-border rounded-xl px-3 text-xs font-medium text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="all">همه وضعیت‌ها</option>
                  <option value="active">مشتریان فعال</option>
                  <option value="inactive">مشتریان غیرفعال</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground font-bold mb-1.5">سابقه خرید</label>
                <select
                  value={purchaseHistoryFilter}
                  onChange={(e) =>
                    onPurchaseHistoryFilterChange(e.target.value as "all" | "has_orders" | "no_orders")
                  }
                  className="w-full h-10 bg-surface-subtle border border-border rounded-xl px-3 text-xs font-medium text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="all">همه سوابق خرید</option>
                  <option value="has_orders">دارای سفارش</option>
                  <option value="no_orders">بدون سفارش</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground font-bold mb-1.5">ترتیب نمایش</label>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    onSortByChange(
                      e.target.value as "newest" | "oldest" | "most_orders" | "highest_spend"
                    )
                  }
                  className="w-full h-10 bg-surface-subtle border border-border rounded-xl px-3 text-xs font-medium text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="newest">جدیدترین</option>
                  <option value="oldest">قدیمی‌ترین</option>
                  <option value="most_orders">بیشترین تعداد سفارش</option>
                  <option value="highest_spend">بیشترین مبلغ خرید</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    onClearFilters();
                    setMobileDrawerOpen(false);
                  }}
                  className="flex-1 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                >
                  پاک کردن فیلترها
                </button>
              )}
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="flex-1 py-2.5 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition-colors cursor-pointer"
              >
                اعمال فیلترها
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
