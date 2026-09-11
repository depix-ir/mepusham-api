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
  // Local temporary filter state for mobile modal batching
  const [tempFilters, setTempFilters] = React.useState<FilterState>(filters);

  // Sync temp filters when modal opens or external filters change
  useEffect(() => {
    if (isOpen) {
      setTempFilters(filters);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, filters]);

  // Calculate matching count dynamically for temp filters
  const tempMatchingCount = React.useMemo(() => {
    let list = [...allProducts];

    if (tempFilters.category) {
      list = list.filter((p) => p.category.slug === tempFilters.category);
    }
    if (tempFilters.brands.length > 0) {
      list = list.filter((p) => p.brand?.slug && tempFilters.brands.includes(p.brand.slug));
    }
    if (tempFilters.minPrice !== undefined && !isNaN(Number(tempFilters.minPrice))) {
      list = list.filter((p) => p.pricing.minPrice >= Number(tempFilters.minPrice));
    }
    if (tempFilters.maxPrice !== undefined && !isNaN(Number(tempFilters.maxPrice))) {
      list = list.filter((p) => p.pricing.minPrice <= Number(tempFilters.maxPrice));
    }
    if (tempFilters.inStock) {
      list = list.filter((p) => p.inventory.totalStock > 0);
    }
    if (tempFilters.hasDiscount) {
      list = list.filter((p) => p.pricing.hasDiscount);
    }
    if (tempFilters.q && tempFilters.q.trim() !== "") {
      const q = tempFilters.q.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          p.category.name.toLowerCase().includes(q) ||
          (p.brand?.name && p.brand.name.toLowerCase().includes(q)) ||
          (p.tags && p.tags.some((tag) => tag.toLowerCase().includes(q)))
      );
    }

    return list.length;
  }, [allProducts, tempFilters]);

  if (!isOpen) return null;

  const handleApply = () => {
    onFilterChange(tempFilters);
    onClose();
  };

  const handleClear = () => {
    onClearFilters();
    onClose();
  };

  const activeFilterCount =
    (tempFilters.category ? 1 : 0) +
    tempFilters.brands.length +
    (tempFilters.minPrice ? 1 : 0) +
    (tempFilters.maxPrice ? 1 : 0) +
    (tempFilters.inStock ? 1 : 0) +
    (tempFilters.hasDiscount ? 1 : 0) +
    (tempFilters.q ? 1 : 0);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background md:hidden animate-in fade-in duration-200">
      {/* Fullscreen Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-border-product bg-background shrink-0">
        <div className="flex items-center gap-2">
          <FilterIcon size={20} className="text-primary" />
          <h2 className="font-bold text-base text-foreground">فیلتر محصولات</h2>
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
              onClick={handleClear}
              className="text-xs font-medium text-error flex items-center gap-1 cursor-pointer"
            >
              <TrashIcon size={14} />
              <span>پاک‌کردن</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-subtle flex items-center justify-center text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
            aria-label="بستن"
          >
            <XIcon size={20} />
          </button>
        </div>
      </div>

      {/* Filter Content Area */}
      <div className="p-4 overflow-y-auto flex-1">
        <ProductFilterPanel
          filters={tempFilters}
          onFilterChange={(newFilters) => setTempFilters(newFilters)}
          onClearFilters={() =>
            setTempFilters({
              category: undefined,
              brands: [],
              minPrice: undefined,
              maxPrice: undefined,
              inStock: false,
              hasDiscount: false,
              q: undefined,
            })
          }
          allProducts={allProducts}
          className="border-none p-0 rounded-none shadow-none"
        />
      </div>

      {/* Fullscreen Sticky Action Footer (Applies filters on click) */}
      <div className="p-4 border-t border-border-product bg-background flex items-center gap-3 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom,1rem))]">
        <button
          type="button"
          onClick={handleApply}
          className="w-full h-12 bg-primary hover:bg-primary-hover active:bg-primary-active text-primary-foreground font-semibold text-sm rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
        >
          <span>اعمال فیلترها ({tempMatchingCount.toLocaleString("fa-IR")} کالا)</span>
        </button>
      </div>
    </div>
  );
}
