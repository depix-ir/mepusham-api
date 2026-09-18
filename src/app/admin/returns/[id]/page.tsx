"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ReturnRequest, INSPECTION_RESULT_LABELS } from "@/types/return";
import { returnService } from "@/lib/returns/returnService";
import {
  ReturnStatusBadge,
  RequestTypeBadge,
  ReturnReasonBadge,
} from "@/components/admin/returns/ReturnStatusBadge";
import {
  EvidenceModal,
  RejectModal,
  ProcessRefundModal,
  InspectionModal,
} from "@/components/admin/returns/DetailModals";
import { useToast } from "@/components/ui/Toast";
import { formatToman } from "@/lib/formatting/currency";
import { getReturnPolicy } from "@/lib/returns/policy";
import { storeSettingsService } from "@/lib/store-settings/storeSettingsService";
import {
  ArrowRight,
  Package,
  ShoppingBag,
  User,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  DollarSign,
  RefreshCw,
  Image as ImageIcon,
  ShieldCheck,
  Send,
  FileText,
  Building2,
  AlertTriangle,
} from "lucide-react";

export default function AdminReturnDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { showToast } = useToast();

  const [request, setRequest] = useState<ReturnRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);

  // Form states for quick actions inline
  const [trackingCodeInput, setTrackingCodeInput] = useState("");
  const [replacementTrackingInput, setReplacementTrackingInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDetail = useCallback(() => {
    setIsLoading(true);
    try {
      const data = returnService.getReturnRequestById(params.id);
      if (data) {
        setRequest(data);
      } else {
        showToast("درخواست مورد نظر یافت نشد.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("خطا در دریافت اطلاعات درخواست.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [params.id, showToast]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
        در حال بارگذاری جزئیات درخواست...
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-base font-bold text-foreground">درخواست مورد نظر یافت نشد</h2>
        <Link
          href="/admin/returns"
          className="inline-flex items-center gap-1 text-xs text-primary underline"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>بازگشت به لیست مرجوعی‌ها</span>
        </Link>
      </div>
    );
  }

  const policy = getReturnPolicy(request.reason);
  const allEvidenceImages = request.items.flatMap((i) => i.evidence || []).filter(Boolean);

  /* ================= ACTION HANDLERS ================= */

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      returnService.approveRequest(request.id);
      showToast("درخواست با موفقیت تأیید شد.", "success");
      fetchDetail();
    } catch (e: any) {
      showToast(e.message || "خطا در تأیید درخواست.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectConfirm = async (rejectReason: string) => {
    try {
      setIsSubmitting(true);
      returnService.rejectRequest(request.id, rejectReason);
      showToast("درخواست رد شد.", "info");
      setShowRejectModal(false);
      fetchDetail();
    } catch (e: any) {
      showToast(e.message || "خطا در رد درخواست.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterReceived = async () => {
    try {
      setIsSubmitting(true);
      returnService.registerReceived(request.id);
      showToast("دریافت کالا توسط انبار با موفقیت ثبت شد.", "success");
      fetchDetail();
    } catch (e: any) {
      showToast(e.message || "خطا در ثبت دریافت کالا.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCodeInput.trim()) return;
    try {
      setIsSubmitting(true);
      returnService.registerShipment(request.id, {
        trackingCode: trackingCodeInput.trim(),
        method: "post",
      });
      showToast("اطلاعات ارسال مرسوله با موفقیت ثبت شد.", "success");
      setTrackingCodeInput("");
      fetchDetail();
    } catch (e: any) {
      showToast(e.message || "خطا در ثبت اطلاعات ارسال.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInspectionConfirm = async (
    itemInspections: Array<{ itemId: string; result: any; note?: string }>
  ) => {
    try {
      setIsSubmitting(true);
      returnService.completeInspection(request.id, itemInspections);
      showToast("نتیجه کارشناسی با موفقیت ثبت شد و موجودی به‌روزرسانی گردید.", "success");
      setShowInspectionModal(false);
      fetchDetail();
    } catch (e: any) {
      showToast(e.message || "خطا در ثبت نتیجه کارشناسی.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefundConfirm = async (refundParams: {
    amount: number;
    referenceId: string;
    note?: string;
  }) => {
    try {
      setIsSubmitting(true);
      returnService.processRefund(request.id, refundParams);
      showToast("بازپرداخت مالی با موفقیت ثبت شد.", "success");
      setShowRefundModal(false);
      fetchDetail();
    } catch (e: any) {
      showToast(e.message || "خطا در ثبت بازپرداخت مالی.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShipReplacement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replacementTrackingInput.trim()) return;
    try {
      setIsSubmitting(true);
      returnService.shipReplacement(request.id, replacementTrackingInput.trim());
      showToast("کالای جایگزین با موفقیت ارسال شد.", "success");
      setReplacementTrackingInput("");
      fetchDetail();
    } catch (e: any) {
      showToast(e.message || "خطا در ثبت ارسال کالای جایگزین.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 text-xs">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/returns"
            className="p-1.5 text-muted-foreground hover:text-foreground bg-background border border-border rounded-md hover:bg-surface-subtle transition-colors"
            title="بازگشت به لیست"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-foreground">
                درخواست {request.requestNumber}
              </h1>
              <RequestTypeBadge type={request.type} />
              <ReturnStatusBadge status={request.status} />
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              ثبت شده در تاریخ {new Date(request.createdAt).toLocaleDateString("fa-IR")}
            </p>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchDetail}
          className="p-2 text-muted-foreground hover:text-foreground bg-background border border-border rounded-md hover:bg-surface-subtle"
          title="به‌روزرسانی"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Grid: Status Banner & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Returned Items, Policy, Inspection, Refund/Exchange, Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Returned Items Card */}
          <div className="bg-background border border-border rounded-lg p-4 space-y-4 shadow-2xs">
            <h2 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Package className="w-4 h-4 text-primary" />
              <span>کالاهای درخواست شده جهت {request.type === "return" ? "مرجوعی" : "تعویض"}</span>
            </h2>

            <div className="space-y-3">
              {request.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-surface-subtle/60 border border-border/80 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded bg-background relative overflow-hidden shrink-0 border border-border">
                      {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt={item.productTitle}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="font-semibold text-foreground text-xs">{item.productTitle}</div>
                      <div className="text-[11px] text-muted-foreground">
                        تنوع فعلی: {item.variantDisplay || "پیش‌فرض"} {item.sku && `(SKU: ${item.sku})`}
                      </div>

                      {/* If Exchange: Show Replacement Variant and Price Difference Info */}
                      {request.type === "exchange" && request.exchange && (
                        <div className="mt-1 p-2 bg-indigo-50 border border-indigo-200 rounded text-[11px] text-indigo-900 font-medium space-y-1">
                          <div>
                            کالای درخواستی جایگزین: <strong>{request.exchange.replacementVariantDisplay || request.exchange.replacementProductTitle || "سایز/رنگ مقصد"}</strong>
                          </div>
                          {request.exchange.priceDifference !== undefined && request.exchange.priceDifference !== 0 && (
                            <div className="font-bold">
                              {request.exchange.priceDifference > 0 ? (
                                <span className="text-amber-700">
                                  مابه‌التفاوت قابل دریافت از مشتری: +{formatToman(request.exchange.priceDifference)}
                                </span>
                              ) : (
                                <span className="text-emerald-700">
                                  مابه‌التفاوت قابل استرداد به مشتری: {formatToman(Math.abs(request.exchange.priceDifference))}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Inspection result badge if present */}
                      {item.inspection && (
                        <div className="mt-1 text-[11px] font-medium text-purple-800">
                          نتیجه کارشناسی: {INSPECTION_RESULT_LABELS[item.inspection.result]}
                          {item.inspection.note && ` (${item.inspection.note})`}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right sm:text-left shrink-0 self-end sm:self-auto border-t sm:border-t-0 border-border pt-2 sm:pt-0 w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
                    <div className="text-[11px] text-muted-foreground">
                      تعداد: <strong className="text-foreground">{item.quantity}</strong> عدد
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      قیمت زمان خرید: <strong className="text-foreground">{formatToman(item.purchasedUnitPrice)}</strong>
                    </div>
                    {request.type === "return" && (
                      <div className="font-bold text-foreground text-xs mt-0.5">
                        قابل بازپرداخت: {formatToman(item.refundAmount)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reason, Customer Note, & Evidence Section */}
          <div className="bg-background border border-border rounded-lg p-4 space-y-3">
            <h2 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-3">
              <FileText className="w-4 h-4 text-primary" />
              <span>دلیل درخواست و توضیحات مشتری</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-muted-foreground block text-[11px]">دلیل ثبت شده:</span>
                <div className="mt-1">
                  <ReturnReasonBadge reason={request.reason} />
                </div>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px]">قوانین و مسئولیت هزینه:</span>
                <p className="mt-1 font-medium text-foreground text-[11px]">
                  {policy.description}
                </p>
              </div>
            </div>

            {request.customerNote && (
              <div className="pt-2">
                <span className="text-muted-foreground block text-[11px]">توضیحات مشتری:</span>
                <p className="mt-1 p-2.5 bg-surface-subtle border border-border rounded-md text-foreground">
                  «{request.customerNote}»
                </p>
              </div>
            )}

            {/* Evidence Gallery Trigger */}
            <div className="pt-2 border-t border-border/60 flex items-center justify-between">
              <span className="text-muted-foreground text-[11px]">تصاویر مدرک ارسالی:</span>
              {allEvidenceImages.length > 0 ? (
                <button
                  onClick={() => setShowEvidenceModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-subtle hover:bg-surface-muted text-primary border border-border rounded-md font-medium text-xs transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>مشاهده {allEvidenceImages.length} تصویر مدرک</span>
                </button>
              ) : (
                <span className="text-muted-foreground font-normal text-[11px]">
                  مدرکی توسط مشتری ارسال نشده است.
                </span>
              )}
            </div>
          </div>

          {/* Return Shipment & Destination Address Panel */}
          <div className="bg-background border border-border rounded-lg p-4 space-y-3">
            <h2 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Truck className="w-4 h-4 text-primary" />
              <span>وضعیت ارسال و مقصد مرجوعی (انبار فروشگاه)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">مسئول پرداخت هزینه پست:</span>
                <span className="font-semibold text-foreground">
                  {request.shipment?.payer === "merchant" ? "فروشگاه (رایگان برای مشتری)" : "مشتری"}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px]">کد رهگیری پستی:</span>
                <span className="font-mono font-bold text-foreground">
                  {request.shipment?.trackingCode || "هنوز ثبت نشده"}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground block text-[11px]">تاریخ دریافت در انبار:</span>
                <span className="font-medium text-foreground">
                  {request.receivedAt ? new Date(request.receivedAt).toLocaleDateString("fa-IR") : "دریافت نشده"}
                </span>
              </div>
            </div>

            {/* Destination Return Address */}
            {(() => {
              const returnAddr = request.storeReturnAddress || storeSettingsService.getDefaultReturnAddress();
              if (returnAddr) {
                return (
                  <div className="pt-2 border-t border-border/60 space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground font-semibold text-[11px]">
                      <Building2 className="w-3.5 h-3.5 text-primary" />
                      <span>آدرس مقصد مرجوعی (انبار فروشگاه جهت ارسال مشتری):</span>
                    </div>
                    <p className="text-foreground leading-relaxed text-xs">
                      {returnAddr.recipientName} - {returnAddr.province}، {returnAddr.city}، {returnAddr.address}
                      {returnAddr.plaque ? `، پلاک ${returnAddr.plaque}` : ""}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      کد پستی: {returnAddr.postalCode} | همراه: {returnAddr.phone}
                    </p>
                  </div>
                );
              }
              return (
                <div className="pt-2 border-t border-border/60 p-2.5 bg-warning/10 border border-warning/30 rounded-lg flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-warning text-[11px]">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>آدرس مقصد مرجوعی در تنظیمات فروشگاه ثبت نشده است.</span>
                  </div>
                  <Link
                    href="/admin/settings"
                    className="px-2.5 py-1 bg-warning text-warning-foreground font-bold text-[10px] rounded-md shrink-0 hover:opacity-90"
                  >
                    ثبت آدرس مقصد
                  </Link>
                </div>
              );
            })()}

            {/* Form to enter return tracking code if in progress */}
            {request.status === "approved" && !request.shipment?.trackingCode && (
              <form onSubmit={handleRegisterShipment} className="mt-3 p-3 bg-surface-subtle rounded-md border border-border flex gap-2 items-center">
                <input
                  type="text"
                  value={trackingCodeInput}
                  onChange={(e) => setTrackingCodeInput(e.target.value)}
                  placeholder="وارد کردن کد رهگیری پستی مرجوعی..."
                  className="flex-1 p-2 bg-background border border-border rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !trackingCodeInput.trim()}
                  className="px-3 py-2 bg-primary text-primary-foreground font-medium text-xs rounded-md hover:bg-primary-hover disabled:opacity-50 shrink-0"
                >
                  ثبت کد رهگیری
                </button>
              </form>
            )}
          </div>

          {/* Refund or Exchange Processing Panel */}
          {request.type === "return" ? (
            <div className="bg-background border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>وضعیت بازپرداخت مالی</span>
                </h2>
                <span className="font-bold text-base text-foreground">
                  {formatToman(request.refund?.amount || 0)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">روش بازپرداخت:</span>
                  <span className="font-medium text-foreground">روش پرداخت اصلی سفارش</span>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px]">وضعیت واریز:</span>
                  <span className={`font-bold ${request.refund?.status === "completed" ? "text-emerald-600" : "text-amber-600"}`}>
                    {request.refund?.status === "completed" ? "واریز شده" : "در انتظار واریز"}
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px]">شماره پیگیری بانک:</span>
                  <span className="font-mono text-foreground font-semibold">
                    {request.refund?.referenceId || "-"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-background border border-border rounded-lg p-4 space-y-3">
              <h2 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-3">
                <RefreshCw className="w-4 h-4 text-indigo-600" />
                <span>مدیریت ارسال کالای جایگزین (تعویض)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">تنوع درخواستی جدید:</span>
                  <span className="font-bold text-indigo-900">
                    {request.exchange?.replacementVariantDisplay || "تنوع جدید"}
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[11px]">کد رهگیری ارسال جایگزین:</span>
                  <span className="font-mono font-bold text-foreground">
                    {request.exchange?.replacementShipment?.trackingCode || "ارسال نشده"}
                  </span>
                </div>
              </div>

              {/* Form to ship replacement */}
              {(request.status === "inspection_approved" || request.status === "replacement_pending") && (
                <form onSubmit={handleShipReplacement} className="mt-3 p-3 bg-indigo-50/50 border border-indigo-200 rounded-md space-y-2">
                  <label className="block text-xs font-semibold text-indigo-900">
                    ثبت کد رهگیری پست برای ارسال کالای جایگزین به مشتری:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replacementTrackingInput}
                      onChange={(e) => setReplacementTrackingInput(e.target.value)}
                      placeholder="کد رهگیری پست پیشتاز..."
                      className="flex-1 p-2 bg-background border border-border rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || !replacementTrackingInput.trim()}
                      className="px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-md hover:bg-indigo-700 disabled:opacity-50 shrink-0"
                    >
                      ثبت و ارسال جایگزین
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Timeline Events Audit Trail */}
          <div className="bg-background border border-border rounded-lg p-4 space-y-3">
            <h2 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Clock className="w-4 h-4 text-primary" />
              <span>تاریخچه عملیات و تایم‌لاین (Audit Trail)</span>
            </h2>

            <div className="relative border-r-2 border-border mr-2 pr-4 space-y-4 my-2">
              {request.timeline.map((event) => (
                <div key={event.id} className="relative group">
                  <div className="absolute -right-[23px] top-1.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-background" />
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-foreground">{event.title}</span>
                    <span className="text-muted-foreground">
                      {new Date(event.createdAt).toLocaleString("fa-IR")}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      {event.description}
                    </p>
                  )}
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    انجام‌دهنده: <strong className="text-foreground">{event.actorName || event.actor}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Order Summary, Customer Summary, Admin Action Panel */}
        <div className="space-y-6">
          {/* Admin Action Panel (Sticky Operational Panel) */}
          <div className="bg-background border-2 border-primary/20 rounded-lg p-4 space-y-3 shadow-md sticky top-20">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-2.5">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>عملیات ادمین</span>
            </h3>

            <div className="space-y-2">
              {/* Step 1: Approve / Reject (If requested) */}
              {(request.status === "requested" || request.status === "under_review") && (
                <>
                  <button
                    onClick={handleApprove}
                    disabled={isSubmitting}
                    className="w-full py-2 px-3 text-xs font-semibold bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأیید اولیه درخواست</span>
                  </button>

                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={isSubmitting}
                    className="w-full py-2 px-3 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-md hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>رد درخواست (با ثبت علت)</span>
                  </button>
                </>
              )}

              {/* Step 2: Register Received (If in transit or approved) */}
              {(request.status === "approved" || request.status === "in_transit" || request.status === "awaiting_customer_shipment") && (
                <button
                  onClick={handleRegisterReceived}
                  disabled={isSubmitting}
                  className="w-full py-2 px-3 text-xs font-semibold bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Package className="w-4 h-4" />
                  <span>ثبت دریافت مرسوله در انبار</span>
                </button>
              )}

              {/* Step 3: Complete Inspection (If received or inspection) */}
              {(request.status === "received" || request.status === "inspection") && (
                <button
                  onClick={() => setShowInspectionModal(true)}
                  disabled={isSubmitting}
                  className="w-full py-2 px-3 text-xs font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>ثبت نتیجه کارشناسی سلامت کالا</span>
                </button>
              )}

              {/* Step 4: Process Refund (If return OR if exchange with negative price difference needing refund) */}
              {((request.type === "return" && (request.status === "inspection_approved" || request.status === "refund_pending")) ||
                (request.type === "exchange" && (request.exchange?.priceDifference ?? 0) < 0 && (request.status === "inspection_approved" || request.status === "replacement_pending"))) && (
                  <button
                    onClick={() => setShowRefundModal(true)}
                    disabled={isSubmitting}
                    className="w-full py-2 px-3 text-xs font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>ثبت بازپرداخت مالی {request.type === "exchange" ? "مابه‌التفاوت" : "به مشتری"}</span>
                  </button>
                )}

              {/* Terminal message if completed or rejected */}
              {(request.status === "completed" || request.status === "refunded" || request.status === "replacement_shipped") && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-center text-emerald-800 font-semibold text-xs">
                  ✓ این درخواست با موفقیت به پایان رسیده است.
                </div>
              )}

              {request.status === "rejected" && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-center text-rose-800 font-semibold text-xs">
                  ✕ این درخواست رد شده است.
                </div>
              )}
            </div>
          </div>

          {/* Order Context Card */}
          <div className="bg-background border border-border rounded-lg p-4 space-y-2.5">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-2">
              <ShoppingBag className="w-4 h-4 text-primary" />
              <span>اطلاعات سفارش مرتبط</span>
            </h3>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">شماره سفارش:</span>
                <Link
                  href={`/admin/orders/${request.orderId}`}
                  className="font-bold text-primary hover:underline"
                >
                  #{request.orderNumber}
                </Link>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">تاریخ ثبت سفارش:</span>
                <span className="font-medium text-foreground">
                  {request.orderCreatedAt ? new Date(request.orderCreatedAt).toLocaleDateString("fa-IR") : "-"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">روش پرداخت:</span>
                <span className="font-medium text-foreground">پرداخت آنلاین</span>
              </div>
            </div>
          </div>

          {/* Customer Context Card */}
          <div className="bg-background border border-border rounded-lg p-4 space-y-2.5">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-2">
              <User className="w-4 h-4 text-primary" />
              <span>اطلاعات مشتری</span>
            </h3>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">نام مشتری:</span>
                <span className="font-bold text-foreground">{request.customerName}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">شماره همراه:</span>
                <span className="font-mono text-foreground">{request.customerPhone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EvidenceModal
        images={allEvidenceImages}
        isOpen={showEvidenceModal}
        onClose={() => setShowEvidenceModal(false)}
      />

      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleRejectConfirm}
        isSubmitting={isSubmitting}
      />

      <ProcessRefundModal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        calculatedAmount={request.refund?.amount || 0}
        onConfirm={handleRefundConfirm}
        isSubmitting={isSubmitting}
      />

      <InspectionModal
        isOpen={showInspectionModal}
        onClose={() => setShowInspectionModal(false)}
        items={request.items}
        onConfirm={handleInspectionConfirm}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
