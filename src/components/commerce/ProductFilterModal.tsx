"use client";

import React, { useEffect } from "react";
import { XIcon, FilterIcon, TrashIcon } from "@/components/icons";
import { ProductFilterPanel, FilterState } from "./ProductFilterPanel";
import { Product } from "@/types/product";

interface ProductFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onClearFilters: () => void;
  allProducts: Product[];
  matchingCount: number;
}

export function ProductFilterModal({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onClearFilters,
  allProducts,
  matchingCount,
}: ProductFilterModalProps) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const activeFilterCount =
    (filters.category ? 1 : 0) +
    filters.brands.length +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (filters.hasDiscount ? 1 : 0) +
    (filters.q ? 1 : 0);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal / Drawer Sheet */}
      <div className="relative z-10 w-full max-h-[90vh] bg-background rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Drag handle & Header */}
        <div className="pt-3 pb-2 px-4 flex flex-col border-b border-border-product bg-background">
          <div className="w-12 h-1 bg-border rounded-full self-center mb-2" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FilterIcon size={18} className="text-primary" />
              <h2 className="font-bold text-base text-foreground">فیلتر پیشرفته</h2>
              {activeFilterCount > 0 && (
                <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="text-xs font-medium text-error flex items-center gap-1 cursor-pointer"
                >
                  <TrashIcon size={14} />
                  <span>حذف همه</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-surface-subtle flex items-center justify-center text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
                aria-label="بستن"
              >
                <XIcon size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Content */}
        <div className="p-4 overflow-y-auto flex-1">
          <ProductFilterPanel
            filters={filters}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
            allProducts={allProducts}
            className="border-none p-0 rounded-none shadow-none"
          />
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 border-t border-border-product bg-background flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-12 bg-primary hover:bg-primary-hover active:bg-primary-active text-primary-foreground font-semibold text-sm rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            <span>مشاهده ({matchingCount.toLocaleString("fa-IR")}) محصول</span>
          </button>
        </div>
      </div>
    </div>
  );
}
