"use client";

import React, { useState, useTransition, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { products as initialProducts } from "@/data/products";
import { banners, categories } from "@/data/common";
import { ProductBannerSlider } from "@/components/commerce/ProductBannerSlider";
import { ProductFilterPanel, FilterState } from "@/components/commerce/ProductFilterPanel";
import { ProductFilterModal } from "@/components/commerce/ProductFilterModal";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { LoadMoreSentinel } from "@/components/commerce/LoadMoreSentinel";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { FilterIcon, SortIcon } from "@/components/icons";
import { usePaginatedProducts } from "@/hooks/usePaginatedProducts";
import { AlertCircle, RefreshCw } from "lucide-react";

export function ProductsClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Extract initial filters from URL search params
  const categoryParam = searchParams.get("category") || undefined;
  const brandParam = searchParams.get("brand")
    ? searchParams.get("brand")!.split(",")
    : searchParams.get("brands")
    ? searchParams.get("brands")!.split(",")
    : [];
  const minPriceParam = searchParams.get("minPrice") || searchParams.get("min_price") || undefined;
  const maxPriceParam = searchParams.get("maxPrice") || searchParams.get("max_price") || undefined;
  const inStockParam = searchParams.get("inStock") === "true" || searchParams.get("in_stock") === "true";
  const hasDiscountParam = searchParams.get("hasDiscount") === "true" || searchParams.get("has_discount") === "true";
  const sortParam = searchParams.get("sort") || "newest";
  const searchParam = searchParams.get("q") || searchParams.get("search") || undefined;

  const filters: FilterState = useMemo(
    () => ({
      category: categoryParam,
      brands: brandParam,
      minPrice: minPriceParam ? Number(minPriceParam) : undefined,
      maxPrice: maxPriceParam ? Number(maxPriceParam) : undefined,
      inStock: inStockParam,
      hasDiscount: hasDiscountParam,
      q: searchParam,
    }),
    [
      categoryParam,
      brandParam,
      minPriceParam,
      maxPriceParam,
      inStockParam,
      hasDiscountParam,
      searchParam,
    ]
  );

  // Paginated Product Hook & State Controller
  const queryFilters = useMemo(
    () => ({
      ...filters,
      minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      sort: sortParam,
    }),
    [filters, sortParam]
  );

  const {
    products,
    status,
    hasNextPage,
    total,
    fetchNextPage,
    retryNextPage,
    retryInitial,
  } = usePaginatedProducts(queryFilters);

  // Helper to update URL params cleanly
  const updateUrlFilters = (newFilters: FilterState, newSort?: string) => {
    const currentSort = newSort !== undefined ? newSort : sortParam;
    const params = new URLSearchParams();

    if (newFilters.category) params.set("category", newFilters.category);
    if (newFilters.brands.length > 0) params.set("brand", newFilters.brands.join(","));
    if (newFilters.minPrice) params.set("min_price", String(newFilters.minPrice));
    if (newFilters.maxPrice) params.set("max_price", String(newFilters.maxPrice));
    if (newFilters.inStock) params.set("in_stock", "true");
    if (newFilters.hasDiscount) params.set("has_discount", "true");
    if (newFilters.q) params.set("q", newFilters.q);
    if (currentSort && currentSort !== "newest") params.set("sort", currentSort);

    const queryString = params.toString();
    startTransition(() => {
      router.push(queryString ? `/products?${queryString}` : "/products", { scroll: false });
    });
  };

  const handleClearFilters = () => {
    startTransition(() => {
      router.push("/products", { scroll: false });
    });
  };

  const sortOptions = [
    { id: "newest", label: "جدیدترین" },
    { id: "price_asc", label: "ارزان‌ترین" },
    { id: "price_desc", label: "گران‌ترین" },
    { id: "discount", label: "بیشترین تخفیف" },
  ];

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateUrlFilters(filters, e.target.value);
  };

  // Active Category Name
  const activeCategoryObj = categories.find((c) => c.slug === filters.category);
  const activeCategoryName = activeCategoryObj ? activeCategoryObj.name : "همه محصولات";

  const activeFilterCount =
    (filters.category ? 1 : 0) +
    filters.brands.length +
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (filters.hasDiscount ? 1 : 0) +
    (filters.q ? 1 : 0);

  // Compute skeleton count for current page state
  const skeletonCount =
    status === "initial_loading" ? 8 : status === "loading_more" ? 8 : 0;

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* 1. Auto Slider Banner (Desktop 200px, Mobile 100px) */}
      <ProductBannerSlider banners={banners} autoPlayInterval={3500} />

      {/* Main Content Container */}
      <Container>
        {/* Page Header Title & Count */}
        <div className="flex flex-col gap-1 mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            {activeCategoryName}
          </h1>
        </div>

        {/* Mobile Action Bar: Minimal Filter Button & Styled Sort Dropdown in 1 Row */}
        <div className="grid grid-cols-2 gap-2.5 md:hidden mb-4">
          {/* Filter Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className="h-11 px-3 bg-surface-subtle hover:bg-surface-muted border border-border-product rounded-xl flex items-center justify-center gap-2 text-xs font-medium text-foreground transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
          >
            <FilterIcon size={16} className="text-primary shrink-0" />
            <span>فیلترها</span>
            {activeFilterCount > 0 && (
              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Styled Minimal Sort Dropdown */}
          <div className="relative h-11">
            <div className="absolute inset-0 bg-surface-subtle border border-border-product rounded-xl flex items-center justify-between px-3 pointer-events-none">
              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground truncate">
                <SortIcon size={16} className="text-primary shrink-0" />
                <span className="truncate">
                  {sortOptions.find((o) => o.id === sortParam)?.label || "جدیدترین"}
                </span>
              </div>
              <span className="text-muted text-[10px]">▼</span>
            </div>
            <select
              value={sortParam}
              aria-label="مرتب‌سازی محصولات"
              onChange={handleSortChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-xs"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2 & 3. Main Grid Layout (Desktop right side filter panel, left side product grid) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Desktop Right Filter Panel */}
          <div className="hidden md:block md:col-span-1 sticky top-36">
            <ProductFilterPanel
              filters={filters}
              onFilterChange={updateUrlFilters}
              onClearFilters={handleClearFilters}
              allProducts={initialProducts}
            />
          </div>

          {/* Product Grid Area (Left side) */}
          <div className="md:col-span-3 flex flex-col gap-4">
            {/* Top Toolbar (Desktop Horizontal Sort Links & result count) */}
            <div className="hidden md:flex bg-background border border-border-product rounded-xl px-4 py-2.5 items-center justify-between gap-4 text-xs md:text-sm">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-muted font-medium shrink-0">
                  <SortIcon size={18} />
                  <span>مرتب‌سازی بر اساس:</span>
                </div>

                {/* Horizontal Link-style buttons for Desktop */}
                <div className="flex items-center gap-1">
                  {sortOptions.map((option) => {
                    const isActive = sortParam === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => updateUrlFilters(filters, option.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all cursor-pointer ${
                          isActive
                            ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                            : "text-muted hover:text-foreground hover:bg-surface-subtle"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <span className="text-xs text-muted font-normal shrink-0">
                {total.toLocaleString("fa-IR")} کالا
              </span>
            </div>

            {/* Initial Error State */}
            {status === "initial_error" ? (
              <div className="w-full py-12 px-4 flex flex-col items-center justify-center text-center bg-surface-subtle rounded-xl border border-border-product gap-3">
                <AlertCircle className="w-8 h-8 text-rose-500" />
                <p className="text-sm font-medium text-foreground">
                  خطایی در بارگذاری محصولات به وجود آمد.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retryInitial}
                  className="gap-2 text-xs font-medium"
                >
                  <RefreshCw size={14} />
                  <span>تلاش مجدد</span>
                </Button>
              </div>
            ) : (
              <>
                {/* Product Grid */}
                <ProductGrid
                  products={products}
                  skeletonCount={skeletonCount}
                  emptyMessage="محصولی با این مشخصات یافت نشد."
                />

                {/* Load More Error UI (Preserves already loaded products) */}
                {status === "load_more_error" && (
                  <div className="w-full py-4 px-4 mt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-200/60 dark:border-rose-900/40">
                    <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs sm:text-sm">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>بارگذاری محصولات با مشکل مواجه شد</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={retryNextPage}
                      className="gap-1.5 text-xs font-medium shrink-0 border-rose-300 text-rose-700 hover:bg-rose-100"
                    >
                      <RefreshCw size={13} />
                      <span>تلاش مجدد</span>
                    </Button>
                  </div>
                )}

                {/* Sentinel for Infinite Incremental Scroll */}
                <LoadMoreSentinel
                  onIntersect={fetchNextPage}
                  disabled={
                    status === "initial_loading" ||
                    status === "loading_more" ||
                    status === "load_more_error" ||
                    !hasNextPage
                  }
                />
              </>
            )}
          </div>
        </div>
      </Container>

      {/* Mobile Filter Modal */}
      <ProductFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onFilterChange={updateUrlFilters}
        onClearFilters={handleClearFilters}
        allProducts={initialProducts}
        matchingCount={total}
      />
    </div>
  );
}
