"use client";

import React, { useState, useEffect } from "react";
import { FreeShippingRule, FreeShippingScope } from "@/types/promotion";
import { ProductPickerModal } from "./ProductPickerModal";
import { CategoryPickerModal } from "./CategoryPickerModal";
import { CampaignPickerModal } from "./CampaignPickerModal";
import { PromotionDateRangeField } from "./PromotionDateRangeField";
import { getCampaign } from "@/lib/promotions/promotionService";
import { formatPrice } from "@/lib/formatting/currency";
import { X, Truck, Package, Layers, Tag, Store, Sparkles, Clock, ShieldAlert } from "lucide-react";

interface FreeShippingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: FreeShippingRule | null;
  onSave: (
    data: Omit<FreeShippingRule, "id" | "usedCount" | "createdAt" | "updatedAt">
  ) => void;
}

export function FreeShippingFormModal({
  isOpen,
  onClose,
  initialData,
  onSave,
}: FreeShippingFormModalProps) {
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState<FreeShippingScope>("store");

  const [productIds, setProductIds] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [campaignId, setCampaignId] = useState<string | undefined>(undefined);

  // Conditions
  const [hasMinPurchase, setHasMinPurchase] = useState(false);
  const [minPurchaseAmount, setMinPurchaseAmount] = useState<number>(1000000);

  const [hasMaxPurchase, setHasMaxPurchase] = useState(false);
  const [maxPurchaseAmount, setMaxPurchaseAmount] = useState<number>(10000000);

  // Dates
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  // Usage Limit
  const [hasUsageLimit, setHasUsageLimit] = useState(false);
  const [usageLimit, setUsageLimit] = useState<number>(100);

  // Active Status
  const [isActive, setIsActive] = useState(true);

  // Picker Modals
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [isCampaignPickerOpen, setIsCampaignPickerOpen] = useState(false);

  // Errors
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description || "");
        setScope(initialData.scope);
        setProductIds(initialData.productIds || []);
        setCategoryIds(initialData.categoryIds || []);
        setCampaignId(initialData.campaignId);

        if (initialData.minPurchaseAmount && initialData.minPurchaseAmount > 0) {
          setHasMinPurchase(true);
          setMinPurchaseAmount(initialData.minPurchaseAmount);
        } else {
          setHasMinPurchase(false);
          setMinPurchaseAmount(1000000);
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
          setUsageLimit(100);
        }

        setIsActive(initialData.isActive);
      } else {
        const now = new Date();
        const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        setTitle("");
        setDescription("");
        setScope("store");
        setProductIds([]);
        setCategoryIds([]);
        setCampaignId(undefined);
        setHasMinPurchase(true);
        setMinPurchaseAmount(1000000);
        setHasMaxPurchase(false);
        setMaxPurchaseAmount(10000000);
        setStartsAt(now.toISOString());
        setEndsAt(nextMonth.toISOString());
        setHasUsageLimit(false);
        setUsageLimit(100);
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
      setFormError("لطفاً عنوان قانون ارسال رایگان را وارد کنید.");
      return;
    }

    if (scope === "products" && productIds.length === 0) {
      setFormError("لطفاً حداقل یک محصول را انتخاب کنید.");
      return;
    }

    if (scope === "categories" && categoryIds.length === 0) {
      setFormError("لطفاً حداقل یک دسته‌بندی را انتخاب کنید.");
      return;
    }

    if (scope === "campaign" && !campaignId) {
      setFormError("لطفاً یک کمپین را انتخاب کنید.");
      return;
    }

    if (hasMinPurchase && hasMaxPurchase && minPurchaseAmount > maxPurchaseAmount) {
      setFormError("حداقل مبلغ خرید نمی‌تواند بیشتر از حداکثر مبلغ خرید باشد.");
      return;
    }

    if (!startsAt || !endsAt) {
      setFormError("لطفاً بازه زمانی اعتبار قانون را مشخص کنید.");
      return;
    }

    const startDate = new Date(startsAt);
    const endDate = new Date(endsAt);
    if (endDate.getTime() <= startDate.getTime()) {
      setFormError("تاریخ پایان باید بعد از تاریخ شروع باشد.");
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      scope,
      productIds: scope === "products" ? productIds : undefined,
      categoryIds: scope === "categories" ? categoryIds : undefined,
      campaignId: scope === "campaign" ? campaignId : undefined,
      minPurchaseAmount: hasMinPurchase ? Number(minPurchaseAmount) : undefined,
      maxPurchaseAmount: hasMaxPurchase ? Number(maxPurchaseAmount) : undefined,
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
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between shrink-0 bg-surface-subtle">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg text-foreground">
                {initialData ? "ویرایش قانون ارسال رایگان" : "ایجاد قانون ارسال رایگان"}
              </h3>
              <p className="text-xs text-muted-foreground">
                تعریف شرایط و شروط ارسال رایگان سفارش‌ها
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

        {/* Body with Live Preview */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col md:flex-row no-scrollbar">
          {/* Main Form Fields */}
          <div className="flex-1 p-4 md:p-6 space-y-6 border-b md:border-b-0 md:border-l border-border">
            {/* 1. اطلاعات اصلی */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-foreground border-r-2 border-primary pr-2">
                ۱. اطلاعات اصلی قانون
              </h4>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">
                  عنوان قانون <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثلاً: ارسال رایگان خریدهای بالای ۱ میلیون تومان"
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
                  placeholder="توضیح کوتاه درباره جزییات شرایط ارسال رایگان..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-10 px-3 text-xs md:text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
                />
              </div>
            </div>

            {/* 2. محدوده اعمال */}
            <div className="space-y-3 pt-2 border-t border-border">
              <h4 className="text-sm font-bold text-foreground border-r-2 border-primary pr-2">
                ۲. محدوده اعمال ارسال رایگان
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold text-foreground">
                <button
                  type="button"
                  onClick={() => setScope("store")}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${
                    scope === "store"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:bg-surface-subtle"
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>کل فروشگاه</span>
                </button>

                <button
                  type="button"
                  onClick={() => setScope("products")}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${
                    scope === "products"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:bg-surface-subtle"
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>محصولات</span>
                </button>

                <button
                  type="button"
                  onClick={() => setScope("categories")}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${
                    scope === "categories"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:bg-surface-subtle"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>دسته‌بندی‌ها</span>
                </button>

                <button
                  type="button"
                  onClick={() => setScope("campaign")}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${
                    scope === "campaign"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border hover:bg-surface-subtle"
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>کمپین</span>
                </button>
              </div>

              {/* Dynamic Scope Selectors */}
              {scope === "products" && (
                <div className="flex items-center justify-between p-3 bg-surface-subtle border border-border rounded-xl">
                  <span className="text-xs font-medium text-foreground">
                    {productIds.length > 0
                      ? `${productIds.length.toLocaleString("fa-IR")} محصول انتخاب شده`
                      : "محصولی انتخاب نشده است"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsProductPickerOpen(true)}
                    className="px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    {productIds.length > 0 ? "تغییر انتخاب" : "+ انتخاب محصولات"}
                  </button>
                </div>
              )}

              {scope === "categories" && (
                <div className="flex items-center justify-between p-3 bg-surface-subtle border border-border rounded-xl">
                  <span className="text-xs font-medium text-foreground">
                    {categoryIds.length > 0
                      ? `${categoryIds.length.toLocaleString("fa-IR")} دسته‌بندی انتخاب شده`
                      : "دسته‌ای انتخاب نشده است"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCategoryPickerOpen(true)}
                    className="px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    {categoryIds.length > 0 ? "تغییر انتخاب" : "+ انتخاب دسته‌ها"}
                  </button>
                </div>
              )}

              {scope === "campaign" && (
                <div className="flex items-center justify-between p-3 bg-surface-subtle border border-border rounded-xl">
                  <span className="text-xs font-medium text-foreground">
                    {selectedCampaign
                      ? `کمپین: ${selectedCampaign.title}`
                      : "کمپینی انتخاب نشده است"}
                  </span>
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

            {/* 3. شرایط خرید (حداقل و حداکثر مبلغ) */}
            <div className="space-y-3 pt-2 border-t border-border">
              <h4 className="text-sm font-bold text-foreground border-r-2 border-primary pr-2">
                ۳. شرایط مبلغ سبد خرید
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Min Amount */}
                <div className="p-3 border border-border rounded-xl flex flex-col gap-2 bg-background">
                  <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasMinPurchase}
                      onChange={(e) => setHasMinPurchase(e.target.checked)}
                      className="accent-primary w-4 h-4"
                    />
                    <span>شرط حداقل مبلغ خرید</span>
                  </label>

                  {hasMinPurchase && (
                    <div className="relative mt-1">
                      <input
                        type="number"
                        step={50000}
                        value={minPurchaseAmount}
                        onChange={(e) => setMinPurchaseAmount(Number(e.target.value))}
                        className="w-full h-9 pr-3 pl-12 text-xs md:text-sm bg-surface-subtle border border-border rounded-lg focus:outline-none focus:border-primary text-foreground font-bold dir-ltr"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
                        تومان
                      </span>
                    </div>
                  )}
                </div>

                {/* Max Amount */}
                <div className="p-3 border border-border rounded-xl flex flex-col gap-2 bg-background">
                  <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasMaxPurchase}
                      onChange={(e) => setHasMaxPurchase(e.target.checked)}
                      className="accent-primary w-4 h-4"
                    />
                    <span>سقف حداکثر مبلغ خرید</span>
                  </label>

                  {hasMaxPurchase && (
                    <div className="relative mt-1">
                      <input
                        type="number"
                        step={100000}
                        value={maxPurchaseAmount}
                        onChange={(e) => setMaxPurchaseAmount(Number(e.target.value))}
                        className="w-full h-9 pr-3 pl-12 text-xs md:text-sm bg-surface-subtle border border-border rounded-lg focus:outline-none focus:border-primary text-foreground font-bold dir-ltr"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
                        تومان
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {!hasMinPurchase && !hasMaxPurchase && (
                <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  این قانون برای تمامی مبالغ سفارش معتبر است.
                </p>
              )}
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
                    name="fsUsageLimit"
                    checked={!hasUsageLimit}
                    onChange={() => setHasUsageLimit(false)}
                    className="accent-primary w-4 h-4"
                  />
                  <span>بدون محدودیت</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="fsUsageLimit"
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
                </div>
              )}
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-3 bg-surface-subtle border border-border rounded-xl">
              <span className="text-xs font-bold text-foreground">
                وضعیت فعال بودن قانون ارسال رایگان
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
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>پیش‌نمایش قانون ارسال رایگان</span>
            </div>

            <div className="bg-background border border-border rounded-2xl p-4 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground truncate">
                  {title || "عنوان قانون"}
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

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <Truck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <span className="text-xs font-bold text-emerald-800">
                  هزینه ارسال: ۰ تومان
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                <div className="flex justify-between">
                  <span>محدوده:</span>
                  <span className="font-semibold text-foreground">
                    {scope === "store"
                      ? "کل فروشگاه"
                      : scope === "products"
                      ? `${productIds.length.toLocaleString("fa-IR")} محصول`
                      : scope === "categories"
                      ? `${categoryIds.length.toLocaleString("fa-IR")} دسته`
                      : selectedCampaign
                      ? selectedCampaign.title
                      : "کمپین"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>حداقل خرید:</span>
                  <span className="font-semibold text-foreground">
                    {hasMinPurchase
                      ? `${formatPrice(minPurchaseAmount)} تومان`
                      : "بدون حداقل"}
                  </span>
                </div>

                {hasMaxPurchase && (
                  <div className="flex justify-between">
                    <span>حداکثر خرید:</span>
                    <span className="font-semibold text-foreground">
                      {formatPrice(maxPurchaseAmount)} تومان
                    </span>
                  </div>
                )}
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
            {initialData ? "ذخیره تغییرات" : "ایجاد قانون ارسال رایگان"}
          </button>
        </div>
      </div>

      {/* Pickers */}
      <ProductPickerModal
        isOpen={isProductPickerOpen}
        onClose={() => setIsProductPickerOpen(false)}
        selectedProductIds={productIds}
        onConfirm={(ids) => setProductIds(ids)}
      />

      <CategoryPickerModal
        isOpen={isCategoryPickerOpen}
        onClose={() => setIsCategoryPickerOpen(false)}
        selectedCategoryIds={categoryIds}
        onConfirm={(ids) => setCategoryIds(ids)}
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
