"use client";

import React, { useState, useTransition, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { products as initialProducts } from "@/data/products";
import { banners, categories, brands } from "@/data/common";
import { ProductBannerSlider } from "@/components/commerce/ProductBannerSlider";
import { ProductFilterPanel, FilterState } from "@/components/commerce/ProductFilterPanel";
import { ProductFilterModal } from "@/components/commerce/ProductFilterModal";
import { ProductGrid } from "@/components/commerce/ProductGrid";
import { Container } from "@/components/ui/Container";
import { FilterIcon, SortIcon, XIcon, TrashIcon } from "@/components/icons";
import { Product } from "@/types/product";

export function ProductsClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
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
      brandParam.join(","),
      minPriceParam,
      maxPriceParam,
      inStockParam,
      hasDiscountParam,
      searchParam,
    ]
  );

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

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateUrlFilters(filters, e.target.value);
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let list = [...initialProducts];

    // Filter by category
    if (filters.category) {
      list = list.filter((p) => p.category.slug === filters.category);
    }

    // Filter by brands
    if (filters.brands.length > 0) {
      list = list.filter((p) => p.brand?.slug && filters.brands.includes(p.brand.slug));
    }

    // Filter by price range
    if (filters.minPrice !== undefined && !isNaN(Number(filters.minPrice))) {
      list = list.filter((p) => p.pricing.minPrice >= Number(filters.minPrice));
    }
    if (filters.maxPrice !== undefined && !isNaN(Number(filters.maxPrice))) {
      list = list.filter((p) => p.pricing.minPrice <= Number(filters.maxPrice));
    }

    // Filter by stock
    if (filters.inStock) {
      list = list.filter((p) => p.inventory.totalStock > 0);
    }

    // Filter by discount
    if (filters.hasDiscount) {
      list = list.filter((p) => p.pricing.hasDiscount);
    }

    // Search query filter
    if (filters.q && filters.q.trim() !== "") {
      const q = filters.q.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          p.category.name.toLowerCase().includes(q) ||
          (p.brand?.name && p.brand.name.toLowerCase().includes(q)) ||
          (p.tags && p.tags.some((tag) => tag.toLowerCase().includes(q)))
      );
    }

    // Sort list
    if (sortParam === "price_asc") {
      list.sort((a, b) => a.pricing.minPrice - b.pricing.minPrice);
    } else if (sortParam === "price_desc") {
      list.sort((a, b) => b.pricing.minPrice - a.pricing.minPrice);
    } else if (sortParam === "discount") {
      list.sort(
        (a, b) =>
          (b.variants[0]?.pricing?.discountPercent || 0) -
          (a.variants[0]?.pricing?.discountPercent || 0)
      );
    } else {
      // newest
      list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return list;
  }, [filters, sortParam]);

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

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* 1. Auto Slider Banner (Desktop 200px, Mobile 100px) */}
      <ProductBannerSlider banners={banners} autoPlayInterval={3500} />

      {/* Main Content Container */}
      <Container>
        {/* Page Header Title & Breadcrumb/Count */}
        <div className="flex flex-col gap-1 mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            {activeCategoryName}
          </h1>
          <p className="text-xs md:text-sm text-muted">
            نمایش {filteredProducts.length.toLocaleString("fa-IR")} کالا در این بخش
          </p>
        </div>

        {/* Mobile Filter Button (Full-width button for mobile modal trigger) */}
        <div className="block md:hidden mb-4">
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className="w-full h-12 bg-primary hover:bg-primary-hover active:bg-primary-active text-primary-foreground font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            <FilterIcon size={18} />
            <span>فیلتر و مرتب‌سازی محصولات</span>
            {activeFilterCount > 0 && (
              <span className="bg-white text-primary text-xs font-bold px-2 py-0.5 rounded-full mr-1">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Active Filter Badges Bar */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-4 pb-2 border-b border-border-product text-xs">
            <span className="text-muted font-medium ml-1">فیلترهای فعال:</span>

            {filters.category && activeCategoryObj && (
              <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                دسته‌بندی: {activeCategoryObj.name}
                <button
                  onClick={() => updateUrlFilters({ ...filters, category: undefined })}
                  className="hover:text-primary-hover cursor-pointer"
                >
                  <XIcon size={14} />
                </button>
              </span>
            )}

            {filters.brands.map((bSlug) => {
              const brandObj = brands.find((b) => b.slug === bSlug);
              return (
                <span
                  key={bSlug}
                  className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full font-medium"
                >
                  برند: {brandObj ? brandObj.name : bSlug}
                  <button
                    onClick={() =>
                      updateUrlFilters({
                        ...filters,
                        brands: filters.brands.filter((b) => b !== bSlug),
                      })
                    }
                    className="hover:text-primary-hover cursor-pointer"
                  >
                    <XIcon size={14} />
                  </button>
                </span>
              );
            })}

            {filters.minPrice !== undefined && (
              <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                از: {Number(filters.minPrice).toLocaleString("fa-IR")} تومان
                <button
                  onClick={() => updateUrlFilters({ ...filters, minPrice: undefined })}
                  className="hover:text-primary-hover cursor-pointer"
                >
                  <XIcon size={14} />
                </button>
              </span>
            )}

            {filters.maxPrice !== undefined && (
              <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                تا: {Number(filters.maxPrice).toLocaleString("fa-IR")} تومان
                <button
                  onClick={() => updateUrlFilters({ ...filters, maxPrice: undefined })}
                  className="hover:text-primary-hover cursor-pointer"
                >
                  <XIcon size={14} />
                </button>
              </span>
            )}

            {filters.inStock && (
              <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                فقط کالاهای موجود
                <button
                  onClick={() => updateUrlFilters({ ...filters, inStock: false })}
                  className="hover:text-primary-hover cursor-pointer"
                >
                  <XIcon size={14} />
                </button>
              </span>
            )}

            {filters.hasDiscount && (
              <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                فقط تخفیف‌دار
                <button
                  onClick={() => updateUrlFilters({ ...filters, hasDiscount: false })}
                  className="hover:text-primary-hover cursor-pointer"
                >
                  <XIcon size={14} />
                </button>
              </span>
            )}

            {filters.q && (
              <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                جستجو: {filters.q}
                <button
                  onClick={() => updateUrlFilters({ ...filters, q: undefined })}
                  className="hover:text-primary-hover cursor-pointer"
                >
                  <XIcon size={14} />
                </button>
              </span>
            )}

            <button
              onClick={handleClearFilters}
              className="text-error font-medium hover:underline cursor-pointer mr-auto"
            >
              حذف همه
            </button>
          </div>
        )}

        {/* 2 & 3. Main Grid Layout (Desktop right side filter panel, left side product grid) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Desktop Right Filter Panel (Order 1 on RTL layout or order-first) */}
          <div className="hidden md:block md:col-span-1 sticky top-24">
            <ProductFilterPanel
              filters={filters}
              onFilterChange={updateUrlFilters}
              onClearFilters={handleClearFilters}
              allProducts={initialProducts}
            />
          </div>

          {/* Product Grid Area (Left side) */}
          <div className="md:col-span-3 flex flex-col gap-4">
            {/* Top Toolbar (Sort dropdown & result count) */}
            <div className="bg-background border border-border-product rounded-xl px-4 py-2.5 flex items-center justify-between gap-4 text-xs md:text-sm">
              <div className="flex items-center gap-2 text-muted">
                <SortIcon size={18} />
                <span className="hidden sm:inline">مرتب‌سازی بر اساس:</span>
              </div>

              <select
                value={sortParam}
                onChange={handleSortChange}
                className="bg-surface-subtle border border-border-product rounded-lg px-3 py-1.5 text-xs md:text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="newest">جدیدترین</option>
                <option value="price_asc">ارزان‌ترین</option>
                <option value="price_desc">گران‌ترین</option>
                <option value="discount">بیشترین تخفیف</option>
              </select>
            </div>

            {/* Product Grid */}
            <div className={isPending ? "opacity-60 transition-opacity" : ""}>
              <ProductGrid products={filteredProducts} />
            </div>
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
        matchingCount={filteredProducts.length}
      />
    </div>
  );
}
