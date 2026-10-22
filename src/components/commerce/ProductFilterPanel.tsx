"use client";

import React, { useState, useEffect, useMemo } from "react";
import { catalogRepository } from "@/lib/repositories/catalogRepository";
import { Product } from "@/types/product";
import { TrashIcon, CheckIcon } from "@/components/icons";

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
  hideHeader?: boolean;
}

export function ProductFilterPanel({
  filters,
  onFilterChange,
  onClearFilters,
  allProducts,
  className = "",
  hideHeader = false,
}: ProductFilterPanelProps) {
  const [categories, setCategories] = useState(() => catalogRepository.getCategories());
  const [brands, setBrands] = useState(() => catalogRepository.getBrands());

  useEffect(() => {
    const sync = () => {
      setCategories(catalogRepository.getCategories());
      setBrands(catalogRepository.getBrands());
    };
    sync();
    return catalogRepository.subscribe(sync);
  }, []);
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

  const containerClasses = hideHeader
    ? `flex flex-col gap-6 text-foreground select-none ${className}`.trim()
    : `bg-background rounded-xl border border-border-product p-4 flex flex-col gap-6 text-foreground select-none max-h-[calc(100vh-7rem)] overflow-y-auto no-scrollbar ${className}`.trim();

  return (
    <aside className={containerClasses}>
      {/* Panel Header */}
      {!hideHeader && (
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
      )}

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
        <div className="flex flex-col gap-1 text-sm">
          {brands.map((brand) => {
            const isChecked = filters.brands.includes(brand.slug);
            const count = getBrandCount(brand.slug);
            return (
              <label
                key={brand.id}
                className={`relative flex items-center justify-between cursor-pointer group px-2.5 py-2 rounded-xl border transition-all duration-200 select-none ${
                  isChecked
                    ? "bg-primary/[0.04] border-primary/30"
                    : "bg-transparent border-transparent hover:bg-surface-subtle hover:border-border-product/60"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleBrandToggle(brand.slug)}
                  className="peer sr-only"
                />
                <div className="flex items-center gap-2.5">
                  {/* Custom Professional Checkbox Box */}
                  <div
                    className={` rounded-md border flex items-center justify-center transition-all duration-200 shrink-0 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30 ${
                      isChecked
                        ? "bg-primary border-primary text-white shadow-xs scale-100"
                        : "border-border-product bg-background group-hover:border-primary/60 group-hover:scale-105"
                    }`}
                  >
                    <CheckIcon
                      size={13}
                      strokeWidth={3}
                      className={`transition-all duration-200 ${
                        isChecked ? "opacity-100 scale-100" : "opacity-0 scale-50"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-sm transition-colors ${
                      isChecked ? "font-semibold text-primary" : "font-medium text-foreground group-hover:text-foreground"
                    }`}
                  >
                    {brand.name}
                  </span>
                </div>
                <span className="text-xs text-muted font-normal bg-surface-subtle/80 px-2 py-0.5 rounded-full">
                  {count}
                </span>
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
              placeholder="مثلا ۳،۰۰۰،۰۰۰"
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
                  filters.inStock ? "-translate-x-3" : "translate-x-1"
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
                  filters.hasDiscount ? "-translate-x-3" : "translate-x-1"
                }`}
              />
            </div>
          </label>
        </div>
      </div>
    </aside>
  );
}
