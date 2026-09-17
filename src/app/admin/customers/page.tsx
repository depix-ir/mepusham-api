"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  customerService,
  CustomerAccount,
  CustomerStatus,
} from "@/lib/customer/customerService";
import { CustomerTable } from "@/components/admin/customers/CustomerTable";
import { CustomerFiltersToolbar } from "@/components/admin/customers/CustomerFiltersToolbar";
import { DeactivateConfirmationModal } from "@/components/admin/customers/DeactivateConfirmationModal";
import { useToast } from "@/components/ui/Toast";
import {
  Users,
  UserCheck,
  UserX,
  ShoppingBag,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

export default function AdminCustomersPage() {
  const { showToast } = useToast();

  // Version counter to force state re-evaluation after mutations
  const [dataVersion, setDataVersion] = useState(0);

  // Filter States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | "all">("all");
  const [purchaseHistoryFilter, setPurchaseHistoryFilter] = useState<
    "all" | "has_orders" | "no_orders"
  >("all");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "most_orders" | "highest_spend"
  >("newest");
  const [page, setPage] = useState(1);

  // Status Change Confirmation Modal State
  const [selectedCustomerForStatus, setSelectedCustomerForStatus] = useState<CustomerAccount | null>(null);

  // Fetch Customers Data
  const customersData = useMemo(() => {
    return customerService.getCustomers({
      search,
      status: statusFilter,
      purchaseHistory: purchaseHistoryFilter,
      sortBy,
      page,
      pageSize: 10,
    });
    // eslint-disable-next-deps
  }, [search, statusFilter, purchaseHistoryFilter, sortBy, page, dataVersion]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, purchaseHistoryFilter, sortBy]);

  const hasActiveFilters =
    Boolean(search.trim()) ||
    statusFilter !== "all" ||
    purchaseHistoryFilter !== "all" ||
    sortBy !== "newest";

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPurchaseHistoryFilter("all");
    setSortBy("newest");
    setPage(1);
  };

  const handleConfirmToggleStatus = () => {
    if (!selectedCustomerForStatus) return;

    try {
      const newStatus = customerService.toggleCustomerStatus(selectedCustomerForStatus.id);
      setDataVersion((v) => v + 1);
      showToast(
        newStatus === "active"
          ? `حساب کاربری «${selectedCustomerForStatus.fullName}» با موفقیت فعال گردید.`
          : `حساب کاربری «${selectedCustomerForStatus.fullName}» غیرفعال شد.`,
        "success"
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "خطا در تغییر وضعیت حساب کاربر";
      showToast(msg, "error");
    } finally {
      setSelectedCustomerForStatus(null);
    }
  };

  const { items: customers, totalPages, page: currentPage, summaryStats } = customersData;

  return (
    <div className="space-y-6 pb-12">
      {/* Admin Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-2xs">
        <div className="space-y-1">
          <h1 className="text-base sm:text-xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span>مدیریت مشتریان</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            بررسی و مدیریت حساب‌های کاربری، سوابق سفارش و فعالیت مشتریان
          </p>
        </div>
      </div>

      {/* Compact Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Customers */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter("all");
            setPurchaseHistoryFilter("all");
          }}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
            statusFilter === "all" && purchaseHistoryFilter === "all"
              ? "bg-primary/5 border-primary shadow-2xs"
              : "bg-surface border-border hover:border-border-muted"
          }`}
        >
          <div className="flex items-center justify-between text-primary mb-1">
            <span className="text-[11px] font-medium text-muted-foreground">کل مشتریان</span>
            <Users className="w-3.5 h-3.5" />
          </div>
          <span className="text-lg font-bold text-foreground block">{summaryStats.totalCustomers}</span>
        </button>

        {/* Active Customers */}
        <button
          type="button"
          onClick={() => setStatusFilter("active")}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
            statusFilter === "active"
              ? "bg-emerald-500/10 border-emerald-500 shadow-2xs"
              : "bg-surface border-border hover:border-border-muted"
          }`}
        >
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-[11px] font-medium text-muted-foreground">مشتریان فعال</span>
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <span className="text-lg font-bold text-foreground block">{summaryStats.activeCustomers}</span>
        </button>

        {/* Inactive Customers */}
        <button
          type="button"
          onClick={() => setStatusFilter("inactive")}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
            statusFilter === "inactive"
              ? "bg-rose-500/10 border-rose-500 shadow-2xs"
              : "bg-surface border-border hover:border-border-muted"
          }`}
        >
          <div className="flex items-center justify-between text-rose-600 mb-1">
            <span className="text-[11px] font-medium text-muted-foreground">مشتریان غیرفعال</span>
            <UserX className="w-3.5 h-3.5" />
          </div>
          <span className="text-lg font-bold text-foreground block">{summaryStats.inactiveCustomers}</span>
        </button>

        {/* Customers with Orders */}
        <button
          type="button"
          onClick={() => setPurchaseHistoryFilter("has_orders")}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer ${
            purchaseHistoryFilter === "has_orders"
              ? "bg-blue-500/10 border-blue-500 shadow-2xs"
              : "bg-surface border-border hover:border-border-muted"
          }`}
        >
          <div className="flex items-center justify-between text-blue-600 mb-1">
            <span className="text-[11px] font-medium text-muted-foreground">دارای سفارش</span>
            <ShoppingBag className="w-3.5 h-3.5" />
          </div>
          <span className="text-lg font-bold text-foreground block">{summaryStats.customersWithOrders}</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <CustomerFiltersToolbar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        purchaseHistoryFilter={purchaseHistoryFilter}
        onPurchaseHistoryFilterChange={setPurchaseHistoryFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Customer List / Table */}
      {customers.length > 0 ? (
        <div className="space-y-4">
          <CustomerTable
            customers={customers}
            onToggleStatus={(c) => setSelectedCustomerForStatus(c)}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-surface border border-border rounded-2xl p-3 px-4 shadow-2xs text-xs">
              <span className="text-muted-foreground font-medium">
                صفحه {currentPage} از {totalPages}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 border border-border rounded-lg hover:bg-surface-subtle disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                  aria-label="صفحه قبلی"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                  <button
                    key={pNum}
                    type="button"
                    onClick={() => setPage(pNum)}
                    className={`min-w-8 h-8 px-2 rounded-lg font-bold transition-colors cursor-pointer ${
                      pNum === currentPage
                        ? "bg-primary text-primary-foreground"
                        : "border border-border hover:bg-surface-subtle text-foreground"
                    }`}
                  >
                    {pNum}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 border border-border rounded-lg hover:bg-surface-subtle disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                  aria-label="صفحه بعدی"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 border border-dashed border-border rounded-2xl text-center space-y-3 bg-surface-subtle/30">
          <div className="w-12 h-12 rounded-full bg-surface-subtle text-muted-foreground mx-auto flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">مشتری‌ای با این مشخصات پیدا نشد.</p>
            <p className="text-xs text-muted-foreground">
              با فیلترها و عبارت جستجوی فعلی هیچ نتیجه‌ای یافت نشد.
            </p>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer"
            >
              پاک کردن فیلترها
            </button>
          )}
        </div>
      )}

      {/* Deactivation Confirmation Modal */}
      {selectedCustomerForStatus && (
        <DeactivateConfirmationModal
          isOpen={!!selectedCustomerForStatus}
          customerName={selectedCustomerForStatus.fullName}
          currentStatus={selectedCustomerForStatus.status}
          onClose={() => setSelectedCustomerForStatus(null)}
          onConfirm={handleConfirmToggleStatus}
        />
      )}
    </div>
  );
}
