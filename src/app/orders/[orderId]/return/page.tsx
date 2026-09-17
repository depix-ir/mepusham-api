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
import { products } from "@/data/products";
import { Order, OrderItem } from "@/types/account";
import { ReturnReason, RequestType, RETURN_REASON_LABELS, ReturnRequest } from "@/types/return";
import { Product, ProductVariant } from "@/types/product";
import { Container } from "@/components/ui/Container";
import { formatPrice } from "@/lib/formatting/currency";
import { TomanIcon } from "@/components/icons";
import { useToast } from "@/components/ui/Toast";
import {
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Package,
  RotateCcw,
  RefreshCw,
  Upload,
  X,
  Info,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

const RETURN_REASONS: Array<{ value: ReturnReason; label: string }> = [
  { value: "size_issue", label: "سایز مناسب نبود" },
  { value: "color_mismatch", label: "رنگ با انتظار من متفاوت بود" },
  { value: "not_as_described", label: "کالا با اطلاعات و عکس‌های سایت مطابقت نداشت" },
  { value: "damaged", label: "کالا آسیب دیده یا معیوب بود" },
  { value: "wrong_item", label: "کالای اشتباه ارسال شده است" },
  { value: "quality_issue", label: "کیفیت کالا مناسب نبود" },
  { value: "changed_mind", label: "انصراف از خرید" },
  { value: "other", label: "سایر موارد" },
];

export default function OrderReturnPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { isAuthLoading, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [requestType, setRequestType] = useState<RequestType>("return");
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [selectedReason, setSelectedReason] = useState<ReturnReason>("size_issue");
  const [otherReasonText, setOtherReasonText] = useState<string>("");
  const [customerNote, setCustomerNote] = useState<string>("");
  const [evidenceImages, setEvidenceImages] = useState<string[]>([]);

  // For Exchange Flow
  const [replacementProductId, setReplacementProductId] = useState<string>("");
  const [replacementVariantId, setReplacementVariantId] = useState<string>("");

  // Workflow step: 1 = Item & Type, 2 = Reason & Details, 3 = Replacement (if exchange), 4 = Review, 5 = Success
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRequest, setSubmittedRequest] = useState<ReturnRequest | null>(null);

  useEffect(() => {
    if (resolvedParams.orderId) {
      const found = accountService.getOrderById(resolvedParams.orderId);
      if (found) {
        setOrder(found);
        if (found.items.length > 0) {
          setSelectedItemId(found.items[0].id);
        }
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
            href="/account"
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
          <h1 className="text-base font-bold text-foreground">سفارش یافت نشد.</h1>
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به سفارش‌ها</span>
          </Link>
        </Container>
      </div>
    );
  }

  const existingRequests = returnService.getReturnRequests().items;
  const eligibility = checkOrderEligibility(order, existingRequests);

  if (!eligibility.isEligible && step !== 5) {
    return (
      <div className="py-12 max-w-[800px] m-auto bg-background min-h-screen">
        <Container className="max-w-xl space-y-6">
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
            <h1 className="text-base font-bold text-foreground">امکان ثبت مرجوعی برای این سفارش وجود ندارد</h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {eligibility.reason || "این سفارش واجد شرایط درخواست مرجوعی یا تعویض نیست."}
            </p>
            <div className="pt-2">
              <Link
                href={`/orders/${order.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary-hover transition-colors shadow-xs"
              >
                <ArrowRight className="w-4 h-4" />
                <span>بازگشت به جزئیات سفارش</span>
              </Link>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  const selectedOrderItem = order.items.find((i) => i.id === selectedItemId) || order.items[0];
  const itemElig = selectedOrderItem ? checkItemEligibility(selectedOrderItem, existingRequests) : null;
  const policy = getReturnPolicy(selectedReason);

  // Find product and replacement variants in catalog if Exchange
  const currentProduct: Product | undefined = selectedOrderItem
    ? products.find((p) => p.id === selectedOrderItem.productId)
    : undefined;

  // Selected replacement product (either same current product or chosen another product)
  const selectedTargetProduct: Product | undefined = replacementProductId
    ? products.find((p) => p.id === replacementProductId)
    : currentProduct;

  const handleAddEvidenceMock = () => {
    if (evidenceImages.length >= 3) {
      showToast("حداکثر ۳ تصویر می‌توانید بارگذاری کنید.", "error");
      return;
    }
    const mockImage = selectedOrderItem?.image || "/images/bag-1.webp";
    setEvidenceImages([...evidenceImages, mockImage]);
    showToast("تصویر نمونه اضافه شد.", "info");
  };

  const handleRemoveEvidence = (index: number) => {
    setEvidenceImages(evidenceImages.filter((_, i) => i !== index));
  };

  const handleSubmitRequest = () => {
    setIsSubmitting(true);

    try {
      if (requestType === "return") {
        const req = returnService.createReturnRequest({
          order,
          reason: selectedReason,
          customerNote: selectedReason === "other" ? `${otherReasonText} ${customerNote}`.trim() : customerNote,
          items: [
            {
              orderItemId: selectedOrderItem.id,
              quantity: selectedQuantity,
              reason: selectedReason,
              customerNote,
              evidence: evidenceImages,
            },
          ],
        });
        setSubmittedRequest(req);
        setStep(5);
        showToast("درخواست مرجوعی با موفقیت ثبت شد.", "success");
      } else {
        if (!replacementVariantId) {
          showToast("لطفاً تنوع (رنگ/سایز) جایگزین را انتخاب کنید.", "error");
          setIsSubmitting(false);
          return;
        }

        const targetProd = selectedTargetProduct || currentProduct;
        const selectedVariant = targetProd?.variants.find((v) => v.id === replacementVariantId);
        const variantDisplay = selectedVariant
          ? selectedVariant.optionValues.map((ov) => ov.valueId).join(" / ")
          : (targetProd?.variants.length === 0 ? "تک سایز/تک رنگ" : replacementVariantId);

        const req = returnService.createExchangeRequest({
          order,
          orderItemId: selectedOrderItem.id,
          replacementProductId: targetProd?.id || selectedOrderItem.productId,
          replacementVariantId: replacementVariantId || "default",
          replacementVariantDisplay: `${targetProd?.title || ""} (${variantDisplay})`,
          quantity: selectedQuantity,
          reason: selectedReason,
          customerNote: selectedReason === "other" ? `${otherReasonText} ${customerNote}`.trim() : customerNote,
          evidence: evidenceImages,
          productsCatalog: products,
        });
        setSubmittedRequest(req);
        setStep(5);
        showToast("درخواست تعویض با موفقیت ثبت شد.", "success");
      }
    } catch (err: any) {
      showToast(err.message || "خطایی در ثبت درخواست رخ داد.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-6 sm:py-10 max-w-[800px] m-auto bg-background min-h-screen pb-24 md:pb-12">
      <Container className="max-w-2xl space-y-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            خانه
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
          <Link href="/orders" className="hover:text-foreground transition-colors">
            سفارش‌ها
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
          <Link href={`/orders/${order.id}`} className="hover:text-foreground transition-colors" dir="ltr">
            #{order.orderNumber}
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
          <span className="text-foreground font-bold">ثبت مرجوعی / تعویض</span>
        </nav>

        {/* Header Title */}
        <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <RotateCcw className=" text-primary" />
              <span>ثبت درخواست مرجوعی یا تعویض کالا</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              سفارش <span dir="ltr">#{order.orderNumber}</span>
            </p>
          </div>
        </div>

        {/* Wizard Steps Tracker */}
        {step < 5 && (
          <div className="bg-surface-subtle/60 rounded-xl p-3 flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span className={step >= 1 ? "text-primary font-black" : ""}>۱. انتخاب کالا</span>
            <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-muted-foreground/50" />
            <span className={step >= 2 ? "text-primary font-black" : ""}>۲. دلیل & تعداد</span>
            {requestType === "exchange" && (
              <>
                <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-muted-foreground/50" />
                <span className={step >= 3 ? "text-primary font-black" : ""}>۳. انتخاب جایگزین</span>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-muted-foreground/50" />
            <span className={step >= 4 ? "text-primary font-black" : ""}>بررسی و ثبت</span>
          </div>
        )}

        {/* STEP 1: ITEM & REQUEST TYPE SELECTION */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Request Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground block">نوع درخواست خود را انتخاب کنید:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRequestType("return")}
                  className={`p-4 rounded-xl border text-right transition-all cursor-pointer flex flex-col gap-1.5 ${
                    requestType === "return"
                      ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                      : "border-border-subtle hover:border-border text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                      <RotateCcw className="w-4 h-4" />
                      <span>مرجوع کردن کالا</span>
                    </span>
                    {requestType === "return" && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    بازگشت وجه به حساب بانکی خریدار
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRequestType("exchange")}
                  className={`p-4 rounded-xl border text-right transition-all cursor-pointer flex flex-col gap-1.5 ${
                    requestType === "exchange"
                      ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                      : "border-border-subtle hover:border-border text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4" />
                      <span>تعویض کالا</span>
                    </span>
                    {requestType === "exchange" && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    تعویض سایز یا رنگ با مدل موجود
                  </span>
                </button>
              </div>
            </div>

            {/* Order Items List */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground block">کالای موردنظر جهت مرجوعی / تعویض:</label>
              <div className="space-y-2.5">
                {order.items.map((item) => {
                  const check = checkItemEligibility(item, existingRequests);
                  const isSelected = selectedItemId === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => check.isEligible && setSelectedItemId(item.id)}
                      className={`p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
                        !check.isEligible
                          ? "border-border-subtle bg-surface-subtle/50 opacity-60 cursor-not-allowed"
                          : isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary cursor-pointer"
                          : "border-border-subtle hover:border-border bg-background cursor-pointer"
                      }`}
                    >
                      <div className="relative w-14 h-14 rounded-lg bg-surface-muted overflow-hidden shrink-0">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 space-y-1 min-w-0">
                        <h4 className="text-xs font-bold text-foreground truncate">{item.title}</h4>
                        {item.variant && (
                          <p className="text-[11px] text-muted-foreground">
                            تنوع: {item.variant.color || ""} {item.variant.size || ""}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">تعداد خرید: {item.quantity}</span>
                          <span className="text-primary font-bold">
                            (قابل مرجوعی: {check.returnableQuantity})
                          </span>
                        </div>
                        {!check.isEligible && (
                          <p className="text-[11px] text-rose-600 font-bold">{check.reason}</p>
                        )}
                      </div>

                      {check.isEligible && (
                        <div className="shrink-0">
                          <div
                            className={` rounded-full border flex items-center justify-center ${
                              isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Next Action Button */}
            <button
              type="button"
              disabled={!selectedOrderItem || !itemElig?.isEligible}
              onClick={() => {
                setSelectedQuantity(1);
                setStep(2);
              }}
              className="w-full py-3 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>ادامه (انتخاب دلیل و تعداد)</span>
              <ChevronRight  className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        )}

        {/* STEP 2: QUANTITY, REASON & EVIDENCE */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Quantity Selector */}
            <div className="bg-surface-subtle/60 rounded-2xl p-4 space-y-3">
              <span className="text-xs font-bold text-foreground block">تعداد جهت مرجوعی / تعویض:</span>
              <div className="flex items-center gap-3">
                <select
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                  className="px-4 py-2 bg-background border border-border-subtle rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary"
                >
                  {Array.from({ length: itemElig?.returnableQuantity || 1 }, (_, i) => i + 1).map((qty) => (
                    <option key={qty} value={qty}>
                      {qty} عدد
                    </option>
                  ))}
                </select>
                <span className="text-xs text-muted-foreground">
                  حداکثر تعداد مجاز: {itemElig?.returnableQuantity} عدد
                </span>
              </div>
            </div>

            {/* Return Reason Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground block">علت مرجوعی / تعویض را مشخص کنید:</label>
              <div className="space-y-2">
                {RETURN_REASONS.map((r) => (
                  <label
                    key={r.value}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-colors ${
                      selectedReason === r.value
                        ? "border-primary bg-primary/5 font-bold text-primary"
                        : "border-border-subtle text-foreground hover:bg-surface-subtle/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="return_reason"
                        value={r.value}
                        checked={selectedReason === r.value}
                        onChange={() => setSelectedReason(r.value)}
                        className="accent-primary"
                      />
                      <span>{r.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Other Reason Details */}
            {selectedReason === "other" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">توضیح دلیل مرجوعی:</label>
                <input
                  type="text"
                  value={otherReasonText}
                  onChange={(e) => setOtherReasonText(e.target.value)}
                  placeholder="علت درخواست خود را شرح دهید..."
                  className="w-full px-3.5 py-2.5 bg-background border border-border-subtle rounded-xl text-xs focus:outline-none focus:border-primary"
                />
              </div>
            )}

            {/* Additional Customer Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">توضیحات تکمیلی (اختیاری):</label>
              <textarea
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                rows={3}
                placeholder="در صورت داشتن توضیحات اضافه برای کارشناسان پشتیبانی وارد کنید..."
                className="w-full px-3.5 py-2.5 bg-background border border-border-subtle rounded-xl text-xs focus:outline-none focus:border-primary resize-none"
              />
            </div>

            {/* Evidence Photo Upload Section */}
            {(policy.requiresEvidence || selectedReason === "damaged" || selectedReason === "wrong_item") && (
              <div className="space-y-2 pt-2 border-t border-border-subtle">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-primary" />
                    <span>افزودن تصویر کالا (اختیاری جهت بررسی سریع‌تر)</span>
                  </label>
                  <span className="text-[11px] text-muted-foreground">حداکثر ۳ تصویر</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {evidenceImages.map((imgSrc, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-border-subtle">
                      <Image src={imgSrc} alt="مدرک" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveEvidence(idx)}
                        className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {evidenceImages.length < 3 && (
                    <button
                      type="button"
                      onClick={handleAddEvidenceMock}
                      className="w-16 h-16 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 flex flex-col items-center justify-center text-primary text-[10px] font-bold hover:bg-primary/10 transition-colors"
                    >
                      <Upload className="w-4 h-4 mb-0.5" />
                      <span>افزودن</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons (Equal 50% width and height) */}
            <div className="grid grid-cols-2 gap-3 pt-3 w-full">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="h-11 border border-border-subtle text-foreground font-bold text-xs rounded-xl hover:bg-surface-subtle transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
                <span>مرحله قبل</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (requestType === "exchange") {
                    setStep(3);
                  } else {
                    setStep(4);
                  }
                }}
                className="h-11 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary-hover transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{requestType === "exchange" ? "مرحله بعد (جایگزین)" : "بررسی و ادامه"}</span>
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REPLACEMENT PRODUCT & VARIANT SELECTION (FOR EXCHANGE ONLY) */}
        {step === 3 && requestType === "exchange" && (
          <div className="space-y-6">
            {/* Guidance Banner */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-primary flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                <span>راهنمای تعویض محصول و مابه‌التفاوت قیمت</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                شما می‌توانید محصول فعلی را با رنگ/سایز دیگر یا <strong>یک محصول کاملاً متفاوت</strong> تعویض کنید!
              </p>
              <ul className="text-[11px] text-muted-foreground list-disc list-inside space-y-1 pt-1">
                <li>در صورت انتخاب محصول گران‌تر، مابه‌التفاوت پرداخت می‌گردد.</li>
                <li>در صورت انتخاب محصول ارزان‌تر، مابه‌التفاوت به حساب شما بازگردانده می‌شود.</li>
                <li>کالای جدید پس از دریافت و کارشناسی کالا توسط انبار برای شما ارسال خواهد شد.</li>
              </ul>
            </div>

            {/* Target Product Selector Dropdown */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground block">
                محصول مورد نظر جهت تعویض را انتخاب کنید:
              </label>
              <select
                value={replacementProductId || currentProduct?.id || ""}
                onChange={(e) => {
                  const newProdId = e.target.value;
                  setReplacementProductId(newProdId);
                  const newProd = products.find((p) => p.id === newProdId);
                  if (newProd && newProd.variants && newProd.variants.length > 0) {
                    const firstActive = newProd.variants.find((v) => v.status === "active" && (v.inventory?.stock ?? 0) > 0);
                    setReplacementVariantId(firstActive ? firstActive.id : newProd.variants[0].id);
                  } else {
                    setReplacementVariantId("default");
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-background border border-border-subtle rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary"
              >
                <option value={currentProduct?.id}>
                  {currentProduct?.title} (همین مدل - {formatPrice(currentProduct?.price || 0)} تومان)
                </option>
                {products
                  .filter((p) => p.id !== currentProduct?.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({formatPrice(p.price)} تومان)
                    </option>
                  ))}
              </select>
            </div>

            {/* Selected Product Preview Card */}
            {selectedTargetProduct && (
              <div className="bg-surface-subtle/60 border border-border-subtle rounded-2xl p-4 flex items-center gap-3">
                <div className="relative w-16 h-16 rounded-xl bg-surface-muted overflow-hidden shrink-0">
                  <Image
                    src={selectedTargetProduct.images[0] || selectedOrderItem.image}
                    alt={selectedTargetProduct.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1 text-xs">
                  <h4 className="font-bold text-foreground truncate">{selectedTargetProduct.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">قیمت جدید:</span>
                    <span className="font-bold text-foreground">{formatPrice(selectedTargetProduct.price)}</span>
                    <TomanIcon className="w-3 h-3 text-muted-foreground" />
                  </div>
                  {/* Price Difference Indicator */}
                  {selectedTargetProduct.price !== selectedOrderItem.finalUnitPrice && (
                    <div className="text-[11px] font-bold">
                      {selectedTargetProduct.price > selectedOrderItem.finalUnitPrice ? (
                        <span className="text-amber-700">
                          مابه‌التفاوت قابل پرداخت: +{formatPrice((selectedTargetProduct.price - selectedOrderItem.finalUnitPrice) * selectedQuantity)} تومان
                        </span>
                      ) : (
                        <span className="text-emerald-700">
                          مابه‌التفاوت بازگشتی به خریدار: {formatPrice((selectedOrderItem.finalUnitPrice - selectedTargetProduct.price) * selectedQuantity)} تومان
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Variant Selector for Chosen Target Product */}
            {selectedTargetProduct && selectedTargetProduct.variants && selectedTargetProduct.variants.length > 0 ? (
              <div className="space-y-3">
                <label className="text-xs font-bold text-foreground block">
                  تنوع‌های (رنگ/سایز) موجود برای {selectedTargetProduct.title}:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedTargetProduct.variants.map((v) => {
                    const isAvailable = v.status === "active" && (v.inventory?.stock ?? 0) > 0;
                    const isSelected = replacementVariantId === v.id;
                    const variantDisplay = v.optionValues.map((ov) => ov.valueId).join(" / ");

                    return (
                      <button
                        key={v.id}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setReplacementVariantId(v.id)}
                        className={`p-3.5 rounded-xl border text-right text-xs transition-all flex items-center justify-between ${
                          !isAvailable
                            ? "border-border-subtle bg-surface-subtle/40 opacity-50 cursor-not-allowed"
                            : isSelected
                            ? "border-primary bg-primary/5 font-bold text-primary ring-1 ring-primary cursor-pointer"
                            : "border-border-subtle hover:border-border text-foreground cursor-pointer"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold block">{variantDisplay || "تنوع استاندارد"}</span>
                          <span className="text-[11px] text-muted-foreground">
                            {isAvailable ? `موجودی: ${v.inventory.stock} عدد` : "ناموجود"}
                          </span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-surface-subtle border border-border-subtle rounded-xl p-3.5 text-xs text-muted-foreground">
                این محصول تک‌سایز/تک‌رنگ است و نیازی به انتخاب تنوع فرعی ندارد.
              </div>
            )}

            {/* Navigation Buttons (Equal 50% width and height) */}
            <div className="grid grid-cols-2 gap-3 pt-3 w-full">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="h-11 border border-border-subtle text-foreground font-bold text-xs rounded-xl hover:bg-surface-subtle transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
                <span>مرحله قبل</span>
              </button>

              <button
                type="button"
                disabled={selectedTargetProduct?.variants?.length ? !replacementVariantId : false}
                onClick={() => {
                  if (!replacementVariantId && selectedTargetProduct?.variants?.length === 0) {
                    setReplacementVariantId("default");
                  }
                  setStep(4);
                }}
                className="h-11 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>بررسی و تأیید نهایی</span>
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & CONFIRM */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="bg-surface-subtle/60 rounded-2xl p-4 space-y-4 text-xs">
              <h3 className="font-bold text-foreground text-sm border-b border-border-subtle pb-2">
                خلاصه درخواست
              </h3>

              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-lg bg-surface-muted overflow-hidden shrink-0">
                  <Image src={selectedOrderItem.image} alt={selectedOrderItem.title} fill className="object-cover" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-foreground">{selectedOrderItem.title}</h4>
                  <p className="text-muted-foreground">
                    نوع درخواست: <strong>{requestType === "return" ? "مرجوعی کالا" : "تعویض کالا"}</strong>
                  </p>
                  <p className="text-muted-foreground">
                    تعداد: <strong>{selectedQuantity} عدد</strong>
                  </p>
                </div>
              </div>

              <div className="divide-y divide-border-subtle pt-2 space-y-2">
                <div className="flex justify-between text-muted-foreground pt-2">
                  <span>علت درخواست:</span>
                  <span className="font-bold text-foreground">{RETURN_REASON_LABELS[selectedReason]}</span>
                </div>

                {requestType === "exchange" && replacementVariantId && (
                  <div className="flex justify-between text-muted-foreground pt-2">
                    <span>تنوع جایگزین:</span>
                    <span className="font-bold text-primary">
                      {currentProduct?.variants.find((v) => v.id === replacementVariantId)?.optionValues.map((ov) => ov.valueId).join(" / ") || replacementVariantId}
                    </span>
                  </div>
                )}

                {requestType === "return" && (
                  <div className="flex justify-between font-bold text-foreground text-xs pt-2">
                    <span>مبلغ قابل استرداد:</span>
                    <div className="flex items-center gap-1 text-primary text-sm">
                      <span>{formatPrice(selectedOrderItem.finalUnitPrice * selectedQuantity)}</span>
                      <TomanIcon className="w-3.5 h-3.5 text-primary" />
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-muted-foreground pt-2">
                  <span>هزینه ارسال مرجوعی:</span>
                  <span className="font-bold text-foreground">
                    {policy.customerPaysReturnShipping ? "بر عهده مشتری" : "رایگان (بر عهده فروشگاه)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Policy Info Card */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 text-xs text-muted-foreground flex items-start gap-2.5">
              <ShieldCheck className=" text-primary shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                پس از ثبت درخواست، همکاران ما آن را بررسی و کد رهگیری/آدرس ارسال را برای شما صادر می‌کنند. مبلغ بازپرداخت پس از دریافت و کارشناسی کالا به حساب شما واریز خواهد شد.
              </p>
            </div>

            {/* Submit Actions (Equal 50% width and height) */}
            <div className="grid grid-cols-2 gap-3 pt-3 w-full">
              <button
                type="button"
                onClick={() => setStep(requestType === "exchange" ? 3 : 2)}
                className="h-11 border border-border-subtle text-foreground font-bold text-xs rounded-xl hover:bg-surface-subtle transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
                <span>اصلاح اطلاعات</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitRequest}
                className="h-11 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary-hover transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>در حال ثبت...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأیید و ثبت نهایی</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: SUCCESS STATE */}
        {step === 5 && submittedRequest && (
          <div className="bg-background border border-emerald-500/30 rounded-2xl p-6 text-center space-y-6 shadow-2xs">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                درخواست شما با موفقیت ثبت شد
              </h2>
              <p className="text-xs text-muted-foreground">
                شماره درخواست: <strong className="font-mono text-primary mr-1">{submittedRequest.requestNumber}</strong>
              </p>
            </div>

            <div className="bg-surface-subtle/60 rounded-xl p-4 text-xs text-right space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">نوع درخواست:</span>
                <span className="font-bold">{submittedRequest.type === "return" ? "مرجوعی کالا" : "تعویض کالا"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">تعداد:</span>
                <span className="font-bold">{submittedRequest.items[0]?.quantity} عدد</span>
              </div>
              {submittedRequest.type === "return" && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">مبلغ تقريبي بازپرداخت:</span>
                  <div className="flex items-center gap-1 font-bold text-primary">
                    <span>{formatPrice(submittedRequest.refund?.amount || 0)}</span>
                    <TomanIcon className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href={`/account/returns/${submittedRequest.id}`}
                className="w-full sm:w-auto px-6 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary-hover transition-colors shadow-xs"
              >
                مشاهده و پیگیری درخواست
              </Link>
              <Link
                href="/orders"
                className="w-full sm:w-auto px-5 py-2.5 border border-border-subtle text-foreground font-bold text-xs rounded-xl hover:bg-surface-subtle transition-colors"
              >
                بازگشت به سفارش‌ها
              </Link>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
