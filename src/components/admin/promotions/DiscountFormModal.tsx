"use client";

import React, { useState, useEffect } from "react";
import { ProductDiscount, DiscountType } from "@/types/promotion";
import { ProductPickerModal } from "./ProductPickerModal";
import { CampaignPickerModal } from "./CampaignPickerModal";
import { PromotionDateRangeField } from "./PromotionDateRangeField";
import { getCampaign } from "@/lib/promotions/promotionService";
import { formatPrice } from "@/lib/formatting/currency";
import { X, Percent, DollarSign, Package, Tag, Check, Sparkles, Clock, ShieldAlert } from "lucide-react";

interface DiscountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ProductDiscount | null;
  onSave: (
    data: Omit<ProductDiscount, "id" | "usedCount" | "createdAt" | "updatedAt">
  ) => void;
}

export function DiscountFormModal({
  isOpen,
  onClose,
  initialData,
  onSave,
}: DiscountFormModalProps) {
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<DiscountType>("percentage");
  const [value, setValue] = useState<number>(10);
  const [scopeType, setScopeType] = useState<"products" | "campaign">("products");
  const [productIds, setProductIds] = useState<string[]>([]);
  const [campaignId, setCampaignId] = useState<string | undefined>(undefined);

  // Dates
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  // Usage Limit
  const [hasUsageLimit, setHasUsageLimit] = useState(false);
  const [usageLimit, setUsageLimit] = useState<number>(100);

  // Active status
  const [isActive, setIsActive] = useState(true);

  // Modals
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [isCampaignPickerOpen, setIsCampaignPickerOpen] = useState(false);

  // Error state
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description || "");
        setType(initialData.type);
        setValue(initialData.value);
        if (initialData.campaignId) {
          setScopeType("campaign");
          setCampaignId(initialData.campaignId);
          setProductIds([]);
        } else {
          setScopeType("products");
          setProductIds(initialData.productIds || []);
          setCampaignId(undefined);
        }
        setStartsAt(initialData.startsAt);
        setEndsAt(initialData.endsAt);
        if (initialData.usageLimit && initialData.usageLimit > 0) {
          setHasUsageLimit(true);
          setUsageLimit(initialData.usageLimit);
        } else {
          setHasUsageLimit(false);
          setUsageLimit(100);
        }
        setIsActive(initialData.isActive);
      } else {
        // Reset defaults
        const now = new Date();
        const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        setTitle("");
        setDescription("");
        setType("percentage");
        setValue(20);
        setScopeType("products");
        setProductIds([]);
        setCampaignId(undefined);
        setStartsAt(now.toISOString());
        setEndsAt(nextMonth.toISOString());
        setHasUsageLimit(false);
        setUsageLimit(500);
        setIsActive(true);
      }
      setFormError("");
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim()) {
      setFormError("لطفاً عنوان تخفیف را وارد کنید.");
      return;
    }

    if (value <= 0) {
      setFormError("مقدار تخفیف باید بزرگتر از صفر باشد.");
      return;
    }

    if (type === "percentage" && value > 100) {
      setFormError("درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد.");
      return;
    }

    if (scopeType === "products" && productIds.length === 0) {
      setFormError("لطفاً حداقل یک محصول برای اعمال تخفیف انتخاب کنید.");
      return;
    }

    if (scopeType === "campaign" && !campaignId) {
      setFormError("لطفاً یک کمپین را انتخاب کنید.");
      return;
    }

    if (!startsAt || !endsAt) {
      setFormError("لطفاً بازه زمانی شروع و پایان تخفیف را مشخص کنید.");
      return;
    }

    const startDate = new Date(startsAt);
    const endDate = new Date(endsAt);
    if (endDate.getTime() <= startDate.getTime()) {
      setFormError("تاریخ و ساعت پایان باید بعد از تاریخ شروع باشد.");
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      value: Number(value),
      productIds: scopeType === "products" ? productIds : undefined,
      campaignId: scopeType === "campaign" ? campaignId : undefined,
      startsAt,
      endsAt,
      usageLimit: hasUsageLimit ? Number(usageLimit) : undefined,
      isActive,
    });

    onClose();
  };

  const selectedCampaign = campaignId ? getCampaign(campaignId) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-background border border-border rounded-2xl w-full max-w-4xl h-[92vh] flex flex-col shadow-2xl overflow-hidden dir-rtl">
        {/* Modal Header */}
        <div className="p-4 border-b border-border flex items-center justify-between shrink-0 bg-surface-subtle">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg text-foreground">
                {initialData ? "ویرایش تخفیف" : "ایجاد تخفیف جدید"}
              </h3>
              <p className="text-xs text-muted-foreground">
                تنظیم قوانین و شرایط اعمال تخفیف
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body with Live Preview Split View */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col md:flex-row no-scrollbar">
          {/* Main Form Fields */}
          <div className="flex-1 p-4 md:p-6 space-y-6 border-b md:border-b-0 md:border-l border-border">
            {/* 1. اطلاعات تخفیف */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-foreground border-r-2 border-primary pr-2">
                ۱. اطلاعات اصلی تخفیف
              </h4>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">
                  عنوان تخفیف <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثلاً: جشنواره پاییزه ۲۰٪"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-10 px-3 text-xs md:text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">
                  توضیحات کوتاه (اختیاری)
                </label>
                <input
                  type="text"
                  placeholder="توضیح مختصر درباره نحوه یا دلیل اعمال تخفیف..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-10 px-3 text-xs md:text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
                />
              </div>

              {/* Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    نوع تخفیف
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setType("percentage")}
                      className={`h-10 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                        type === "percentage"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:bg-surface-subtle"
                      }`}
                    >
                      <Percent className="w-3.5 h-3.5" />
                      <span>درصدی</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setType("fixed")}
                      className={`h-10 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                        type === "fixed"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:bg-surface-subtle"
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>مبلغ ثابت</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    مقدار تخفیف ({type === "percentage" ? "درصد" : "تومان"})
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={type === "percentage" ? 100 : undefined}
                      value={value}
                      onChange={(e) => setValue(Number(e.target.value))}
                      className="w-full h-10 pr-3 pl-12 text-xs md:text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground font-bold dir-ltr"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold">
                      {type === "percentage" ? "٪" : "تومان"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. محدوده اعمال */}
            <div className="space-y-3 pt-2 border-t border-border">
              <h4 className="text-sm font-bold text-foreground border-r-2 border-primary pr-2">
                ۲. محدوده اعمال تخفیف
              </h4>

              <div className="flex items-center gap-4 text-xs font-semibold text-foreground">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="scopeType"
                    checked={scopeType === "products"}
                    onChange={() => setScopeType("products")}
                    className="accent-primary w-4 h-4"
                  />
                  <span>محصولات مشخص</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="scopeType"
                    checked={scopeType === "campaign"}
                    onChange={() => setScopeType("campaign")}
                    className="accent-primary w-4 h-4"
                  />
                  <span>کمپین</span>
                </label>
              </div>

              {scopeType === "products" && (
                <div className="flex items-center justify-between p-3 bg-surface-subtle border border-border rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                    <Package className="w-4 h-4 text-primary shrink-0" />
                    <span>
                      {productIds.length > 0
                        ? `${productIds.length.toLocaleString("fa-IR")} محصول انتخاب شده`
                        : "هیچ محصولی انتخاب نشده است"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsProductPickerOpen(true)}
                    className="px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    {productIds.length > 0 ? "تغییر انتخاب" : "+ انتخاب محصولات"}
                  </button>
                </div>
              )}

              {scopeType === "campaign" && (
                <div className="flex items-center justify-between p-3 bg-surface-subtle border border-border rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                    <Tag className="w-4 h-4 text-primary shrink-0" />
                    <span>
                      {selectedCampaign
                        ? `کمپین: ${selectedCampaign.title}`
                        : "کمپینی انتخاب نشده است"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCampaignPickerOpen(true)}
                    className="px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    {selectedCampaign ? "تغییر کمپین" : "انتخاب کمپین"}
                  </button>
                </div>
              )}
            </div>

            {/* 3. زمان‌بندی */}
            <div className="pt-2 border-t border-border">
              <PromotionDateRangeField
                startsAt={startsAt}
                endsAt={endsAt}
                onChangeStartsAt={setStartsAt}
                onChangeEndsAt={setEndsAt}
              />
            </div>

            {/* 4. محدودیت استفاده */}
            <div className="space-y-3 pt-2 border-t border-border">
              <h4 className="text-sm font-bold text-foreground border-r-2 border-primary pr-2">
                ۴. محدودیت تعداد استفاده
              </h4>

              <div className="flex items-center gap-4 text-xs font-semibold text-foreground">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="usageLimitOption"
                    checked={!hasUsageLimit}
                    onChange={() => setHasUsageLimit(false)}
                    className="accent-primary w-4 h-4"
                  />
                  <span>بدون محدودیت</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="usageLimitOption"
                    checked={hasUsageLimit}
                    onChange={() => setHasUsageLimit(true)}
                    className="accent-primary w-4 h-4"
                  />
                  <span>محدودیت تعداد</span>
                </label>
              </div>

              {hasUsageLimit && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    حداکثر تعداد دفعه قابل استفاده
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    className="h-10 px-3 text-xs md:text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground font-bold dir-ltr w-full max-w-xs"
                  />
                  <span className="text-[11px] text-muted-foreground">
                    مثلاً: این تخفیف حداکثر ۵۰۰ بار قابل استفاده است.
                  </span>
                </div>
              )}
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-3 bg-surface-subtle border border-border rounded-xl">
              <span className="text-xs font-bold text-foreground">
                وضعیت فعال بودن قانون تخفیف
              </span>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  isActive ? "bg-primary" : "bg-neutral-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
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
              <span>پیش‌نمایش زنده قانون تخفیف</span>
            </div>

            <div className="bg-background border border-border rounded-2xl p-4 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground truncate">
                  {title || "عنوان تخفیف"}
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

              <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-center">
                <span className="text-xs text-muted-foreground font-medium block">
                  مقدار تخفیف
                </span>
                <span className="text-xl font-bold text-primary">
                  {type === "percentage"
                    ? `٪${value.toLocaleString("fa-IR")}`
                    : `${formatPrice(value)} تومان`}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                <div className="flex justify-between">
                  <span>محدوده:</span>
                  <span className="font-semibold text-foreground">
                    {scopeType === "products"
                      ? `${productIds.length.toLocaleString("fa-IR")} محصول`
                      : selectedCampaign
                      ? selectedCampaign.title
                      : "کمپین"}
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

        {/* Modal Footer */}
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
            {initialData ? "ذخیره تغییرات" : "ایجاد تخفیف"}
          </button>
        </div>
      </div>

      {/* Product & Campaign Picker Modals */}
      <ProductPickerModal
        isOpen={isProductPickerOpen}
        onClose={() => setIsProductPickerOpen(false)}
        selectedProductIds={productIds}
        onConfirm={(ids) => setProductIds(ids)}
      />

      <CampaignPickerModal
        isOpen={isCampaignPickerOpen}
        onClose={() => setIsCampaignPickerOpen(false)}
        selectedCampaignId={campaignId}
        onConfirm={(id) => setCampaignId(id)}
      />
    </div>
  );
}
