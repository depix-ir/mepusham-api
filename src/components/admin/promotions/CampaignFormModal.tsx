"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Campaign } from "@/types/promotion";
import { ProductPickerModal } from "./ProductPickerModal";
import { PromotionDateRangeField } from "./PromotionDateRangeField";
import { catalogRepository } from "@/lib/repositories/catalogRepository";
import { formatPrice } from "@/lib/formatting/currency";
import {
  X,
  Sparkles,
  Package,
  Calendar,
  Clock,
  ShieldAlert,
  Check,
  Plus,
  Trash2,
  DollarSign,
} from "lucide-react";

interface CampaignFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Campaign | null;
  onSave: (
    data: Omit<Campaign, "id" | "usedCount" | "createdAt" | "updatedAt">
  ) => void;
}

export function CampaignFormModal({
  isOpen,
  onClose,
  initialData,
  onSave,
}: CampaignFormModalProps) {
  // Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [productIds, setProductIds] = useState<string[]>([]);

  // Purchase Limits
  const [hasMinPurchase, setHasMinPurchase] = useState(false);
  const [minPurchaseAmount, setMinPurchaseAmount] = useState<number>(1500000);

  const [hasMaxPurchase, setHasMaxPurchase] = useState(false);
  const [maxPurchaseAmount, setMaxPurchaseAmount] = useState<number>(10000000);

  // Dates
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  // Usage Limit
  const [hasUsageLimit, setHasUsageLimit] = useState(false);
  const [usageLimit, setUsageLimit] = useState<number>(500);

  // Active Toggle
  const [isActive, setIsActive] = useState(true);

  // Modals & Errors
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description || "");
        setProductIds(initialData.productIds || []);

        if (initialData.minPurchaseAmount && initialData.minPurchaseAmount > 0) {
          setHasMinPurchase(true);
          setMinPurchaseAmount(initialData.minPurchaseAmount);
        } else {
          setHasMinPurchase(false);
          setMinPurchaseAmount(1500000);
        }

        if (initialData.maxPurchaseAmount && initialData.maxPurchaseAmount > 0) {
          setHasMaxPurchase(true);
          setMaxPurchaseAmount(initialData.maxPurchaseAmount);
        } else {
          setHasMaxPurchase(false);
          setMaxPurchaseAmount(10000000);
        }

        setStartsAt(initialData.startsAt);
        setEndsAt(initialData.endsAt);

        if (initialData.usageLimit && initialData.usageLimit > 0) {
          setHasUsageLimit(true);
          setUsageLimit(initialData.usageLimit);
        } else {
          setHasUsageLimit(false);
          setUsageLimit(500);
        }

        setIsActive(initialData.isActive);
      } else {
        // Defaults for Create
        const now = new Date();
        const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        setTitle("");
        setDescription("");
        setProductIds([]);
        setHasMinPurchase(false);
        setMinPurchaseAmount(1500000);
        setHasMaxPurchase(false);
        setMaxPurchaseAmount(10000000);
        setStartsAt(now.toISOString());
        setEndsAt(nextMonth.toISOString());
        setHasUsageLimit(false);
        setUsageLimit(500);
        setIsActive(true);
      }
      setFormError("");
    }
  }, [isOpen, initialData]);

  // Selected products details
  const selectedProducts = useMemo(() => {
    const allProducts = catalogRepository.getProducts();
    return allProducts.filter((p) => productIds.includes(p.id));
  }, [productIds]);

  if (!isOpen) return null;

  const removeProduct = (id: string) => {
    setProductIds((prev) => prev.filter((pId) => pId !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim()) {
      setFormError("لطفاً عنوان کمپین را وارد کنید.");
      return;
    }

    if (productIds.length === 0) {
      setFormError("لطفاً حداقل یک محصول برای این کمپین انتخاب کنید.");
      return;
    }

    if (hasMinPurchase && minPurchaseAmount < 0) {
      setFormError("حداقل مبلغ خرید نمی‌تواند منفی باشد.");
      return;
    }

    if (hasMaxPurchase && maxPurchaseAmount < 0) {
      setFormError("حداکثر مبلغ خرید نمی‌تواند منفی باشد.");
      return;
    }

    if (
      hasMinPurchase &&
      hasMaxPurchase &&
      minPurchaseAmount > maxPurchaseAmount
    ) {
      setFormError("حداقل مبلغ خرید نمی‌تواند بیشتر از حداکثر مبلغ خرید باشد.");
      return;
    }

    if (!startsAt || !endsAt) {
      setFormError("لطفاً زمان شروع و پایان کمپین را وارد کنید.");
      return;
    }

    const startDate = new Date(startsAt);
    const endDate = new Date(endsAt);
    if (endDate.getTime() <= startDate.getTime()) {
      setFormError("تاریخ و زمان پایان کمپین باید بعد از زمان شروع باشد.");
      return;
    }

    if (
      initialData &&
      hasUsageLimit &&
      usageLimit < initialData.usedCount
    ) {
      setFormError(
        `حداکثر تعداد استفاده نمی‌تواند کمتر از تعداد دفعه استفاده شده فعلی (${initialData.usedCount.toLocaleString("fa-IR")}) باشد.`
      );
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      productIds,
      minPurchaseAmount: hasMinPurchase ? Number(minPurchaseAmount) : undefined,
      maxPurchaseAmount: hasMaxPurchase ? Number(maxPurchaseAmount) : undefined,
      startsAt,
      endsAt,
      usageLimit: hasUsageLimit ? Number(usageLimit) : undefined,
      isActive,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-background border border-border sm:rounded-2xl w-full max-w-4xl h-full sm:h-[92vh] flex flex-col shadow-2xl overflow-hidden dir-rtl">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between shrink-0 bg-surface-subtle">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg text-foreground">
                {initialData ? "ویرایش کمپین" : "ایجاد کمپین جدید"}
              </h3>
              <p className="text-xs text-muted-foreground">
                تنظیم مشخصات، محصولات و قوانین برگزاری کمپین فروش
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-muted rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form with Live Preview Split */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col md:flex-row no-scrollbar">
          {/* Main Form Fields */}
          <div className="flex-1 p-4 md:p-6 space-y-6 border-b md:border-b-0 md:border-l border-border">
            {/* 1. اطلاعات کمپین */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-foreground border-r-2 border-primary pr-2">
                ۱. اطلاعات کمپین
              </h4>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">
                  عنوان کمپین <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثلاً: جشنواره پاییزه"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-10 px-3 text-xs md:text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">
                  توضیحات (اختیاری)
                </label>
                <input
                  type="text"
                  placeholder="توضیح مختصر درباره هدف یا جشنواره کمپین..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-10 px-3 text-xs md:text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
                />
              </div>
            </div>

            {/* 2. محصولات */}
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground border-r-2 border-primary pr-2">
                  ۲. محصولات کمپین ({productIds.length.toLocaleString("fa-IR")})
                </h4>
                <button
                  type="button"
                  onClick={() => setIsProductPickerOpen(true)}
                  className="px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{productIds.length > 0 ? "تغییر انتخاب" : "انتخاب محصولات"}</span>
                </button>
              </div>

              {selectedProducts.length === 0 ? (
                <div className="p-4 bg-surface-subtle border border-dashed border-border rounded-xl text-center text-xs text-muted-foreground">
                  هنوز محصولی برای این کمپین انتخاب نشده است.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                  {selectedProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="flex items-center justify-between p-2.5 bg-surface-subtle border border-border rounded-xl text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Package className="w-4 h-4 text-primary shrink-0" />
                        <span className="font-semibold text-foreground truncate">
                          {prod.title}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate hidden sm:inline">
                          ({prod.category?.name})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeProduct(prod.id)}
                        className="p-1 text-muted-foreground hover:text-rose-600 rounded-lg transition-colors shrink-0"
                        title="حذف از کمپین"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. شرایط خرید */}
            <div className="space-y-3 pt-2 border-t border-border">
              <h4 className="text-sm font-bold text-foreground border-r-2 border-primary pr-2">
                ۳. شرایط خرید (مبلغ سفارش)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Min Purchase */}
                <div className="p-3 bg-surface-subtle border border-border rounded-xl space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground">
                    <input
                      type="checkbox"
                      checked={hasMinPurchase}
                      onChange={(e) => setHasMinPurchase(e.target.checked)}
                      className="accent-primary w-4 h-4 rounded"
                    />
                    <span>حداقل مبلغ خرید</span>
                  </label>

                  {hasMinPurchase && (
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        step={50000}
                        value={minPurchaseAmount}
                        onChange={(e) => setMinPurchaseAmount(Number(e.target.value))}
                        className="w-full h-9 pr-3 pl-12 text-xs md:text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary text-foreground font-bold dir-ltr"
                      />
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground font-medium">
                        تومان
                      </span>
                    </div>
                  )}
                </div>

                {/* Max Purchase */}
                <div className="p-3 bg-surface-subtle border border-border rounded-xl space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground">
                    <input
                      type="checkbox"
                      checked={hasMaxPurchase}
                      onChange={(e) => setHasMaxPurchase(e.target.checked)}
                      className="accent-primary w-4 h-4 rounded"
                    />
                    <span>حداکثر مبلغ خرید</span>
                  </label>

                  {hasMaxPurchase && (
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        step={50000}
                        value={maxPurchaseAmount}
                        onChange={(e) => setMaxPurchaseAmount(Number(e.target.value))}
                        className="w-full h-9 pr-3 pl-12 text-xs md:text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary text-foreground font-bold dir-ltr"
                      />
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground font-medium">
                        تومان
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {!hasMinPurchase && !hasMaxPurchase
                  ? "کمپین بدون محدودیت مبلغ خرید می‌باشد."
                  : hasMinPurchase && hasMaxPurchase
                  ? `کمپین تنها برای سفارش‌های بین ${formatPrice(minPurchaseAmount)} تا ${formatPrice(maxPurchaseAmount)} تومان معتبر خواهد بود.`
                  : hasMinPurchase
                  ? `کمپین تنها برای سفارش‌های بیشتر از ${formatPrice(minPurchaseAmount)} تومان معتبر خواهد بود.`
                  : `کمپین تنها برای سفارش‌های کمتر از ${formatPrice(maxPurchaseAmount)} تومان معتبر خواهد بود.`}
              </p>
            </div>

            {/* 4. زمان‌بندی */}
            <div className="pt-2 border-t border-border">
              <PromotionDateRangeField
                startsAt={startsAt}
                endsAt={endsAt}
                onChangeStartsAt={setStartsAt}
                onChangeEndsAt={setEndsAt}
              />
            </div>

            {/* 5. محدودیت استفاده */}
            <div className="space-y-3 pt-2 border-t border-border">
              <h4 className="text-sm font-bold text-foreground border-r-2 border-primary pr-2">
                ۵. محدودیت تعداد استفاده
              </h4>

              <div className="flex items-center gap-4 text-xs font-semibold text-foreground">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="campaignUsageOption"
                    checked={!hasUsageLimit}
                    onChange={() => setHasUsageLimit(false)}
                    className="accent-primary w-4 h-4"
                  />
                  <span>○ بدون محدودیت</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="campaignUsageOption"
                    checked={hasUsageLimit}
                    onChange={() => setHasUsageLimit(true)}
                    className="accent-primary w-4 h-4"
                  />
                  <span>○ محدودیت استفاده</span>
                </label>
              </div>

              {hasUsageLimit && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    حداکثر تعداد دفعه استفاده
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="h-10 px-3 text-xs md:text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground font-bold dir-ltr w-full max-w-xs"
                  />
                  {initialData && (
                    <span className="text-[11px] text-muted-foreground">
                      میزان استفاده شده تاکنون: {initialData.usedCount.toLocaleString("fa-IR")} بار
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Status Toggle */}
            <div className="flex items-center justify-between p-3 bg-surface-subtle border border-border rounded-xl">
              <span className="text-xs font-bold text-foreground">
                وضعیت فعال بودن کمپین
              </span>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  isActive ? "bg-primary" : "bg-neutral-300"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    isActive ? "-translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Sidebar Live Preview */}
          <div className="w-full md:w-80 p-4 md:p-6 bg-surface-subtle/60 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground pb-2 border-b border-border">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>پیش‌نمایش زنده کمپین</span>
            </div>

            <div className="bg-background border border-border rounded-2xl p-4 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground truncate">
                  {title || "عنوان کمپین"}
                </span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-neutral-200 text-neutral-700"
                  }`}
                >
                  {isActive ? "فعال" : "غیرفعال"}
                </span>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                <span className="text-xs text-amber-700 font-semibold block">
                  {productIds.length.toLocaleString("fa-IR")} محصول شامل کمپین
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                <div className="flex justify-between">
                  <span>حداقل خرید:</span>
                  <span className="font-semibold text-foreground">
                    {hasMinPurchase ? `${formatPrice(minPurchaseAmount)} تومان` : "بدون حداقل"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>حداکثر خرید:</span>
                  <span className="font-semibold text-foreground">
                    {hasMaxPurchase ? `${formatPrice(maxPurchaseAmount)} تومان` : "بدون حداکثر"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>سقف استفاده:</span>
                  <span className="font-semibold text-foreground">
                    {hasUsageLimit
                      ? `${usageLimit.toLocaleString("fa-IR")} بار`
                      : "نامحدود"}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground bg-surface-subtle p-2.5 rounded-lg space-y-1 mt-1 border border-border-subtle">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-primary shrink-0" />
                  <span>
                    شروع:{" "}
                    {startsAt ? new Date(startsAt).toLocaleDateString("fa-IR") : "―"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-rose-500 shrink-0" />
                  <span>
                    پایان:{" "}
                    {endsAt ? new Date(endsAt).toLocaleDateString("fa-IR") : "―"}
                  </span>
                </div>
              </div>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface-subtle flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs md:text-sm font-semibold text-foreground bg-background border border-border rounded-xl hover:bg-surface-muted transition-colors"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 text-xs md:text-sm font-bold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-colors shadow-2xs"
          >
            {initialData ? "ذخیره تغییرات" : "ایجاد کمپین"}
          </button>
        </div>
      </div>

      {/* Product Picker Modal */}
      <ProductPickerModal
        isOpen={isProductPickerOpen}
        onClose={() => setIsProductPickerOpen(false)}
        selectedProductIds={productIds}
        onConfirm={(ids) => setProductIds(ids)}
      />
    </div>
  );
}
