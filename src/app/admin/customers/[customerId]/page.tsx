"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { customerService } from "@/lib/customer/customerService";
import { CustomerStatusBadge } from "@/components/admin/customers/CustomerStatusBadge";
import { EditCustomerModal } from "@/components/admin/customers/EditCustomerModal";
import { DeactivateConfirmationModal } from "@/components/admin/customers/DeactivateConfirmationModal";
import { useToast } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/formatting/currency";
import { routes } from "@/lib/routes";
import { orderStatusLabels } from "@/types/account";
import { RETURN_STATUS_LABELS } from "@/types/return";
import { supportStatusLabelsAdmin } from "@/types/support";
import { TomanIcon } from "@/components/icons";
import {
  ArrowRight,
  UserCheck,
  UserX,
  Edit2,
  ShoppingBag,
  RotateCcw,
  Headphones,
  MapPin,
  Calendar,
  Phone,
  User,
  ArrowUpRight,
  ChevronLeft,
} from "lucide-react";

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const customerId = (params?.customerId as string) || "";
  const [dataVersion, setDataVersion] = useState(0);

  // Modals state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);

  // Fetch Customer Overview Data
  const overview = useMemo(() => {
    return customerService.getCustomerById(customerId);
  }, [customerId, dataVersion]);

  if (!overview) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push(routes.admin.customers)}
            className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به لیست مشتریان</span>
          </button>
        </div>

        <div className="p-12 border border-dashed border-border rounded-2xl text-center space-y-3 bg-surface-subtle/30">
          <div className="w-12 h-12 rounded-full bg-surface-subtle text-muted-foreground mx-auto flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">مشتری مورد نظر یافت نشد.</p>
            <p className="text-xs text-muted-foreground">
              شناسه مشتری نا معتبر است یا از سیستم حذف شده است.
            </p>
          </div>
          <Link
            href={routes.admin.customers}
            className="inline-flex items-center gap-1 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition-colors"
          >
            مشاهده همه مشتریان
          </Link>
        </div>
      </div>
    );
  }

  const { customer, orders, returns, tickets, addresses } = overview;

  const handleConfirmToggleStatus = () => {
    try {
      const newStatus = customerService.toggleCustomerStatus(customer.id);
      setDataVersion((v) => v + 1);
      showToast(
        newStatus === "active"
          ? `حساب «${customer.fullName}» فعال شد.`
          : `حساب «${customer.fullName}» غیرفعال شد.`,
        "success"
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "خطا در تغییر وضعیت حساب";
      showToast(msg, "error");
    }
  };

  const handleSaveInfo = (payload: {
    firstName: string;
    lastName: string;
    phone: string;
  }) => {
    try {
      customerService.updateCustomerInfo(customer.id, payload);
      setDataVersion((v) => v + 1);
      showToast("اطلاعات مشتری با موفقیت به‌روزرسانی شد.", "success");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "خطا در بروزرسانی اطلاعات";
      showToast(msg, "error");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push(routes.admin.customers)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors cursor-pointer"
              title="بازگشت به لیست"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <span>{customer.fullName}</span>
              <CustomerStatusBadge status={customer.status} />
            </h1>
          </div>
          <p className="text-xs text-muted-foreground pr-8">
            شماره موبایل: <span className="font-mono dir-ltr inline-block">{customer.phone}</span> | تاریخ عضویت: {customer.createdAt}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-subtle border border-border text-xs font-bold text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
            <span>ویرایش profile</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDeactivateOpen(true)}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
              customer.status === "active"
                ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
            }`}
          >
            {customer.status === "active" ? (
              <>
                <UserX className="w-3.5 h-3.5" />
                <span>غیرفعال کردن</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                <span>فعال کردن</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metrics Compact Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Orders */}
        <div className="p-4 rounded-2xl bg-surface border border-border shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-primary">
            <span className="text-[11px] font-medium text-muted-foreground">تعداد سفارش‌ها</span>
            <ShoppingBag className="w-4 h-4" />
          </div>
          <span className="text-xl font-bold text-foreground block">{customer.ordersCount}</span>
        </div>

        {/* Total Purchase Amount */}
        <div className="p-4 rounded-2xl bg-surface border border-border shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[11px] font-medium text-muted-foreground">مجموع خرید</span>
            <TomanIcon className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1 text-xl font-bold text-foreground">
            <span>{formatPrice(customer.totalSpent)}</span>
          </div>
        </div>

        {/* Returns Count */}
        <div className="p-4 rounded-2xl bg-surface border border-border shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[11px] font-medium text-muted-foreground">مرجوعی و تعویض</span>
            <RotateCcw className="w-4 h-4" />
          </div>
          <span className="text-xl font-bold text-foreground block">{customer.returnsCount}</span>
        </div>

        {/* Support Tickets Count */}
        <div className="p-4 rounded-2xl bg-surface border border-border shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-purple-600">
            <span className="text-[11px] font-medium text-muted-foreground">تیکت‌های پشتیبانی</span>
            <Headphones className="w-4 h-4" />
          </div>
          <span className="text-xl font-bold text-foreground block">{customer.ticketsCount}</span>
        </div>
      </div>

      {/* Customer Information Card */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs space-y-3">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
          <User className="w-4 h-4 text-primary" />
          <span>اطلاعات عمومی کاربر</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1 bg-surface-subtle/50 p-3 rounded-xl border border-border/50">
            <span className="text-muted-foreground text-[11px] block">نام و نام خانوادگی</span>
            <span className="font-bold text-foreground block">{customer.fullName}</span>
          </div>

          <div className="space-y-1 bg-surface-subtle/50 p-3 rounded-xl border border-border/50">
            <span className="text-muted-foreground text-[11px] block">شماره موبایل</span>
            <span className="font-bold text-foreground font-mono dir-ltr block text-right">
              {customer.phone}
            </span>
          </div>

          <div className="space-y-1 bg-surface-subtle/50 p-3 rounded-xl border border-border/50">
            <span className="text-muted-foreground text-[11px] block">تاریخ ثبت‌نام</span>
            <span className="font-bold text-foreground block">{customer.createdAt}</span>
          </div>

          <div className="space-y-1 bg-surface-subtle/50 p-3 rounded-xl border border-border/50">
            <span className="text-muted-foreground text-[11px] block">وضعیت حساب</span>
            <div className="mt-0.5">
              <CustomerStatusBadge status={customer.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary" />
            <span>سفارش‌ها ({orders.length})</span>
          </h2>

          <Link
            href={routes.admin.orders}
            className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1"
          >
            <span>مشاهده همه سفارش‌ها</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {orders.length > 0 ? (
          <div className="divide-y divide-border">
            {orders.map((o) => (
              <div
                key={o.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-surface-subtle/30 px-2 rounded-xl transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">سفارش #{o.orderNumber}</span>
                    <span className="text-[11px] text-muted-foreground">({o.createdAt})</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground block">
                    تعداد کالا: {o.items.length} | وضعیت: {orderStatusLabels[o.status] || o.status}
                  </span>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="flex items-center gap-1 font-bold text-foreground">
                    <span>{formatPrice(o.payableTotal)}</span>
                    <TomanIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>

                  <Link
                    href={routes.admin.orders}
                    className="p-1.5 rounded-lg bg-surface-subtle hover:bg-surface-muted text-foreground transition-colors"
                    title="مشاهده سفارش"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">
            هیچ سفارشی برای این کاربر ثبت نشده است.
          </p>
        )}
      </div>

      {/* Returns / Exchange Section */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-amber-600" />
            <span>درخواست‌های مرجوعی و تعویض ({returns.length})</span>
          </h2>

          <Link
            href={routes.admin.returns}
            className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1"
          >
            <span>مدیریت مرجوعی‌ها</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {returns.length > 0 ? (
          <div className="divide-y divide-border">
            {returns.map((r) => (
              <div
                key={r.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-surface-subtle/30 px-2 rounded-xl transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">کد درخواست: {r.requestNumber}</span>
                    <span className="text-[11px] text-muted-foreground">
                      (سفارش #{r.orderNumber})
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground block">
                    نوع: {r.type === "return" ? "مرجوعی" : "تعویض"} | وضعیت: {RETURN_STATUS_LABELS[r.status] || r.status}
                  </span>
                </div>

                <Link
                  href={routes.admin.returnsDetail(r.id)}
                  className="self-end sm:self-center p-1.5 rounded-lg bg-surface-subtle hover:bg-surface-muted text-foreground transition-colors"
                  title="مشاهده جزئیات مرجوعی"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">
            هیچ درخواست مرجوعی یا تعویضی برای این کاربر وجود ندارد.
          </p>
        )}
      </div>

      {/* Support Tickets Section */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Headphones className="w-4 h-4 text-purple-600" />
            <span>تیکت‌های پشتیبانی ({tickets.length})</span>
          </h2>

          <Link
            href={routes.admin.support}
            className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1"
          >
            <span>مدیریت پشتیبانی</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {tickets.length > 0 ? (
          <div className="divide-y divide-border">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-surface-subtle/30 px-2 rounded-xl transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">#{t.ticketNumber} - {t.subject}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground block">
                    وضعیت: {supportStatusLabelsAdmin[t.status] || t.status} | آخرین فعالیت: {t.lastMessageAt}
                  </span>
                </div>

                <Link
                  href={routes.admin.supportDetail(t.id)}
                  className="self-end sm:self-center p-1.5 rounded-lg bg-surface-subtle hover:bg-surface-muted text-foreground transition-colors"
                  title="مشاهده تیکت"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">
            هیچ تیکت پشتیبانی برای این کاربر ثبت نشده است.
          </p>
        )}
      </div>

      {/* Customer Addresses Section */}
      <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
          <MapPin className="w-4 h-4 text-primary" />
          <span>آدرس‌های ثبت‌شده ({addresses.length})</span>
        </h2>

        {addresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="p-3.5 rounded-xl border border-border bg-surface-subtle/40 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{addr.title}</span>
                  {addr.isDefault && (
                    <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                      آدرس پیش‌فرض
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">{addr.address}</p>
                <div className="text-[11px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/50">
                  <span>گیرنده: {addr.recipientName}</span>
                  <span className="font-mono dir-ltr">{addr.phone}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">
            آدرسی برای این کاربر ثبت نشده است.
          </p>
        )}
      </div>

      {/* Edit Customer Modal */}
      <EditCustomerModal
        isOpen={isEditOpen}
        customerId={customer.id}
        initialFirstName={customer.firstName}
        initialLastName={customer.lastName}
        initialPhone={customer.phone}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveInfo}
      />

      {/* Deactivate Confirmation Modal */}
      <DeactivateConfirmationModal
        isOpen={isDeactivateOpen}
        customerName={customer.fullName}
        currentStatus={customer.status}
        onClose={() => setIsDeactivateOpen(false)}
        onConfirm={handleConfirmToggleStatus}
      />
    </div>
  );
}
