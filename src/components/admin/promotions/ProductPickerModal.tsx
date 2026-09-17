"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { products as ALL_PRODUCTS } from "@/data/products";
import { Product } from "@/types/product";
import { Search, X, Check, Filter } from "lucide-react";
import { formatPrice } from "@/lib/formatting/currency";

interface ProductPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProductIds: string[];
  onConfirm: (productIds: string[]) => void;
}

export function ProductPickerModal({
  isOpen,
  onClose,
  selectedProductIds,
  onConfirm,
}: ProductPickerModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedProductIds);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Sync selectedIds when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedIds(selectedProductIds);
    }
  }, [isOpen, selectedProductIds]);

  // Derive unique categories from products list
  const categoriesList = useMemo(() => {
    const map = new Map<string, string>();
    ALL_PRODUCTS.forEach((p) => {
      if (p.category) {
        map.set(p.category.id, p.category.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, []);

  // Filter products by search query and category
  const filteredProducts = useMemo(() => {
    return ALL_PRODUCTS.filter((p) => {
      const matchCat =
        selectedCategory === "all" || p.category?.id === selectedCategory;
      if (!matchCat) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchCategory = p.category?.name.toLowerCase().includes(q);
      const matchSku = p.variants?.some((v) =>
        v.sku?.toLowerCase().includes(q)
      );

      return matchTitle || matchCategory || matchSku;
    });
  }, [searchQuery, selectedCategory]);

  const toggleSelectProduct = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredProducts.map((p) => p.id);
    const allSelected = filteredIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      // Unselect all filtered
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      // Select all filtered
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleSave = () => {
    onConfirm(selectedIds);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-background border border-border rounded-2xl w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl overflow-hidden dir-rtl">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between shrink-0 bg-surface-subtle">
          <div>
            <h3 className="font-bold text-base md:text-lg text-foreground">
              انتخاب محصولات
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedIds.length.toLocaleString("fa-IR")} محصول انتخاب شده
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-muted rounded-full transition-colors"
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-3 sm:p-4 border-b border-border bg-background flex flex-col sm:flex-row gap-2.5 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="جستجو با نام، دسته‌بندی یا SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pr-9 pl-3 text-xs md:text-sm bg-surface-subtle border border-border rounded-lg focus:outline-none focus:border-primary text-foreground"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 px-3 text-xs md:text-sm bg-surface-subtle border border-border rounded-lg focus:outline-none focus:border-primary text-foreground"
            >
              <option value="all">همه دسته‌ها</option>
              {categoriesList.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleSelectAllFiltered}
              className="h-9 px-3 text-xs font-medium border border-border rounded-lg hover:bg-surface-subtle text-foreground whitespace-nowrap transition-colors"
            >
              انتخاب همه این لیست
            </button>
          </div>
        </div>

        {/* Product Grid List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 no-scrollbar">
          {filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              محصولی با این مشخصات یافت نشد.
            </div>
          ) : (
            filteredProducts.map((product) => {
              const isSelected = selectedIds.includes(product.id);
              const mainImg = product.images?.[0]?.url || "/images/product-1.webp";
              const sku = product.variants?.[0]?.sku || "―";

              return (
                <div
                  key={product.id}
                  onClick={() => toggleSelectProduct(product.id)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-2xs"
                      : "border-border hover:border-border-subtle bg-background"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-border-subtle bg-background"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <div className="w-12 h-12 relative rounded-lg bg-surface-subtle overflow-hidden shrink-0 border border-border-subtle">
                    <Image
                      src={mainImg}
                      alt={product.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs md:text-sm font-semibold text-foreground truncate">
                      {product.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                      <span>دسته: {product.category?.name || "عمومی"}</span>
                      <span>•</span>
                      <span>SKU: {sku}</span>
                    </div>
                  </div>

                  <div className="text-left font-bold text-xs md:text-sm text-foreground shrink-0">
                    {formatPrice(product.pricing.minPrice)} تومان
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-border bg-surface-subtle flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="text-xs text-rose-600 font-medium hover:underline px-2 py-1"
          >
            پاک کردن همه
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-foreground bg-background border border-border rounded-xl hover:bg-surface-muted transition-colors"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-colors"
            >
              تایید انتخاب ({selectedIds.length.toLocaleString("fa-IR")})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
