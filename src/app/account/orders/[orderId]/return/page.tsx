"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth/auth.store";
import { accountService } from "@/lib/account/accountService";
import { returnService } from "@/lib/returns/returnService";
import { checkOrderEligibility, checkItemEligibility } from "@/lib/returns/eligibility";
import { getReturnPolicy } from "@/lib/returns/policy";
import { catalogRepository } from "@/lib/repositories/catalogRepository";
import { Order, OrderItem } from "@/types/account";
import { ReturnReason, RETURN_REASON_LABELS } from "@/types/return";
import { Container } from "@/components/ui/Container";
import { AccountPageHeader } from "@/components/account/AccountPageHeader";
import { formatPrice } from "@/lib/formatting/currency";
import { TomanIcon } from "@/components/icons";
import { useToast } from "@/components/ui/Toast";
import { routes } from "@/lib/routes";
import {
  RotateCcw,
  RefreshCw,
  ChevronLeft,
  ArrowRight,
  PackageCheck,
  Check,
  Plus,
  Trash2,
  Send,
  AlertTriangle,
  Info,
  ShieldAlert,
} from "lucide-react";

const REASON_OPTIONS: ReturnReason[] = [
  "size_issue",
  "color_mismatch",
  "damaged",
  "changed_mind",
  "not_as_described",
  "quality_issue",
  "wrong_item",
  "other",
];

