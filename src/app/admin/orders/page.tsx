"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Order, OrderStatus, orderStatusLabels, getNextAdminStatus, canAdminCancelOrder } from "@/types/account";
import { accountService } from "@/lib/account/accountService";
import { formatPrice } from "@/lib/formatting/currency";
import { useToast } from "@/components/ui/Toast";
import { OrderStatusBadge } from "@/components/admin/orders/OrderStatusBadge";
import { AdminOrderDetailDrawer } from "@/components/admin/orders/AdminOrderDetailDrawer";
import { CancelConfirmationModal } from "@/components/admin/orders/CancelConfirmationModal";
import { PrintableOrderSheet } from "@/components/admin/orders/PrintableOrderSheet";
import {
  Search,
  Filter,
  X,
  Printer,
  Ban,
  CheckCircle2,
  Eye,
  ShoppingBag,
  Truck,
  RotateCcw,
  ChevronLeft,
  ChevronDown,
  AlertCircle,
  PackageX,
  MoreVertical,
  SlidersHorizontal,
  Check
} from "lucide-react";

export default function AdminOrdersPage() {
  const { showToast } = useToast();

  // State Management
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string>("all");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);

  // Selection for Bulk Actions
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Drawer & Modal States
  const [activeDrawerOrder, setActiveDrawerOrder] = useState<Order | null>(null);
  const [cancelModalState, setCancelModalState] = useState<{
    isOpen: boolean;
    orderToCancel: Order | null;
    isBulk: boolean;
  }>({
    isOpen: false,
    orderToCancel: null,
    isBulk: false,
  });

  // Printing State
  const [printOrders, setPrintOrders] = useState<Order[]>([]);

  // Fetch Orders on Mount
  const loadOrders = () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const fetched = accountService.getOrders();
      setOrders(fetched);
    } catch (err) {
      console.error("Failed to fetch orders", err);
      setHasError(true);
      showToast("خطا در بارگذاری سفارش‌ها", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Filter & Search Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Search Query (Order Number, Customer Name, Phone, Tracking Code)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesOrderNum = order.orderNumber.toLowerCase().includes(query) || order.id.toLowerCase().includes(query);
        const matchesName = order.shippingAddress.recipientName.toLowerCase().includes(query);
        const matchesPhone = order.shippingAddress.phone.toLowerCase().includes(query);
        const matchesTracking = order.shippingMethod.trackingCode?.toLowerCase().includes(query) ?? false;

        if (!matchesOrderNum && !matchesName && !matchesPhone && !matchesTracking) {
          return false;
        }
      }

      // 2. Status Filter
      if (selectedStatus !== "all" && order.status !== selectedStatus) {
        return false;
      }

      // 3. Shipping Method Filter
      if (
        selectedShippingMethod !== "all" &&
        order.shippingMethod.id !== selectedShippingMethod &&
        order.shippingMethod.title !== selectedShippingMethod
      ) {
        return false;
      }

      return true;
    });
  }, [orders, searchQuery, selectedStatus, selectedShippingMethod]);

  // Handle Order Selection
  const toggleSelectAll = () => {
    if (selectedOrderIds.length === filteredOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map((o) => o.id));
    }
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Status Change Actions
  const handleSingleStatusAdvance = (orderId: string, nextStatus: OrderStatus) => {
    try {
      const updated = accountService.updateOrderStatus(orderId, nextStatus);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      if (activeDrawerOrder?.id === updated.id) {
        setActiveDrawerOrder(updated);
      }
      showToast(`وضعیت سفارش با موفقیت به «${orderStatusLabels[nextStatus]}» تغییر یافت.`, "success");
    } catch (err) {
      showToast("بروز خطا در تغییر وضعیت سفارش", "error");
    }
  };

  const handleBulkStatusAdvance = () => {
    if (selectedOrderIds.length === 0) return;

    try {
      const result = accountService.bulkUpdateOrderStatus(selectedOrderIds);
      setOrders(result.updatedOrders);
      setSelectedOrderIds([]);
      if (result.updatedCount > 0) {
        showToast(
          `وضعیت ${result.updatedCount} سفارش با موفقیت به مرحله بعد ارتقا یافت.`,
          "success"
        );
      } else {
        showToast("هیچ‌یک از سفارش‌های انتخاب‌شده در وضعیت مجاز برای تغییر نبودند.", "info");
      }
    } catch (err) {
      showToast("بروز خطا در ارتقای وضعیت گروهی", "error");
    }
  };

  // Cancellation Actions
  const handleCancelClick = (order: Order) => {
    setCancelModalState({
      isOpen: true,
      orderToCancel: order,
      isBulk: false,
    });
  };

  const handleBulkCancelClick = () => {
    if (selectedOrderIds.length === 0) return;
    setCancelModalState({
      isOpen: true,
      orderToCancel: null,
      isBulk: true,
    });
  };

  const confirmCancelAction = () => {
    if (cancelModalState.isBulk) {
      try {
        const result = accountService.bulkCancelOrders(selectedOrderIds);
        setOrders(result.updatedOrders);
        setSelectedOrderIds([]);
        showToast(`${result.cancelledCount} سفارش با موفقیت لغو شدند.`, "success");
      } catch (err) {
        showToast("بروز خطا در لغو گروهی سفارش‌ها", "error");
      }
    } else if (cancelModalState.orderToCancel) {
      try {
        const updated = accountService.cancelOrder(cancelModalState.orderToCancel.id);
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        if (activeDrawerOrder?.id === updated.id) {
          setActiveDrawerOrder(updated);
        }
        showToast(`سفارش #${updated.orderNumber} با موفقیت لغو شد.`, "success");
      } catch (err) {
        showToast("بروز خطا در لغو سفارش", "error");
      }
    }
  };

  // Printing Actions
  const handlePrintSingle = (order: Order) => {
    setPrintOrders([order]);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handlePrintBulk = () => {
    if (selectedOrderIds.length === 0) return;
    const selected = orders.filter((o) => selectedOrderIds.includes(o.id));
    setPrintOrders(selected);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Clear Filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStatus("all");
    setSelectedShippingMethod("all");
  };

  const hasActiveFilters = searchQuery !== "" || selectedStatus !== "all" || selectedShippingMethod !== "all";

  // Filter Tabs Config
  const statusTabs: { id: string; label: string }[] = [
    { id: "all", label: "همه" },
    { id: "pending", label: "در حال بررسی" },
    { id: "processing", label: "درحال آماده سازی" },
    { id: "handed_to_carrier", label: "تحویل به پست" },
    { id: "shipped", label: "ارسال شد" },
    { id: "delivered", label: "تحویل داده شد" },
    { id: "cancelled", label: "لغو شده" },
  ];

  return (
    <div className="space-y-5 pb-16 dir-rtl">
      {/* Printable Area Helper */}
      <PrintableOrderSheet orders={printOrders} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">سفارش‌ها</h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-primary/10 text-primary rounded-full">
              {orders.length} سفارش
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            مدیریت، بررسی و پیگیری وضعیت سفارش‌های مشتریان
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-background transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>حذف فیلترها</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی شماره سفارش، نام مشتری، موبایل یا کد رهگیری..."
            className="w-full pr-9 pl-4 py-2 text-xs bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
          className="sm:hidden flex items-center justify-center gap-2 px-4 py-2 bg-background border border-border rounded-xl text-xs font-medium text-foreground"
        >
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          <span>فیلترها {hasActiveFilters && "•"}</span>
        </button>

        {/* Shipping Method Filter Dropdown (Desktop) */}
        <div className="hidden sm:block shrink-0">
          <select
            value={selectedShippingMethod}
            onChange={(e) => setSelectedShippingMethod(e.target.value)}
            className="px-3 py-2 text-xs bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground cursor-pointer"
          >
            <option value="all">همه روش‌های ارسال</option>
            <option value="post-express">پست پیشتاز</option>
          </select>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-border/60">
        {statusTabs.map((tab) => {
          const isActive = selectedStatus === tab.id;
          const count =
            tab.id === "all"
              ? orders.length
              : orders.filter((o) => o.status === tab.id).length;

          return (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-2 text-xs font-bold rounded-t-lg whitespace-nowrap transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-surface-subtle"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 text-[10px] rounded-full ${
                isActive ? "bg-primary text-primary-foreground" : "bg-surface-muted text-muted-foreground"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bulk Action Bar (Visible when orders are selected) */}
      {selectedOrderIds.length > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <Check className="w-4 h-4" />
            <span>{selectedOrderIds.length} سفارش انتخاب شده است</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkStatusAdvance}
              className="px-3 py-1.5 bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ارتقای وضعیت گروهی</span>
            </button>

            <button
              onClick={handlePrintBulk}
              className="px-3 py-1.5 bg-background border border-border hover:bg-surface-subtle text-foreground text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>چاپ گروهی</span>
            </button>

            <button
              onClick={handleBulkCancelClick}
              className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>لغو گروهی</span>
            </button>
          </div>
        </div>
      )}

      {/* Content States */}
      {isLoading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground">در حال دریافت لیست سفارش‌ها...</p>
        </div>
      ) : hasError ? (
        <div className="py-16 text-center border border-dashed border-rose-200 rounded-2xl bg-rose-50/50 p-6 space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-sm font-bold text-foreground">خطا در دریافت اطلاعات</h3>
          <p className="text-xs text-muted-foreground">مشکلی در ارتباط با پایگاه داده رخ داده است.</p>
          <button
            onClick={loadOrders}
            className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary-hover transition-colors"
          >
            تلاش مجدد
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        /* Empty State */
        <div className="py-16 text-center border border-dashed border-border rounded-2xl p-8 space-y-3 bg-surface-subtle/20">
          <PackageX className="w-10 h-10 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">
            {hasActiveFilters ? "هیچ سفارشی با این مشخصات یافت نشد" : "هنوز هیچ سفارشی ثبت نشده است"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {hasActiveFilters
              ? "می‌توانید عبارات جستجو یا فیلترهای خود را تغییر دهید تا به نتیجه برسید."
              : "وقتی مشتریان در فروشگاه سفارشی ثبت کنند، لیست آن‌ها در این صفحه نمایش داده خواهد شد."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>پاک‌سازی فیلترها</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block border border-border rounded-2xl overflow-hidden bg-background shadow-xs">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-subtle/50 text-muted-foreground font-semibold">
                  <th className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        filteredOrders.length > 0 &&
                        selectedOrderIds.length === filteredOrders.length
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                    />
                  </th>
                  <th className="p-3.5">شماره سفارش</th>
                  <th className="p-3.5">تاریخ</th>
                  <th className="p-3.5">مشتری</th>
                  <th className="p-3.5">وضعیت</th>
                  <th className="p-3.5">روش ارسال</th>
                  <th className="p-3.5 text-center">اقلام</th>
                  <th className="p-3.5">مبلغ نهایی</th>
                  <th className="p-3.5 text-left">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredOrders.map((order) => {
                  const isSelected = selectedOrderIds.includes(order.id);
                  const nextStatus = getNextAdminStatus(order.status);
                  const totalItems = order.items.reduce((acc, i) => acc + i.quantity, 0);

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-surface-subtle/40 transition-colors ${
                        isSelected ? "bg-primary/5" : ""
                      }`}
                    >
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOrder(order.id)}
                          className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                        />
                      </td>

                      <td className="p-3.5">
                        <button
                          onClick={() => setActiveDrawerOrder(order)}
                          className="font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
                        >
                          #{order.orderNumber}
                        </button>
                      </td>

                      <td className="p-3.5 text-muted-foreground whitespace-nowrap">
                        {order.createdAt}
                      </td>

                      <td className="p-3.5">
                        <div className="font-medium text-foreground">
                          {order.shippingAddress.recipientName}
                        </div>
                        <div className="text-[11px] text-muted-foreground dir-ltr text-right">
                          {order.shippingAddress.phone}
                        </div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <OrderStatusBadge status={order.status} />
                      </td>

                      <td className="p-3.5">
                        <div className="text-foreground">{order.shippingMethod.title}</div>
                        {order.shippingMethod.trackingCode && (
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {order.shippingMethod.trackingCode}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 text-center font-bold text-foreground">
                        {totalItems}
                      </td>

                      <td className="p-3.5 whitespace-nowrap font-bold text-foreground">
                        {formatPrice(order.payableTotal)} تومان
                      </td>

                      <td className="p-3.5 text-left whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Contextual Action Button */}
                          {nextStatus && (
                            <button
                              onClick={() => handleSingleStatusAdvance(order.id, nextStatus)}
                              className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                              title={`تغییر به ${orderStatusLabels[nextStatus]}`}
                            >
                              {orderStatusLabels[nextStatus]}
                            </button>
                          )}

                          <button
                            onClick={() => setActiveDrawerOrder(order)}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-subtle rounded-lg transition-colors cursor-pointer"
                            title="مشاهده جزئیات سریع"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handlePrintSingle(order)}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-subtle rounded-lg transition-colors cursor-pointer"
                            title="چاپ سفارش"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {canAdminCancelOrder(order.status) && (
                            <button
                              onClick={() => handleCancelClick(order)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="لغو سفارش"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card / List View */}
          <div className="md:hidden space-y-3">
            {filteredOrders.map((order) => {
              const isSelected = selectedOrderIds.includes(order.id);
              const nextStatus = getNextAdminStatus(order.status);
              const totalItems = order.items.reduce((acc, i) => acc + i.quantity, 0);

              return (
                <div
                  key={order.id}
                  className={`border border-border rounded-2xl p-4 bg-background space-y-3 transition-colors ${
                    isSelected ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOrder(order.id)}
                        className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                      />
                      <span className="font-bold text-sm text-foreground">
                        سفارش #{order.orderNumber}
                      </span>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>

                  {/* Card Details Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">مشتری:</span>
                      <strong className="text-foreground">
                        {order.shippingAddress.recipientName}
                      </strong>
                    </div>

                    <div>
                      <span className="text-muted-foreground block text-[11px]">شماره تماس:</span>
                      <span className="text-foreground font-mono dir-ltr inline-block">
                        {order.shippingAddress.phone}
                      </span>
                    </div>

                    <div>
                      <span className="text-muted-foreground block text-[11px]">تاریخ:</span>
                      <span className="text-foreground">{order.createdAt}</span>
                    </div>

                    <div>
                      <span className="text-muted-foreground block text-[11px]">تعداد اقلام:</span>
                      <span className="text-foreground font-bold">{totalItems} عدد</span>
                    </div>
                  </div>

                  {/* Footer & Actions */}
                  <div className="pt-2.5 border-t border-border/60 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">مبلغ نهایی:</span>
                      <span className="text-xs font-bold text-primary">
                        {formatPrice(order.payableTotal)} تومان
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {nextStatus && (
                        <button
                          onClick={() => handleSingleStatusAdvance(order.id, nextStatus)}
                          className="px-2.5 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
                        >
                          {orderStatusLabels[nextStatus]}
                        </button>
                      )}

                      <button
                        onClick={() => setActiveDrawerOrder(order)}
                        className="p-2 bg-surface-subtle hover:bg-surface-muted text-foreground rounded-xl transition-colors cursor-pointer"
                        title="مشاهده"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Quick Order Detail Drawer */}
      <AdminOrderDetailDrawer
        order={activeDrawerOrder}
        isOpen={!!activeDrawerOrder}
        onClose={() => setActiveDrawerOrder(null)}
        onStatusChange={handleSingleStatusAdvance}
        onCancel={handleCancelClick}
        onPrint={handlePrintSingle}
      />

      {/* Cancellation Confirmation Modal */}
      <CancelConfirmationModal
        isOpen={cancelModalState.isOpen}
        onClose={() =>
          setCancelModalState({ isOpen: false, orderToCancel: null, isBulk: false })
        }
        onConfirm={confirmCancelAction}
        itemCount={cancelModalState.isBulk ? selectedOrderIds.length : undefined}
      />
    </div>
  );
}
