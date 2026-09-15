"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ReturnRequest, ReturnRequestFilters } from "@/types/return";
import { returnService } from "@/lib/returns/returnService";
import { ReturnsSummary } from "@/components/admin/returns/ReturnsSummary";
import { ReturnsFilters } from "@/components/admin/returns/ReturnsFilters";
import { ReturnsTable } from "@/components/admin/returns/ReturnsTable";
import { RotateCcw, ChevronRight, ChevronLeft, RefreshCw } from "lucide-react";

function AdminReturnsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse filters from URL search params
  const typeParam = (searchParams.get("type") as any) || "all";
  const statusParam = searchParams.get("status") || "all";
  const reasonParam = (searchParams.get("reason") as any) || "all";
  const dateRangeParam = (searchParams.get("dateRange") as any) || "all";
  const actionRequiredParam = searchParams.get("actionRequired") === "true";
  const queryParam = searchParams.get("q") || "";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);

  const [filters, setFilters] = useState<ReturnRequestFilters>({
    type: typeParam,
    status: statusParam,
    reason: reasonParam,
    dateRange: dateRangeParam,
    actionRequiredOnly: actionRequiredParam,
    searchQuery: queryParam,
    page: pageParam,
    pageSize: 10,
  });

  const [allRequests, setAllRequests] = useState<ReturnRequest[]>([]);
  const [data, setData] = useState<{
    items: ReturnRequest[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Sync state with URL params
  const updateUrlParams = useCallback(
    (newFilters: ReturnRequestFilters) => {
      const params = new URLSearchParams();
      if (newFilters.type && newFilters.type !== "all") params.set("type", newFilters.type);
      if (newFilters.status && newFilters.status !== "all") params.set("status", newFilters.status);
      if (newFilters.reason && newFilters.reason !== "all") params.set("reason", newFilters.reason);
      if (newFilters.dateRange && newFilters.dateRange !== "all") params.set("dateRange", newFilters.dateRange);
      if (newFilters.actionRequiredOnly) params.set("actionRequired", "true");
      if (newFilters.searchQuery) params.set("q", newFilters.searchQuery);
      if (newFilters.page && newFilters.page > 1) params.set("page", newFilters.page.toString());

      router.replace(`/admin/returns?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  const fetchRequests = useCallback(() => {
    setIsLoading(true);
    try {
      const all = returnService.getReturnRequests().items;
      setAllRequests(all);

      const filtered = returnService.getReturnRequests(filters);
      setData(filtered);
    } catch (e) {
      console.error("Failed to load return requests:", e);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleFilterChange = (updated: Partial<ReturnRequestFilters>) => {
    const nextFilters = { ...filters, ...updated };
    setFilters(nextFilters);
    updateUrlParams(nextFilters);
  };

  const handleResetFilters = () => {
    const reset: ReturnRequestFilters = {
      type: "all",
      status: "all",
      reason: "all",
      dateRange: "all",
      actionRequiredOnly: false,
      searchQuery: "",
      page: 1,
      pageSize: 10,
    };
    setFilters(reset);
    updateUrlParams(reset);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-primary shrink-0" />
            <span>مرجوعی و تعویض کالا</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            مدیریت درخواست‌های مرجوعی، تعویض و بازپرداخت سفارش‌ها
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground bg-background border border-border rounded-md hover:bg-surface-subtle transition-colors shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
          <span>به‌روزرسانی</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <ReturnsSummary requests={allRequests} />

      {/* Filters & Search Toolbar */}
      <ReturnsFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* Requests Table / Cards */}
      <ReturnsTable
        requests={data.items}
        isLoading={isLoading}
        onRefresh={fetchRequests}
      />

      {/* Pagination Controls */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border text-xs">
          <span className="text-muted-foreground">
            نمایش {data.items.length} از {data.total} درخواست ثبت شده
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleFilterChange({ page: data.page - 1 })}
              disabled={data.page <= 1}
              className="p-1.5 rounded-md border border-border bg-background text-foreground hover:bg-surface-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="صفحه قبلی"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="font-semibold px-2">
              صفحه {data.page.toLocaleString("fa-IR")} از {data.totalPages.toLocaleString("fa-IR")}
            </span>

            <button
              onClick={() => handleFilterChange({ page: data.page + 1 })}
              disabled={data.page >= data.totalPages}
              className="p-1.5 rounded-md border border-border bg-background text-foreground hover:bg-surface-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="صفحه بعدی"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminReturnsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-muted-foreground">
          در حال بارگذاری صفحه مرجوعی‌ها...
        </div>
      }
    >
      <AdminReturnsContent />
    </Suspense>
  );
}
