"use client";

import React, { useState, useEffect } from "react";
import { X, Edit, AlertTriangle } from "lucide-react";
import { VariantInventoryItem } from "@/lib/inventory/inventoryTypes";
import { useProducts } from "@/context/ProductContext";
import { addInventoryHistoryLog } from "@/lib/inventory/inventoryService";

interface QuickEditVariantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: VariantInventoryItem | null;
}

export function QuickEditVariantDrawer({
  isOpen,
  onClose,
  item,
}: QuickEditVariantDrawerProps) {
  const { updateVariant } = useProducts();

  const [stock, setStock] = useState<number>(0);
  const [sku, setSku] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [compareAtPrice, setCompareAtPrice] = useState<number | undefined>(undefined);
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    if (item) {
      setStock(item.stock);
      setSku(item.sku);
      setPrice(item.price);
      setCompareAtPrice(item.compareAtPrice);
      setIsActive(item.isActive);
    }
  }, [item]);

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

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const previousStock = item.stock;
    const newStock = Number(stock) || 0;
    const diff = newStock - previousStock;

    updateVariant(item.productId, item.variantId, {
      sku: sku.trim() || item.sku,
      status: isActive ? "active" : "inactive",
      pricing: {
        price: Number(price) || item.price,
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      },
      inventory: {
        stock: newStock,
        trackStock: true,
      },
    });

    if (diff !== 0) {
      addInventoryHistoryLog({
        productId: item.productId,
        productTitle: item.productTitle,
        variantId: item.variantId,
        variantDisplay: item.displayVariantName,
        sku: sku.trim() || item.sku,
        previousStock,
        changeAmount: diff,
        newStock,
        reason: "ویرایش واریانت",
        actor: "مدیر سیستم",
      });
    }

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
            <Edit className=" text-primary" />
            <h2 className="text-base font-extrabold text-foreground">ویرایش واریانت</h2>
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
          {/* Read-only Product & Variant info */}
          <div className="p-3 bg-surface-subtle border border-border rounded-md space-y-1">
            <span className="text-[11px] text-muted-foreground block font-medium">محصول:</span>
            <p className="font-extrabold text-foreground text-sm">{item.productTitle}</p>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-muted-foreground font-medium">مشخصات:</span>
              <span className="font-bold text-primary">{item.displayVariantName}</span>
            </div>
          </div>

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

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-3">
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

            <div>
              <label className="block font-bold text-foreground mb-1">قیمت قبل تخفیف</label>
              <input
                type="number"
                min="0"
                value={compareAtPrice ?? ""}
                onChange={(e) =>
                  setCompareAtPrice(e.target.value ? Number(e.target.value) : undefined)
                }
                placeholder="اختیاری"
                className="w-full h-10 px-3 bg-surface-subtle border border-border rounded-md text-foreground font-bold focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Stock & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-foreground mb-1">موجودی انبار</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full h-10 px-3 bg-surface-subtle border border-border rounded-md text-foreground font-bold focus:outline-none focus:border-primary"
              />
              {stock === 0 && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1">
                  موجودی این واریانت صفر خواهد شد.
                </p>
              )}
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">وضعیت انتشار</label>
              <select
                value={isActive ? "active" : "inactive"}
                onChange={(e) => setIsActive(e.target.value === "active")}
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
              ذخیره تغییرات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
