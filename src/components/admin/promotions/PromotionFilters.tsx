"use client";

import React, { useState } from "react";
import { DiscountStatus, DiscountType, FreeShippingScope } from "@/types/promotion";
import { Filter, X, Search, RotateCcw, SlidersHorizontal } from "lucide-react";

export interface PromotionFilterState {
  search: string;
  status: DiscountStatus | "all";
  type: DiscountType | "all";
  scope: FreeShippingScope | "all";
  sortBy: "newest" | "oldest" | "highestValue" | "highestUsage";
}

interface PromotionFiltersProps {
  filters: PromotionFilterState;
  onChange: (filters: PromotionFilterState) => void;
  isFreeShipping?: boolean;
}

export function PromotionFilters({
  filters,
  onChange,
  isFreeShipping = false,
}: PromotionFiltersProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Count active filters (excluding default values)
  const activeCount = [
    filters.status !== "all",
    filters.type !== "all",
    filters.scope !== "all",
    filters.sortBy !== "newest",
  ].filter(Boolean).length;

  const handleReset = () => {
    onChange({
      search: filters.search,
      status: "all",
      type: "all",
      scope: "all",
      sortBy: "newest",
    });
  };

  const filterContent = (
    <div className="flex flex-col gap-4 text-xs font-semibold">
      {/* Status Filter */}
      <div className="flex flex-col gap-1.5">
        <label className="text-muted-foreground">وضعیت</label>
        <select
          value={filters.status}
          onChange={(e) =>
            onChange({ ...filters, status: e.target.value as DiscountStatus | "all" })
          }
          className="h-9 px-3 bg-surface-subtle border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
        >
          <option value="all">همه وضعیت‌ها</option>
          <option value="active">فعال</option>
          <option value="scheduled">زمان‌بندی‌شده</option>
          <option value="expired">منقضی‌شده</option>
          <option value="disabled">غیرفعال</option>
        </select>
      </div>

      {/* Type Filter (Discounts only) */}
      {!isFreeShipping && (
        <div className="flex flex-col gap-1.5">
          <label className="text-muted-foreground">نوع تخفیف</label>
          <select
            value={filters.type}
            onChange={(e) =>
              onChange({ ...filters, type: e.target.value as DiscountType | "all" })
            }
            className="h-9 px-3 bg-surface-subtle border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
          >
            <option value="all">همه انواع</option>
            <option value="percentage">درصدی</option>
            <option value="fixed">مبلغ ثابت</option>
          </select>
        </div>
      )}

      {/* Scope Filter */}
      <div className="flex flex-col gap-1.5">
        <label className="text-muted-foreground">محدوده اعمال</label>
        <select
          value={filters.scope}
          onChange={(e) =>
            onChange({ ...filters, scope: e.target.value as FreeShippingScope | "all" })
          }
          className="h-9 px-3 bg-surface-subtle border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
        >
          <option value="all">همه محدوده‌ها</option>
          <option value="store">کل فروشگاه</option>
          <option value="products">محصولات مشخص</option>
          <option value="categories">دسته‌بندی‌ها</option>
          <option value="campaign">کمپین</option>
        </select>
      </div>

      {/* Sort Filter */}
      <div className="flex flex-col gap-1.5">
        <label className="text-muted-foreground">مرتب‌سازی</label>
        <select
          value={filters.sortBy}
          onChange={(e) =>
            onChange({
              ...filters,
              sortBy: e.target.value as PromotionFilterState["sortBy"],
            })
          }
          className="h-9 px-3 bg-surface-subtle border border-border rounded-xl text-foreground focus:outline-none focus:border-primary"
        >
          <option value="newest">جدیدترین</option>
          <option value="oldest">قدیمی‌ترین</option>
          <option value="highestValue">بیشترین تخفیف / ارزش</option>
          <option value="highestUsage">بیشترین استفاده</option>
        </select>
      </div>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={handleReset}
          className="mt-2 text-rose-600 hover:underline text-xs font-bold flex items-center justify-center gap-1.5 py-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>پاک کردن فیلترها</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder={
            isFreeShipping
              ? "جستجو در عنوان، کمپین یا محصول..."
              : "جستجو در عنوان تخفیف، کمپین، محصول یا SKU..."
          }
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full h-10 pr-10 pl-3 text-xs md:text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground shadow-2xs"
        />
        {filters.search && (
          <button
            onClick={() => onChange({ ...filters, search: "" })}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Desktop Filter Bar Controls */}
      <div className="hidden lg:flex items-center gap-2">
        <select
          value={filters.status}
          onChange={(e) =>
            onChange({ ...filters, status: e.target.value as DiscountStatus | "all" })
          }
          className="h-10 px-3 bg-background border border-border rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary"
        >
          <option value="all">همه وضعیت‌ها</option>
          <option value="active">فعال</option>
          <option value="scheduled">زمان‌بندی‌شده</option>
          <option value="expired">منقضی‌شده</option>
          <option value="disabled">غیرفعال</option>
        </select>

        {!isFreeShipping && (
          <select
            value={filters.type}
            onChange={(e) =>
              onChange({ ...filters, type: e.target.value as DiscountType | "all" })
            }
            className="h-10 px-3 bg-background border border-border rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary"
          >
            <option value="all">همه انواع</option>
            <option value="percentage">درصدی</option>
            <option value="fixed">مبلغ ثابت</option>
          </select>
        )}

        <select
          value={filters.sortBy}
          onChange={(e) =>
            onChange({
              ...filters,
              sortBy: e.target.value as PromotionFilterState["sortBy"],
            })
          }
          className="h-10 px-3 bg-background border border-border rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary"
        >
          <option value="newest">جدیدترین</option>
          <option value="oldest">قدیمی‌ترین</option>
          <option value="highestValue">بیشترین تخفیف / ارزش</option>
          <option value="highestUsage">بیشترین استفاده</option>
        </select>

        {activeCount > 0 && (
          <button
            onClick={handleReset}
            className="h-10 px-3 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors shrink-0"
          >
            پاک کردن ({activeCount.toLocaleString("fa-IR")})
          </button>
        )}
      </div>

      {/* Mobile & Tablet Filter Drawer Trigger Button */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="w-full sm:w-auto h-10 px-4 bg-background border border-border rounded-xl text-xs font-bold text-foreground flex items-center justify-center gap-2 hover:bg-surface-subtle transition-colors shadow-2xs"
        >
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <span>فیلترها</span>
          {activeCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {activeCount.toLocaleString("fa-IR")}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Drawer Filter Sheet */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-background border-t border-border rounded-t-3xl p-5 shadow-2xl flex flex-col gap-4 max-h-[80vh] overflow-y-auto dir-rtl">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-base text-foreground">
                  فیلترهای پیشرفته
                </h3>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {filterContent}

            <div className="pt-2 border-t border-border flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="flex-1 h-10 font-bold text-xs bg-primary text-primary-foreground rounded-xl"
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
