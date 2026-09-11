"use client";

import React from "react";
import { categories, brands } from "@/data/common";
import { Product } from "@/types/product";
import { TrashIcon, CheckIcon, ChevronLeftIcon } from "@/components/icons";

export interface FilterState {
  category?: string;
  brands: string[];
  minPrice?: number | string;
  maxPrice?: number | string;
  inStock?: boolean;
  hasDiscount?: boolean;
  q?: string;
}

interface ProductFilterPanelProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onClearFilters: () => void;
  allProducts: Product[];
  className?: string;
}

export function ProductFilterPanel({
  filters,
  onFilterChange,
  onClearFilters,
  allProducts,
  className = "",
}: ProductFilterPanelProps) {
  const activeFilterCount =
    (filters.category ? 1 : 0) +
    filters.brands.length +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (filters.hasDiscount ? 1 : 0) +
    (filters.q ? 1 : 0);

  // Helper to calculate product counts
  const getCategoryCount = (slug: string) => {
    return allProducts.filter((p) => p.category.slug === slug).length;
  };

  const getBrandCount = (slug: string) => {
    return allProducts.filter((p) => p.brand?.slug === slug).length;
  };

  // Toggle Category
  const handleCategorySelect = (slug?: string) => {
    onFilterChange({
      ...filters,
      category: filters.category === slug ? undefined : slug,
    });
  };

  // Toggle Brand
  const handleBrandToggle = (brandSlug: string) => {
    const isSelected = filters.brands.includes(brandSlug);
    const newBrands = isSelected
      ? filters.brands.filter((b) => b !== brandSlug)
      : [...filters.brands, brandSlug];
    onFilterChange({
      ...filters,
      brands: newBrands,
    });
  };

  // Price inputs
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    onFilterChange({ ...filters, minPrice: val ? Number(val) : undefined });
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    onFilterChange({ ...filters, maxPrice: val ? Number(val) : undefined });
  };

  return (
    <aside
      className={`bg-background rounded-xl border border-border-product p-4 flex flex-col gap-6 text-foreground select-none max-h-[calc(100vh-7rem)] overflow-y-auto ${className}`.trim()}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-border-product pb-3">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-base text-foreground">فیلترها</h2>
          {activeFilterCount > 0 && (
            <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-xs font-medium text-error hover:text-error/80 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <TrashIcon size={14} />

          </button>
        )}
      </div>

      {/* Filter Section: Categories */}
      <div className="flex flex-col gap-2.5">
        <h3 className="font-semibold text-sm text-foreground">دسته‌بندی‌ها</h3>
        <div className="flex flex-col gap-1 text-sm">
          <button
            onClick={() => handleCategorySelect(undefined)}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-right ${
              !filters.category
                ? "bg-primary/10 text-primary font-semibold"
                : "hover:bg-surface-subtle text-muted"
            }`}
          >
            <span>همه دسته‌ها</span>
            <span className="text-xs opacity-70">({allProducts.length})</span>
          </button>

          {categories.map((cat) => {
            const isSelected = filters.category === cat.slug;
            const count = getCategoryCount(cat.slug);
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.slug)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-right ${
                  isSelected
                    ? "bg-primary/10 text-primary font-semibold"
                    : "hover:bg-surface-subtle text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-primary" : "bg-border"}`} />
                  <span>{cat.name}</span>
                </div>
                <span className="text-xs text-muted font-normal">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-border-product" />

      {/* Filter Section: Brands */}
      <div className="flex flex-col gap-2.5">
        <h3 className="font-semibold text-sm text-foreground">برندها</h3>
        <div className="flex flex-col gap-2 text-sm">
          {brands.map((brand) => {
            const isChecked = filters.brands.includes(brand.slug);
            const count = getBrandCount(brand.slug);
            return (
              <label
                key={brand.id}
                className="flex items-center justify-between cursor-pointer group px-1 py-0.5 rounded hover:bg-surface-subtle transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      isChecked
                        ? "bg-primary border-primary text-white"
                        : "border-border group-hover:border-primary/60 bg-background"
                    }`}
                  >
                    {isChecked && <CheckIcon size={12} strokeWidth={3} />}
                  </div>
                  <span className="text-foreground text-sm font-medium">
                    {brand.name}
                  </span>
                </div>
                <span className="text-xs text-muted">({count})</span>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleBrandToggle(brand.slug)}
                  className="sr-only"
                />
              </label>
            );
          })}
        </div>
      </div>

      <hr className="border-border-product" />

      {/* Filter Section: Price Range */}
      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-sm text-foreground">محدوده قیمت (تومان)</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex flex-col gap-1">
            <span className="text-muted">از:</span>
            <input
              type="text"
              placeholder="0"
              value={filters.minPrice ? Number(filters.minPrice).toLocaleString("fa-IR") : ""}
              onChange={handleMinPriceChange}
              className="w-full h-9 bg-surface-subtle border border-border-product rounded-lg px-2.5 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors text-left dir-ltr"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted">تا:</span>
            <input
              type="text"
              placeholder="مثلا ۳,۰۰۰,۰۰۰"
              value={filters.maxPrice ? Number(filters.maxPrice).toLocaleString("fa-IR") : ""}
              onChange={handleMaxPriceChange}
              className="w-full h-9 bg-surface-subtle border border-border-product rounded-lg px-2.5 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors text-left dir-ltr"
            />
          </div>
        </div>
      </div>

      <hr className="border-border-product" />

      {/* Filter Section: Toggles */}
      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-sm text-foreground">وضعیت کالا</h3>
        <div className="flex flex-col gap-2.5">
          {/* In Stock toggle */}
          <label className="flex items-center justify-between cursor-pointer select-none">
            <span className="text-sm font-medium text-foreground">فقط کالاهای موجود</span>
            <div
              onClick={() =>
                onFilterChange({ ...filters, inStock: !filters.inStock })
              }
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                filters.inStock ? "bg-primary" : "bg-border-product"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  filters.inStock ? "-translate-x-5" : "translate-x-0"
                }`}
              />
            </div>
          </label>

          {/* Discount toggle */}
          <label className="flex items-center justify-between cursor-pointer select-none">
            <span className="text-sm font-medium text-foreground">فقط کالاهای تخفیف‌دار</span>
            <div
              onClick={() =>
                onFilterChange({ ...filters, hasDiscount: !filters.hasDiscount })
              }
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                filters.hasDiscount ? "bg-primary" : "bg-border-product"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  filters.hasDiscount ? "-translate-x-5" : "translate-x-0"
                }`}
              />
            </div>
          </label>
        </div>
      </div>
    </aside>
  );
}