export default function OrderCreateReturnPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const { isAuthLoading, isAuthenticated } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [selectedReason, setSelectedReason] = useState<ReturnReason>("size_issue");
  const [customerNote, setCustomerNote] = useState<string>("");

  // Selected items mapping: { orderItemId: { selected: boolean, quantity: number } }
  const [itemSelections, setItemSelections] = useState<
    Record<string, { selected: boolean; quantity: number }>
  >({});

  // Evidence links state
  const [evidenceInput, setEvidenceInput] = useState<string>("");
  const [evidenceList, setEvidenceList] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (resolvedParams.orderId) {
      const found = accountService.getOrderByIdForCustomer(resolvedParams.orderId);
      if (found) {
        setOrder(found);

        // Initialize item selections
        const initialMap: Record<string, { selected: boolean; quantity: number }> = {};
        const allRequests = returnService.getReturnRequests().items;

        found.items.forEach((item) => {
          const elig = checkItemEligibility(item, allRequests);
          if (elig.isEligible && elig.returnableQuantity > 0) {
            initialMap[item.id] = { selected: false, quantity: 1 };
          }
        });

        setItemSelections(initialMap);

      }
    }
  }, [resolvedParams.orderId]);

  if (isAuthLoading) {
    return (
      <div className="py-20 text-center min-h-[60vh] flex items-center justify-center">
        <Container>
          <div className="w-10 h-10 rounded-full border-3 border-primary/30 border-t-primary animate-spin mx-auto" />
        </Container>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Container className="max-w-md mx-auto space-y-4">
          <p className="text-sm font-bold text-foreground">
            برای ثبت درخواست مرجوعی باید وارد حساب کاربری شوید.
          </p>
          <Link
            href={routes.account.root}
            className="inline-block px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary-hover transition-colors shadow-xs"
          >
            ورود به حساب کاربری
          </Link>
        </Container>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-20 text-center min-h-[60vh] flex items-center justify-center">
        <Container className="max-w-md space-y-4">
          <h1 className="text-base font-bold text-foreground">سفارش موردنظر یافت نشد.</h1>
          <Link
            href={routes.account.orders.list}
            className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به سفارش‌ها</span>
          </Link>
        </Container>
      </div>
    );
  }

  const allRequests = returnService.getReturnRequests().items;
  const orderEligibility = checkOrderEligibility(order, allRequests);

  if (!orderEligibility.isEligible) {
    return (
      <div className="py-12 max-w-[800px] mx-auto bg-background min-h-screen">
        <Container className="max-w-xl space-y-6">
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-rose-900">
                امکان ثبت مرجوعی برای این سفارش وجود ندارد
              </h2>
              <p className="text-xs text-rose-700 leading-relaxed">
                {orderEligibility.reason || "مهلت مرجوعی برای این سفارش به پایان رسیده یا قبلاً مرجوع گردیده است."}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                href={routes.account.orders.detail(order.id)}
                className="px-4 py-2 bg-surface text-foreground font-bold text-xs rounded-xl border border-border hover:bg-surface-subtle transition-colors"
              >
                مشاهده جزئیات سفارش
              </Link>
              <Link
                href={routes.account.support.new({ orderId: order.id })}
                className="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary-hover transition-colors shadow-xs"
              >
                ارتباط با پشتیبانی
              </Link>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  const policy = getReturnPolicy(selectedReason);

  const toggleItemSelection = (itemId: string) => {
    setItemSelections((prev) => ({
      ...prev,
      [itemId]: {
        selected: !prev[itemId]?.selected,
        quantity: prev[itemId]?.quantity || 1,
      },
    }));
  };

  const updateItemQuantity = (itemId: string, newQty: number, maxQty: number) => {
    const validQty = Math.max(1, Math.min(newQty, maxQty));
    setItemSelections((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        quantity: validQty,
      },
    }));
  };

  const handleAddEvidence = () => {
    if (!evidenceInput.trim()) return;
    setEvidenceList((prev) => [...prev, evidenceInput.trim()]);
    setEvidenceInput("");
  };

  const handleRemoveEvidence = (index: number) => {
    setEvidenceList((prev) => prev.filter((_, i) => i !== index));
  };

  /* Calculate estimated refund total for chosen items */
  const selectedItemsList = order.items.filter((i) => itemSelections[i.id]?.selected);
  const estimatedTotalRefund = selectedItemsList.reduce((sum, item) => {
    const qty = itemSelections[item.id]?.quantity || 1;
    return sum + item.finalUnitPrice * qty;
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      if (selectedItemsList.length === 0) {
        showToast("لطفاً حداقل یک کالا را برای مرجوعی انتخاب کنید.", "error");
        setIsSubmitting(false);
        return;
      }

      const itemsPayload = selectedItemsList.map((item) => ({
        orderItemId: item.id,
        quantity: itemSelections[item.id].quantity,
        reason: selectedReason,
        customerNote,
        evidence: evidenceList.length > 0 ? evidenceList : undefined,
      }));

      const newReq = returnService.createReturnRequest({
        order,
        items: itemsPayload,
        reason: selectedReason,
        customerNote,
      });

      showToast("درخواست مرجوعی با موفقیت ثبت شد.", "success");
      router.push(routes.account.returns.detail(newReq.id));
    } catch (err: any) {
      showToast(err.message || "خطا در ثبت درخواست.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-6 sm:py-10 max-w-[800px] mx-auto bg-background min-h-screen pb-24 md:pb-12">
      <Container className="max-w-3xl space-y-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href={routes.home} className="hover:text-foreground transition-colors">
            خانه
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
          <Link href={routes.account.root} className="hover:text-foreground transition-colors">
            حساب کاربری
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
          <Link href={routes.account.orders.list} className="hover:text-foreground transition-colors">
            سفارش‌های من
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
          <Link href={routes.account.orders.detail(order.id)} className="hover:text-foreground transition-colors" dir="ltr">
            #{order.orderNumber}
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
          <span className="text-foreground font-bold">ثبت مرجوعی</span>
        </nav>

        {/* Page Header */}
        <AccountPageHeader
          title={`ثبت درخواست مرجوعی سفارش #${order.orderNumber}`}
          description="لطفاً کالاهای موردنظر و علت درخواست را مشخص کنید."
          icon={RotateCcw}
          backUrl={routes.account.orders.detail(order.id)}
          backLabel="بازگشت به سفارش"
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Items Selection Card */}
          <div className="bg-background border border-border rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
            <h2 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-primary" />
              <span>انتخاب کالاهای درخواستی</span>
            </h2>

            <div className="divide-y divide-border-subtle">
              {order.items.map((item) => {
                const itemElig = checkItemEligibility(item, allRequests);
                const isSelected = itemSelections[item.id]?.selected || false;
                const currentQty = itemSelections[item.id]?.quantity || 1;

                if (!itemElig.isEligible || itemElig.returnableQuantity <= 0) {
                  return (
                    <div key={item.id} className="py-3 flex items-center justify-between opacity-50 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg bg-surface-muted overflow-hidden shrink-0">
                          <Image src={item.image} alt={item.title} fill className="object-cover" />
                        </div>
                        <div>
                          <span className="font-medium text-foreground">{item.title}</span>
                          <span className="block text-[11px] text-rose-600">غیرقابل مرجوعی</span>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 space-y-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleItemSelection(item.id)}
                        className="mt-1.5 w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                      />

                      <div className="relative w-14 h-14 rounded-xl bg-surface-muted overflow-hidden shrink-0">
                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                      </div>

                      <div className="flex-1 space-y-1 text-xs">
                        <h3 className="font-bold text-foreground">{item.title}</h3>
                        {item.variant && (
                          <p className="text-muted-foreground text-[11px]">
                            تنوع خریداری شده: {item.variant.color || ""} {item.variant.size || ""}
                          </p>
                        )}
                        <p className="text-muted-foreground">
                          قیمت زمان خرید: <strong className="text-foreground">{formatPrice(item.finalUnitPrice)}</strong> تومان
                        </p>
                      </div>

                      {/* Quantity Selector */}
                      {isSelected && (
                        <div className="flex items-center gap-1 bg-surface-subtle border border-border-subtle rounded-xl p-1 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              updateItemQuantity(
                                item.id,
                                currentQty - 1,
                                itemElig.returnableQuantity
                              )
                            }
                            className="w-6 h-6 rounded-lg bg-background text-foreground hover:bg-surface-muted flex items-center justify-center text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="w-7 text-center font-bold text-xs">{currentQty}</span>
                          <button
                            type="button"
                            onClick={() =>
                              updateItemQuantity(
                                item.id,
                                currentQty + 1,
                                itemElig.returnableQuantity
                              )
                            }
                            className="w-6 h-6 rounded-lg bg-background text-foreground hover:bg-surface-muted flex items-center justify-center text-xs font-bold"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reason Selection */}
          <div className="bg-background border border-border rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
            <h2 className="text-xs sm:text-sm font-bold text-foreground">
              علت درخواست مرجوعی
            </h2>

            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value as ReturnReason)}
              className="w-full p-3 bg-surface-subtle border border-border-subtle rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary"
            >
              {REASON_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {RETURN_REASON_LABELS[r]}
                </option>
              ))}
            </select>

            {/* Dynamic Return Policy Banner */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-primary">
                <Info className="w-4 h-4 shrink-0" />
                <span>راهنمای هزینه و قوانین مرجوعی:</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                {policy.description}
              </p>
            </div>
          </div>

          {/* Customer Note */}
          <div className="bg-background border border-border rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
            <h2 className="text-xs sm:text-sm font-bold text-foreground">
              توضیحات تکمیلی مشتری (اختیاری)
            </h2>
            <textarea
              rows={3}
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder="توضیحات بیشتر در مورد دلیل مرجوعی یا عیب کالا..."
              className="w-full p-3 bg-surface-subtle border border-border-subtle rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          {/* Evidence Image Links (Optional) */}
          <div className="bg-background border border-border rounded-2xl p-4 sm:p-5 space-y-3 shadow-2xs">
            <h2 className="text-xs sm:text-sm font-bold text-foreground">
              تصویر/مدرک از ایراد کالا (اختیاری)
            </h2>

            <div className="flex gap-2">
              <input
                type="text"
                value={evidenceInput}
                onChange={(e) => setEvidenceInput(e.target.value)}
                placeholder="آدرس تصویر مدرک (مثال: /images/bag-1.webp)..."
                className="flex-1 p-2.5 bg-surface-subtle border border-border-subtle rounded-xl text-xs focus:outline-none focus:border-primary font-mono"
              />
              <button
                type="button"
                onClick={handleAddEvidence}
                className="px-4 py-2.5 bg-surface-subtle border border-border-subtle text-foreground font-bold text-xs rounded-xl hover:bg-surface-muted transition-colors flex items-center gap-1 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن</span>
              </button>
            </div>

            {evidenceList.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {evidenceList.map((url, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-surface-subtle rounded-lg border border-border-subtle text-xs"
                  >
                    <span className="font-mono text-[11px] truncate max-w-md">{url}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEvidence(idx)}
                      className="text-rose-600 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary & Submit Action */}
          <div className="bg-background border-2 border-primary/20 rounded-2xl p-4 sm:p-5 space-y-4 shadow-md">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">برآورد مبلغ قابل استرداد:</span>
              <div className="flex items-center gap-1 font-bold text-base text-primary">
                <span>{formatPrice(estimatedTotalRefund)}</span>
                <TomanIcon className="w-4 h-4 text-primary" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-5 bg-primary text-primary-foreground font-bold text-xs sm:text-sm rounded-xl hover:bg-primary-hover transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? "در حال ثبت درخواست..." : "ثبت نهایی درخواست"}</span>
            </button>
          </div>
        </form>
      </Container>
    </div>
  );
}
