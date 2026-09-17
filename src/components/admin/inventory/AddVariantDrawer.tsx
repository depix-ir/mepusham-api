"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, AlertCircle, Check, Layers } from "lucide-react";
import { Product, ProductVariant, ProductOption } from "@/types/product";
import { useProducts } from "@/context/ProductContext";
import { isDuplicateVariant, addInventoryHistoryLog } from "@/lib/inventory/inventoryService";

interface AddVariantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProductId?: string;
  onEditExistingVariant?: (productId: string, variantId: string) => void;
}

export function AddVariantDrawer({
  isOpen,
  onClose,
  preselectedProductId,
  onEditExistingVariant,
}: AddVariantDrawerProps) {
  const { products, addVariant, addOptionValue } = useProducts();

  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedOptionValues, setSelectedOptionValues] = useState<
    Record<string, string>
  >({});
  const [stock, setStock] = useState<number>(10);
  const [sku, setSku] = useState<string>("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [price, setPrice] = useState<number>(0);

  // New option value creation state
  const [addingValueForOptionId, setAddingValueForOptionId] = useState<string | null>(null);
  const [newValueLabel, setNewValueLabel] = useState<string>("");

  // Validation / Error state
  const [duplicateVariantId, setDuplicateVariantId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const currentProduct = products.find((p) => p.id === selectedProductId);

  // Set initial product when opened or changed
  useEffect(() => {
    if (isOpen) {
      const initialId = preselectedProductId || products[0]?.id || "";
      setSelectedProductId(initialId);
      setErrorMessage("");
      setDuplicateVariantId(null);
    }
  }, [isOpen, preselectedProductId, products]);

  // Set initial option values and price when product changes
  useEffect(() => {
    if (!currentProduct) return;

    const initialSelections: Record<string, string> = {};
    currentProduct.options.forEach((opt) => {
      if (opt.values && opt.values.length > 0) {
        initialSelections[opt.id] = opt.values[0].id;
      }
    });
    setSelectedOptionValues(initialSelections);
    setPrice(currentProduct.pricing?.minPrice || 0);

    // Auto-generate SKU draft
    const slugCode = currentProduct.slug.slice(0, 4).toUpperCase();
    const rand = Math.floor(1000 + Math.random() * 9000);
    setSku(`${slugCode}-${rand}`);
    setErrorMessage("");
    setDuplicateVariantId(null);
  }, [selectedProductId, currentProduct]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOptionSelect = (optionId: string, valueId: string) => {
    setSelectedOptionValues((prev) => ({
      ...prev,
      [optionId]: valueId,
    }));
    setErrorMessage("");
    setDuplicateVariantId(null);
  };

  const handleAddNewValueSubmit = (optionId: string) => {
    if (!newValueLabel.trim() || !currentProduct) return;
    const cleanLabel = newValueLabel.trim();
    const valId = `val_${Date.now()}`;
    addOptionValue(currentProduct.id, optionId, {
      id: valId,
      label: cleanLabel,
      value: cleanLabel,
    });
    setSelectedOptionValues((prev) => ({
      ...prev,
      [optionId]: valId,
    }));
    setNewValueLabel("");
    setAddingValueForOptionId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProduct) {
      setErrorMessage("لطفاً یک محصول انتخاب کنید.");
      return;
    }

    // Prepare optionValues array
    const optionValuesArray = Object.entries(selectedOptionValues).map(
      ([optionId, valueId]) => ({
        optionId,
        valueId,
      })
    );

    if (optionValuesArray.length < currentProduct.options.length) {
      setErrorMessage("لطفاً تمامی ویژگی‌های واریانت را انتخاب کنید.");
      return;
    }

    // Check duplicate
    const isDup = isDuplicateVariant(currentProduct, optionValuesArray);
    if (isDup) {
      // Find matching duplicate variant id
      const targetKey = [...optionValuesArray]
        .sort((a, b) => a.optionId.localeCompare(b.optionId))
        .map((ov) => `${ov.optionId}:${ov.valueId}`)
        .join("|");

      const existingVar = currentProduct.variants.find((v) => {
        const existingKey = [...(v.optionValues || [])]
          .sort((a, b) => a.optionId.localeCompare(b.optionId))
          .map((ov) => `${ov.optionId}:${ov.valueId}`)
          .join("|");
        return existingKey === targetKey;
      });

      setDuplicateVariantId(existingVar?.id || null);
      setErrorMessage("این واریانت قبلاً وجود دارد.");
      return;
    }

    const newVariantId = `v_${Date.now()}`;
    const newVariant: ProductVariant = {
      id: newVariantId,
      sku: sku.trim() || `SKU-${newVariantId}`,
      optionValues: optionValuesArray,
      pricing: {
        price: Number(price) || currentProduct.pricing.minPrice,
      },
      inventory: {
        stock: Number(stock) || 0,
        trackStock: true,
      },
      status,
    };

    addVariant(currentProduct.id, newVariant);

    // Add to history log
    addInventoryHistoryLog({
      productId: currentProduct.id,
      productTitle: currentProduct.title,
      variantId: newVariantId,
      variantDisplay: optionValuesArray
        .map((ov) => {
          const opt = currentProduct.options.find((o) => o.id === ov.optionId);
          const valObj = opt?.values.find((v) => v.id === ov.valueId);
          return valObj ? valObj.label : ov.valueId;
        })
        .join(" / "),
      sku: newVariant.sku,
      previousStock: 0,
      changeAmount: Number(stock) || 0,
      newStock: Number(stock) || 0,
      reason: "ایجاد واریانت جدید",
      actor: "مدیر سیستم",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-background h-full shadow-2xl z-10 flex flex-col dir-rtl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="h-16 px-5 border-b border-border flex items-center justify-between shrink-0 bg-surface-subtle">
          <div className="flex items-center gap-2">
            <Layers className=" text-primary" />
            <h2 className="text-base font-extrabold text-foreground">افزودن واریانت</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md transition-colors"
            aria-label="Close drawer"
          >
            <X className="" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Product Select */}
          <div>
            <label className="block font-bold text-foreground mb-1.5">انتخاب محصول</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full h-10 px-3 bg-surface-subtle border border-border rounded-md font-semibold text-foreground focus:outline-none focus:border-primary cursor-pointer"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Option Dimensions */}
          {currentProduct && currentProduct.options.length > 0 ? (
            currentProduct.options.map((opt) => {
              const selectedValId = selectedOptionValues[opt.id];
              return (
                <div key={opt.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-foreground">{opt.name}</label>
                    {addingValueForOptionId !== opt.id && (
                      <button
                        type="button"
                        onClick={() => {
                          setAddingValueForOptionId(opt.id);
                          setNewValueLabel("");
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ افزودن {opt.name}</span>
                      </button>
                    )}
                  </div>

                  {/* Option values pill list */}
                  <div className="flex flex-wrap gap-1.5">
                    {opt.values.map((v) => {
                      const isSelected = selectedValId === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => handleOptionSelect(opt.id, v.id)}
                          className={`px-3 py-1.5 rounded-md font-bold transition-all border ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-xs"
                              : "bg-surface-subtle text-foreground border-border hover:bg-surface-muted"
                          }`}
                        >
                          {v.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Inline New Value Input */}
                  {addingValueForOptionId === opt.id && (
                    <div className="flex items-center gap-2 p-2 bg-surface-subtle border border-border rounded-md mt-2">
                      <input
                        type="text"
                        placeholder={`نام جدید برای ${opt.name}...`}
                        value={newValueLabel}
                        onChange={(e) => setNewValueLabel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddNewValueSubmit(opt.id);
                          }
                        }}
                        className="flex-1 h-8 px-2 bg-background border border-border rounded text-xs font-semibold focus:outline-none focus:border-primary"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleAddNewValueSubmit(opt.id)}
                        className="h-8 px-3 bg-primary text-primary-foreground font-bold rounded text-[11px]"
                      >
                        افزودن
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddingValueForOptionId(null)}
                        className="h-8 px-2 bg-background text-muted-foreground hover:text-foreground border border-border rounded text-[11px]"
                      >
                        انصراف
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-muted-foreground py-2">
              این محصول ویژگی تعریف‌شده‌ای ندارد.
            </p>
          )}

          {/* Duplicate Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-error/10 border border-error/30 rounded-md text-error flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">{errorMessage}</p>
                {duplicateVariantId && onEditExistingVariant && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onEditExistingVariant(selectedProductId, duplicateVariantId);
                    }}
                    className="mt-1.5 font-extrabold underline hover:opacity-80 block"
                  >
                    ویرایش این واریانت
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* Initial Stock */}
            <div>
              <label className="block font-bold text-foreground mb-1">موجودی اولیه</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => {
                  setStock(Number(e.target.value));
                  setErrorMessage("");
                }}
                className="w-full h-10 px-3 bg-surface-subtle border border-border rounded-md text-foreground font-bold focus:outline-none focus:border-primary"
                required
              />
            </div>

            {/* Price */}
            <div>
              <label className="block font-bold text-foreground mb-1">قیمت (تومان)</label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full h-10 px-3 bg-surface-subtle border border-border rounded-md text-foreground font-bold focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* SKU */}
            <div>
              <label className="block font-bold text-foreground mb-1">کد واریانت (SKU)</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full h-10 px-3 bg-surface-subtle border border-border rounded-md text-foreground font-mono dir-ltr text-right focus:outline-none focus:border-primary"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block font-bold text-foreground mb-1">وضعیت</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
                className="w-full h-10 px-3 bg-surface-subtle border border-border rounded-md text-foreground font-bold focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="active">فعال</option>
                <option value="inactive">غیرفعال</option>
              </select>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 font-bold text-foreground bg-surface-subtle hover:bg-surface-muted rounded-md transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="h-10 px-5 font-bold text-primary-foreground bg-primary hover:bg-primary-hover rounded-md transition-colors shadow-xs"
            >
              افزودن واریانت
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
