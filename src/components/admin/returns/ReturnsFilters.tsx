import React from "react";
import { ReturnRequestFilters, ReturnReason, RETURN_REASON_LABELS } from "@/types/return";
import { Search, Filter, X, CheckSquare, Square } from "lucide-react";

interface ReturnsFiltersProps {
  filters: ReturnRequestFilters;
  onFilterChange: (updated: Partial<ReturnRequestFilters>) => void;
  onResetFilters: () => void;
}

export function ReturnsFilters({
  filters,
  onFilterChange,
  onResetFilters,
}: ReturnsFiltersProps) {
  const activeTab = filters.type || "all";

  const handleTabClick = (tab: "all" | "return" | "exchange") => {
    onFilterChange({ type: tab, page: 1 });
  };

  const hasActiveFilters =
    (filters.type && filters.type !== "all") ||
    (filters.status && filters.status !== "all") ||
    (filters.reason && filters.reason !== "all") ||
    (filters.dateRange && filters.dateRange !== "all") ||
    filters.actionRequiredOnly ||
    (filters.searchQuery && filters.searchQuery.trim().length > 0);

  return (
    <div className="bg-background border border-border rounded-lg p-4 mb-5 space-y-4">
      {/* Top Bar: Tabs & Search Input */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
        {/* Title Indicator */}
        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <span>لیست درخواست‌های مرجوعی</span>
        </div>

        {/* Abstraction Search Service Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={filters.searchQuery || ""}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value, page: 1 })}
            placeholder="جستجو بر اساس کد درخواست، شماره سفارش، نام یا تلفن مشتری، کد رهگیری..."
            className="w-full pr-9 pl-3 py-1.5 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: "", page: 1 })}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Options Row */}
      <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-border/60 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground font-medium shrink-0 ml-1">
          <Filter className="w-3.5 h-3.5" />
          <span>فیلترها:</span>
        </div>

        {/* Status Filter */}
        <select
          value={filters.status || "all"}
          onChange={(e) => onFilterChange({ status: e.target.value, page: 1 })}
          className="bg-background border border-border rounded-md px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">همه وضعیت‌ها</option>
          <option value="requested">ثبت شده (در انتظار بررسی)</option>
          <option value="approved">تأیید شده</option>
          <option value="in_transit">در مسیر برگشت / ارسال شده</option>
          <option value="received">دریافت شده در انبار</option>
          <option value="inspection">در حال کارشناسی</option>
          <option value="inspection_approved">تأیید کارشناسی</option>
          <option value="refunded">بازپرداخت شده / تکمیل شده</option>
          <option value="rejected">رد شده</option>
          <option value="cancelled">لغو شده</option>
        </select>

        {/* Reason Filter */}
        <select
          value={filters.reason || "all"}
          onChange={(e) =>
            onFilterChange({
              reason: e.target.value as ReturnReason | "all",
              page: 1,
            })
          }
          className="bg-background border border-border rounded-md px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">همه دلایل</option>
          {Object.entries(RETURN_REASON_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        {/* Date Filter */}
        <select
          value={filters.dateRange || "all"}
          onChange={(e) => onFilterChange({ dateRange: e.target.value as any, page: 1 })}
          className="bg-background border border-border rounded-md px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">همه زمان‌ها</option>
          <option value="today">امروز</option>
          <option value="7days">۷ روز اخیر</option>
          <option value="30days">۳۰ روز اخیر</option>
        </select>

        {/* Action Required Toggle */}
        <button
          type="button"
          onClick={() =>
            onFilterChange({
              actionRequiredOnly: !filters.actionRequiredOnly,
              page: 1,
            })
          }
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-colors ${
            filters.actionRequiredOnly
              ? "bg-amber-100 text-amber-900 border-amber-300 font-medium"
              : "bg-background text-foreground border-border hover:bg-surface-subtle"
          }`}
        >
          {filters.actionRequiredOnly ? (
            <CheckSquare className="w-3.5 h-3.5 text-amber-700" />
          ) : (
            <Square className="w-3.5 h-3.5 text-muted-foreground" />
          )}
          <span>فقط موارد نیازمند اقدام</span>
        </button>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 px-2 py-1 text-rose-600 hover:text-rose-700 text-xs font-medium mr-auto transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>پاکسازی فیلترها</span>
          </button>
        )}
      </div>
    </div>
  );
}
