"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  X,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Boxes,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  SlidersHorizontal,
  CheckCircle2,
  PackageX,
  FileText,
  AlertTriangle,
  Package,
  ChevronRight,
  ChevronLeft,
  Layers,
} from "lucide-react";

import { useProducts } from "@/context/ProductContext";
import { Product, ProductStatus, ProductVariant } from "@/types/product";
import { formatPrice } from "@/lib/formatting/currency";
import { useToast } from "@/components/ui/Toast";

// Helpers
const formatDate = (dateString: string) => {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(d);
  } catch {
    return dateString;
  }
};

const getStatusInfo = (status: ProductStatus) => {
  switch (status) {
    case "active":
      return {
        label: "منتشرشده",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
        icon: CheckCircle2,
      };
    case "draft":
      return {
        label: "پیش‌نویس",
        className: "bg-amber-50 text-amber-700 border-amber-200/60",
        icon: FileText,
      };
    case "archived":
      return {
        label: "آرشیو شده",
        className: "bg-rose-50 text-rose-700 border-rose-200/60",
        icon: PackageX,
      };
    default:
      return {
        label: status,
        className: "bg-gray-50 text-gray-700 border-gray-200/60",
        icon: Package,
      };
  }
};

type ModalType =
  | { type: "view"; product: Product }
  | { type: "stock"; product: Product }
  | { type: "delete_product"; product: Product }
  | { type: "delete_variant"; product: Product; variant: ProductVariant }
  | { type: "edit_variant"; product: Product; variant: ProductVariant }
  | { type: "bulk_status" }
  | { type: "bulk_stock" }
  | { type: "bulk_delete" }
  | null;

export default function AdminProductsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const {
    products,
    categories,
    brands,
    isLoaded,
    deleteProduct,
    deleteBulkProducts,
    deleteVariant,
    updateVariant,
    bulkUpdateStatus,
    bulkUpdateStock,
    updateProduct,
  } = useProducts();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedStockStatus, setSelectedStockStatus] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "price_asc" | "price_desc" | "stock_asc" | "stock_desc"
  >("newest");

  // Expanded Product IDs
  const [expandedProductIds, setExpandedProductIds] = useState<string[]>([]);

  // Selection (Product IDs and Variant Keys e.g. "prodId:varId")
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedVariantKeys, setSelectedVariantKeys] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Mobile Drawers & Action Menus
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Form states inside modals
  const [stockInputValue, setStockInputValue] = useState<number>(0);
  const [editVariantData, setEditVariantData] = useState<{
    price: number;
    compareAtPrice: number | undefined;
    stock: number;
    sku: string;
    status: "active" | "inactive";
  }>({
    price: 0,
    compareAtPrice: undefined,
    stock: 0,
    sku: "",
    status: "active",
  });

  const [bulkTargetStatus, setBulkTargetStatus] = useState<ProductStatus>("active");
  const [bulkStockValue, setBulkStockValue] = useState<number>(10);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedCategory !== "all") count++;
    if (selectedStatus !== "all") count++;
    if (selectedStockStatus !== "all") count++;
    if (selectedBrand !== "all") count++;
    return count;
  }, [
    searchQuery,
    selectedCategory,
    selectedStatus,
    selectedStockStatus,
    selectedBrand,
  ]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSelectedStockStatus("all");
    setSelectedBrand("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = product.title.toLowerCase().includes(q);
        const slugMatch = product.slug.toLowerCase().includes(q);
        const catMatch = product.category.name.toLowerCase().includes(q);
        const brandMatch = product.brand?.name.toLowerCase().includes(q);
        const tagMatch = product.tags?.some((t) => t.toLowerCase().includes(q));
        const variantSkuMatch = product.variants.some((v) =>
          v.sku?.toLowerCase().includes(q)
        );

        if (
          !titleMatch &&
          !slugMatch &&
          !catMatch &&
          !brandMatch &&
          !tagMatch &&
          !variantSkuMatch
        ) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== "all" && product.category.id !== selectedCategory) {
        return false;
      }

      // Publication Status
      if (selectedStatus !== "all" && product.status !== selectedStatus) {
        return false;
      }

      // Stock Status
      if (selectedStockStatus === "in_stock" && product.inventory.totalStock <= 0) {
        return false;
      }
      if (selectedStockStatus === "out_of_stock" && product.inventory.totalStock > 0) {
        return false;
      }
      if (
        selectedStockStatus === "low_stock" &&
        (product.inventory.totalStock <= 0 || product.inventory.totalStock > 5)
      ) {
        return false;
      }

      // Brand
      if (selectedBrand !== "all" && product.brand?.id !== selectedBrand) {
        return false;
      }

      return true;
    });
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedStatus,
    selectedStockStatus,
    selectedBrand,
  ]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "price_asc") {
        return a.pricing.minPrice - b.pricing.minPrice;
      }
      if (sortBy === "price_desc") {
        return b.pricing.minPrice - a.pricing.minPrice;
      }
      if (sortBy === "stock_asc") {
        return a.inventory.totalStock - b.inventory.totalStock;
      }
      if (sortBy === "stock_desc") {
        return b.inventory.totalStock - a.inventory.totalStock;
      }
      return 0;
    });
  }, [filteredProducts, sortBy]);

  // Pagination Slice
  const totalItems = sortedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const validPage = Math.min(currentPage, totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (validPage - 1) * itemsPerPage;
    return sortedProducts.slice(start, start + itemsPerPage);
  }, [sortedProducts, validPage, itemsPerPage]);

  // Toggle Expander
  const toggleExpandProduct = (id: string) => {
    setExpandedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Checkbox Selection
  const isAllPageSelected =
    paginatedProducts.length > 0 &&
    paginatedProducts.every((p) => selectedProductIds.includes(p.id));

  const handleSelectAllPage = () => {
    if (isAllPageSelected) {
      const pageIds = paginatedProducts.map((p) => p.id);
      setSelectedProductIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      const pageIds = paginatedProducts.map((p) => p.id);
      setSelectedProductIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelectProduct = (product: Product) => {
    const isSelected = selectedProductIds.includes(product.id);
    if (isSelected) {
      setSelectedProductIds((prev) => prev.filter((id) => id !== product.id));
      // Deselect its variants
      setSelectedVariantKeys((prev) =>
        prev.filter((key) => !key.startsWith(`${product.id}:`))
      );
    } else {
      setSelectedProductIds((prev) => [...prev, product.id]);
      // Select all its variants
      const varKeys = product.variants.map((v) => `${product.id}:${v.id}`);
      setSelectedVariantKeys((prev) => Array.from(new Set([...prev, ...varKeys])));
    }
  };

  const handleToggleSelectVariant = (productId: string, variantId: string) => {
    const key = `${productId}:${variantId}`;
    setSelectedVariantKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const totalSelectedCount = selectedProductIds.length + selectedVariantKeys.length;

  // Option Value Helper
  const getOptionValueLabel = (product: Product, optionId: string, valueId: string) => {
    const option = product.options.find((o) => o.id === optionId);
    if (!option) return valueId;
    const valObj = option.values.find((v) => v.id === valueId);
    return valObj ? valObj.label : valueId;
  };

  const getVariantCombinationText = (product: Product, variant: ProductVariant) => {
    if (!variant.optionValues || variant.optionValues.length === 0) {
      return "پیش‌فرض";
    }
    return variant.optionValues
      .map((ov) => getOptionValueLabel(product, ov.optionId, ov.valueId))
      .join(" / ");
  };

  // Action Handlers
  const handleOpenStockModal = (product: Product) => {
    setStockInputValue(product.inventory.totalStock);
    setActiveModal({ type: "stock", product });
    setActiveMenuId(null);
  };

  const handleSaveStock = () => {
    if (activeModal?.type !== "stock" || !activeModal.product) return;
    const prod = activeModal.product;
    updateProduct(prod.id, {
      inventory: {
        ...prod.inventory,
        totalStock: stockInputValue,
        hasAvailableVariants: stockInputValue > 0,
      },
    });
    showToast(`موجودی محصول «${prod.title}» تغییر یافت.`, "success");
    setActiveModal(null);
  };

  const handleConfirmDeleteProduct = () => {
    if (activeModal?.type !== "delete_product" || !activeModal.product) return;
    const prod = activeModal.product;
    deleteProduct(prod.id);
    setSelectedProductIds((prev) => prev.filter((id) => id !== prod.id));
    setSelectedVariantKeys((prev) =>
      prev.filter((k) => !k.startsWith(`${prod.id}:`))
    );
    showToast(`محصول «${prod.title}» و تمام واریانت‌های آن حذف شدند.`, "success");
    setActiveModal(null);
  };

  const handleOpenEditVariantModal = (product: Product, variant: ProductVariant) => {
    setEditVariantData({
      price: variant.pricing?.price ?? product.pricing.minPrice,
      compareAtPrice: variant.pricing?.compareAtPrice,
      stock: variant.inventory?.stock ?? 0,
      sku: variant.sku || "",
      status: variant.status || "active",
    });
    setActiveModal({ type: "edit_variant", product, variant });
  };

  const handleSaveEditVariant = () => {
    if (activeModal?.type !== "edit_variant" || !activeModal.variant) return;
    const { product, variant } = activeModal;
    updateVariant(product.id, variant.id, {
      sku: editVariantData.sku,
      status: editVariantData.status,
      pricing: {
        price: editVariantData.price,
        compareAtPrice: editVariantData.compareAtPrice,
      },
      inventory: {
        stock: editVariantData.stock,
        trackStock: true,
      },
    });
    showToast(`واریانت ${editVariantData.sku || ""} با موفقیت به روز شد.`, "success");
    setActiveModal(null);
  };

  const handleConfirmDeleteVariant = () => {
    if (activeModal?.type !== "delete_variant" || !activeModal.variant) return;
    const { product, variant } = activeModal;
    deleteVariant(product.id, variant.id);
    setSelectedVariantKeys((prev) =>
      prev.filter((k) => k !== `${product.id}:${variant.id}`)
    );
    showToast("واریانت با موفقیت حذف شد.", "success");
    setActiveModal(null);
  };

  // Bulk Handlers
  const handleApplyBulkStatus = () => {
    if (selectedProductIds.length > 0) {
      bulkUpdateStatus(selectedProductIds, bulkTargetStatus);
    }
    showToast("وضعیت محصولات انتخاب‌شده به‌روزرسانی شد.", "success");
    setSelectedProductIds([]);
    setSelectedVariantKeys([]);
    setActiveModal(null);
  };

  const handleApplyBulkStock = () => {
    if (selectedProductIds.length > 0) {
      bulkUpdateStock(selectedProductIds, bulkStockValue);
    }
    showToast("موجودی محصولات انتخاب‌شده به‌روزرسانی شد.", "success");
    setSelectedProductIds([]);
    setSelectedVariantKeys([]);
    setActiveModal(null);
  };

  const handleApplyBulkDelete = () => {
    if (selectedProductIds.length > 0) {
      deleteBulkProducts(selectedProductIds);
    }
    showToast("محصولات انتخاب‌شده حذف شدند.", "success");
    setSelectedProductIds([]);
    setSelectedVariantKeys([]);
    setActiveModal(null);
  };

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-muted-foreground font-medium">
          در حال بارگذاری اطلاعات محصولات...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* =========================================================================
          1. PAGE HEADER
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
              محصولات
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              {products.length} کالا
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            مدیریت یکپارچه کاتالوگ محصولات، واریانت‌ها، موجودی انبار و قیمت‌گذاری
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center gap-2 h-10 px-4 text-xs sm:text-sm font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن محصول</span>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          2. SEARCH & FILTERS BAR
         ========================================================================= */}
      {/* Desktop Filter Bar */}
      <div className="hidden lg:flex flex-col gap-3 bg-background p-4 rounded-md border border-border">
        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="جستجو در عنوان، SKU، دسته‌بندی، برند یا برچسب..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-10 pr-9 pl-8 bg-surface-subtle border border-border/80 rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:bg-background transition-colors"
            />
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 bg-surface-subtle border border-border/80 rounded-md text-xs font-medium text-foreground focus:outline-none focus:border-primary cursor-pointer min-w-[130px]"
          >
            <option value="all">همه دسته‌بندی‌ها</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 bg-surface-subtle border border-border/80 rounded-md text-xs font-medium text-foreground focus:outline-none focus:border-primary cursor-pointer min-w-[120px]"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="active">منتشرشده</option>
            <option value="draft">پیش‌نویس</option>
            <option value="archived">آرشیو شده</option>
          </select>

          {/* Stock Filter */}
          <select
            value={selectedStockStatus}
            onChange={(e) => {
              setSelectedStockStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 bg-surface-subtle border border-border/80 rounded-md text-xs font-medium text-foreground focus:outline-none focus:border-primary cursor-pointer min-w-[120px]"
          >
            <option value="all">وضعیت موجودی</option>
            <option value="in_stock">موجود در انبار</option>
            <option value="low_stock">کم‌موجودی (≤ ۵)</option>
            <option value="out_of_stock">ناموجود</option>
          </select>

          {/* Brand Filter */}
          <select
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 bg-surface-subtle border border-border/80 rounded-md text-xs font-medium text-foreground focus:outline-none focus:border-primary cursor-pointer min-w-[110px]"
          >
            <option value="all">همه برندها</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-10 px-3 bg-surface-subtle border border-border/80 rounded-md text-xs font-medium text-foreground focus:outline-none focus:border-primary cursor-pointer min-w-[120px]"
          >
            <option value="newest">جدیدترین</option>
            <option value="oldest">قدیمی‌ترین</option>
            <option value="price_asc">قیمت: کم به زیاد</option>
            <option value="price_desc">قیمت: زیاد به کم</option>
            <option value="stock_desc">موجودی: بیشترین</option>
            <option value="stock_asc">موجودی: کمترین</option>
          </select>

          {/* Clear Filters Button */}
          {activeFiltersCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 h-10 px-3 text-xs font-semibold text-error bg-error/10 hover:bg-error/20 rounded-md transition-colors shrink-0"
              title="حذف فیلترها"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>حذف فیلترها ({activeFiltersCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Filter & Search Bar */}
      <div className="lg:hidden flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="جستجوی سریع..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-10 pr-9 pl-8 bg-background border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setMobileFilterOpen(true)}
          className="relative inline-flex items-center justify-center gap-1.5 h-10 px-3 bg-background border border-border rounded-md text-xs font-semibold text-foreground hover:bg-surface-subtle shrink-0"
        >
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          <span>فیلترها</span>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative bg-background border-t border-border rounded-t-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto z-10">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">فیلتر و مرتب‌سازی</h3>
              </div>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-muted-foreground mb-1 font-medium">
                  دسته‌بندی
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-subtle border border-border rounded-md font-medium text-foreground"
                >
                  <option value="all">همه دسته‌بندی‌ها</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-medium">
                  وضعیت انتشار
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-subtle border border-border rounded-md font-medium text-foreground"
                >
                  <option value="all">همه وضعیت‌ها</option>
                  <option value="active">منتشرشده</option>
                  <option value="draft">پیش‌نویس</option>
                  <option value="archived">آرشیو شده</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-medium">
                  وضعیت موجودی
                </label>
                <select
                  value={selectedStockStatus}
                  onChange={(e) => setSelectedStockStatus(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-subtle border border-border rounded-md font-medium text-foreground"
                >
                  <option value="all">همه وضعیت‌های موجودی</option>
                  <option value="in_stock">موجود در انبار</option>
                  <option value="low_stock">کم‌موجودی (≤ ۵)</option>
                  <option value="out_of_stock">ناموجود</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-medium">برند</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-subtle border border-border rounded-md font-medium text-foreground"
                >
                  <option value="all">همه برندها</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-medium">
                  ترتیب نمایش
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full h-10 px-3 bg-surface-subtle border border-border rounded-md font-medium text-foreground"
                >
                  <option value="newest">جدیدترین</option>
                  <option value="oldest">قدیمی‌ترین</option>
                  <option value="price_asc">قیمت: کم به زیاد</option>
                  <option value="price_desc">قیمت: زیاد به کم</option>
                  <option value="stock_desc">موجودی: بیشترین</option>
                  <option value="stock_asc">موجودی: کمترین</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 h-10 bg-primary text-primary-foreground font-bold rounded-md text-xs"
              >
                اعمال فیلترها
              </button>
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => {
                    handleResetFilters();
                    setMobileFilterOpen(false);
                  }}
                  className="h-10 px-3 bg-surface-subtle text-error font-semibold rounded-md text-xs"
                >
                  حذف همه
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. BULK ACTIONS BAR
         ========================================================================= */}
      {totalSelectedCount > 0 && (
        <div className="sticky top-20 z-10 bg-primary text-primary-foreground p-3 sm:p-4 rounded-md shadow-md flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-bold">
              {totalSelectedCount} آیتم انتخاب شده است
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveModal({ type: "bulk_status" })}
              className="h-8 px-3 text-xs font-semibold rounded bg-white/10 hover:bg-white/20 transition-colors"
            >
              تغییر وضعیت انتشار
            </button>
            <button
              onClick={() => setActiveModal({ type: "bulk_stock" })}
              className="h-8 px-3 text-xs font-semibold rounded bg-white/10 hover:bg-white/20 transition-colors"
            >
              تغییر موجودی
            </button>
            <button
              onClick={() => setActiveModal({ type: "bulk_delete" })}
              className="h-8 px-3 text-xs font-semibold rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              حذف گروهی
            </button>
            <button
              onClick={() => {
                setSelectedProductIds([]);
                setSelectedVariantKeys([]);
              }}
              className="h-8 px-2.5 text-xs text-white/80 hover:text-white"
              title="انصراف از انتخاب"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. PRODUCTS & NESTED VARIANTS LIST (DESKTOP TABLE & MOBILE COMPACT)
         ========================================================================= */}
      {paginatedProducts.length === 0 ? (
        /* EMPTY STATE */
        <div className="bg-background border border-border rounded-md p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-surface-subtle flex items-center justify-center text-muted-foreground">
            <PackageX className="w-6 h-6" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-foreground">
            هیچ محصولی یافت نشد!
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            محصولی با مشخصات و فیلترهای انتخابی شما وجود ندارد. فیلترها را تغییر دهید یا
            محصول جدید ایجاد کنید.
          </p>
          {activeFiltersCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold rounded-md bg-surface-subtle hover:bg-surface-muted text-foreground transition-colors mt-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>حذف فیلترها</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className="hidden lg:block bg-background border border-border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-surface-subtle border-b border-border text-muted-foreground text-[11px] font-semibold select-none">
                    <th className="py-3 px-3 w-8 text-center"></th>
                    <th className="py-3 px-3 w-10 text-center">
                      <button
                        onClick={handleSelectAllPage}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {isAllPageSelected ? (
                          <CheckSquare className="w-4 h-4 text-primary" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="py-3 px-3">محصول</th>
                    <th className="py-3 px-3">برند / دسته</th>
                    <th className="py-3 px-3">تعداد واریانت</th>
                    <th className="py-3 px-3">قیمت / بازه قیمت</th>
                    <th className="py-3 px-3">موجودی کل</th>
                    <th className="py-3 px-3">وضعیت</th>
                    <th className="py-3 px-3">تاریخ بروزرسانی</th>
                    <th className="py-3 px-4 text-left">عملیات Product</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedProducts.map((product) => {
                    const isSelected = selectedProductIds.includes(product.id);
                    const isExpanded = expandedProductIds.includes(product.id);
                    const statusInfo = getStatusInfo(product.status);
                    const StatusIcon = statusInfo.icon;
                    const mainImage = product.images[0]?.url || "/images/bag-1.webp";
                    const variantCount = product.variants?.length || 0;

                    return (
                      <React.Fragment key={product.id}>
                        {/* PARENT PRODUCT PRIMARY ROW */}
                        <tr
                          className={`hover:bg-surface-subtle/70 transition-colors ${
                            isSelected ? "bg-primary/5" : ""
                          }`}
                        >
                          {/* Expand Toggle Button */}
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => toggleExpandProduct(product.id)}
                              className="p-1 rounded hover:bg-surface-subtle text-muted-foreground hover:text-foreground transition-colors"
                              title={isExpanded ? "بستن واریانت‌ها" : "مشاهده واریانت‌ها"}
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-primary" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </td>

                          {/* Checkbox */}
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => handleToggleSelectProduct(product)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-primary" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </td>

                          {/* Image & Title */}
                          <td className="py-3 px-3 min-w-[220px]">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-md bg-surface-subtle border border-border shrink-0 overflow-hidden relative">
                                <Image
                                  src={mainImage}
                                  alt={product.title}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                />
                              </div>
                              <div className="min-w-0">
                                <p
                                  className="font-bold text-foreground text-xs line-clamp-1 hover:text-primary cursor-pointer transition-colors"
                                  onClick={() =>
                                    setActiveModal({ type: "view", product })
                                  }
                                >
                                  {product.title}
                                </p>
                                <span className="text-[10px] text-muted-foreground dir-ltr text-right block truncate">
                                  ID: {product.id}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Brand & Category */}
                          <td className="py-3 px-3">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-foreground text-xs">
                                {product.category.name}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                {product.brand?.name || "بدون برند"}
                              </span>
                            </div>
                          </td>

                          {/* Variant Count */}
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-surface-subtle border border-border text-foreground">
                              <Layers className="w-3 h-3 text-primary" />
                              <span>{variantCount} واریانت</span>
                            </span>
                          </td>

                          {/* Price */}
                          <td className="py-3 px-3">
                            <div className="flex flex-col">
                              <span className="font-extrabold text-foreground text-xs">
                                {formatPrice(product.pricing.minPrice, true)}
                              </span>
                              {product.pricing.maxPrice &&
                                product.pricing.maxPrice > product.pricing.minPrice && (
                                  <span className="text-[10px] text-muted-foreground">
                                    تا {formatPrice(product.pricing.maxPrice, true)}
                                  </span>
                                )}
                            </div>
                          </td>

                          {/* Total Stock */}
                          <td className="py-3 px-3">
                            <span
                              className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                                product.inventory.totalStock === 0
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : product.inventory.totalStock <= 5
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-surface-subtle text-foreground border border-border"
                              }`}
                            >
                              {product.inventory.totalStock === 0
                                ? "ناموجود"
                                : `${product.inventory.totalStock} عدد`}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${statusInfo.className}`}
                            >
                              <StatusIcon className="w-3 h-3 shrink-0" />
                              <span>{statusInfo.label}</span>
                            </span>
                          </td>

                          {/* Date */}
                          <td className="py-3 px-3 text-muted-foreground text-[11px]">
                            {formatDate(product.updatedAt)}
                          </td>

                          {/* Product Actions */}
                          <td className="py-3 px-4 text-left">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() =>
                                  setActiveModal({ type: "view", product })
                                }
                                className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-surface-subtle transition-colors"
                                title="مشاهده سریع"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  router.push(`/admin/products/${product.id}`)
                                }
                                className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
                                title="ویرایش کامل محصول"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenStockModal(product)}
                                className="p-1.5 rounded text-muted-foreground hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                title="مدیریت موجودی کل"
                              >
                                <Boxes className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  setActiveModal({
                                    type: "delete_product",
                                    product,
                                  })
                                }
                                className="p-1.5 rounded text-muted-foreground hover:text-error hover:bg-error/10 transition-colors"
                                title="حذف محصول و تمام واریانت‌ها"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* EXPANDED NESTED VARIANTS ROW */}
                        {isExpanded && (
                          <tr className="bg-surface-subtle/40 border-b border-border/80">
                            <td colSpan={10} className="p-4 pr-12">
                              <div className="bg-background border border-border/80 rounded-md p-3 space-y-2">
                                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                                  <h4 className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                                    <Layers className="w-3.5 h-3.5 text-primary" />
                                    <span>
                                      لیست واریانت‌های «{product.title}» ({variantCount})
                                    </span>
                                  </h4>
                                </div>

                                {variantCount === 0 ? (
                                  <p className="text-xs text-muted-foreground py-2">
                                    هیچ واریانتی برای این محصول تعریف نشده است.
                                  </p>
                                ) : (
                                  <table className="w-full text-right text-xs">
                                    <thead>
                                      <tr className="border-b border-border/50 text-[10px] text-muted-foreground font-semibold">
                                        <th className="py-1.5 px-2 w-8 text-center"></th>
                                        <th className="py-1.5 px-2">ترکیب Optionها</th>
                                        <th className="py-1.5 px-2">SKU</th>
                                        <th className="py-1.5 px-2">قیمت واریانت</th>
                                        <th className="py-1.5 px-2">موجودی</th>
                                        <th className="py-1.5 px-2">وضعیت</th>
                                        <th className="py-1.5 px-2 text-left">عملیات</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                      {product.variants.map((variant) => {
                                        const varKey = `${product.id}:${variant.id}`;
                                        const isVarSelected =
                                          selectedVariantKeys.includes(varKey);
                                        const varCombText = getVariantCombinationText(
                                          product,
                                          variant
                                        );

                                        return (
                                          <tr
                                            key={variant.id}
                                            className={`hover:bg-surface-subtle transition-colors ${
                                              isVarSelected ? "bg-primary/5" : ""
                                            }`}
                                          >
                                            <td className="py-2 px-2 text-center">
                                              <button
                                                onClick={() =>
                                                  handleToggleSelectVariant(
                                                    product.id,
                                                    variant.id
                                                  )
                                                }
                                                className="text-muted-foreground hover:text-foreground"
                                              >
                                                {isVarSelected ? (
                                                  <CheckSquare className="w-3.5 h-3.5 text-primary" />
                                                ) : (
                                                  <Square className="w-3.5 h-3.5" />
                                                )}
                                              </button>
                                            </td>

                                            <td className="py-2 px-2 font-bold text-foreground text-xs">
                                              {varCombText}
                                            </td>

                                            <td className="py-2 px-2 text-[11px] font-mono text-muted-foreground dir-ltr text-right">
                                              {variant.sku || "—"}
                                            </td>

                                            <td className="py-2 px-2 font-semibold text-foreground">
                                              {formatPrice(
                                                variant.pricing?.price ??
                                                  product.pricing.minPrice,
                                                true
                                              )}
                                              {variant.pricing?.compareAtPrice && (
                                                <span className="text-[10px] text-muted-foreground line-through mr-1">
                                                  {formatPrice(
                                                    variant.pricing.compareAtPrice,
                                                    false
                                                  )}
                                                </span>
                                              )}
                                            </td>

                                            <td className="py-2 px-2">
                                              <span className="font-bold text-[11px] px-1.5 py-0.5 rounded bg-surface-subtle border border-border">
                                                {variant.inventory?.stock ?? 0} عدد
                                              </span>
                                            </td>

                                            <td className="py-2 px-2">
                                              <span
                                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                                  variant.status === "inactive"
                                                    ? "bg-rose-50 text-rose-700"
                                                    : "bg-emerald-50 text-emerald-700"
                                                }`}
                                              >
                                                {variant.status === "inactive"
                                                  ? "غیرفعال"
                                                  : "فعال"}
                                              </span>
                                            </td>

                                            <td className="py-2 px-2 text-left">
                                              <div className="flex items-center justify-end gap-1">
                                                <button
                                                  onClick={() =>
                                                    handleOpenEditVariantModal(
                                                      product,
                                                      variant
                                                    )
                                                  }
                                                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-surface-subtle"
                                                  title="ویرایش این واریانت"
                                                >
                                                  <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                  onClick={() =>
                                                    setActiveModal({
                                                      type: "delete_variant",
                                                      product,
                                                      variant,
                                                    })
                                                  }
                                                  className="p-1 rounded text-muted-foreground hover:text-error hover:bg-error/10"
                                                  title="حذف این واریانت"
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE COMPACT LIST */}
          <div className="lg:hidden space-y-3">
            {paginatedProducts.map((product) => {
              const isSelected = selectedProductIds.includes(product.id);
              const isExpanded = expandedProductIds.includes(product.id);
              const statusInfo = getStatusInfo(product.status);
              const mainImage = product.images[0]?.url || "/images/bag-1.webp";

              return (
                <div
                  key={product.id}
                  className={`bg-background border rounded-md p-3.5 flex flex-col gap-3 transition-colors ${
                    isSelected ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() => handleToggleSelectProduct(product)}
                        className="text-muted-foreground hover:text-foreground shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-primary" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      <div className="w-12 h-12 rounded-md bg-surface-subtle border border-border shrink-0 overflow-hidden relative">
                        <Image
                          src={mainImage}
                          alt={product.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="font-bold text-foreground text-xs line-clamp-1">
                          {product.title}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          <span>{product.category.name}</span>
                          <span>•</span>
                          <span>{product.brand?.name || "بدون برند"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 relative">
                      <button
                        onClick={() =>
                          setActiveMenuId(activeMenuId === product.id ? null : product.id)
                        }
                        className="p-1.5 rounded-md text-muted-foreground hover:bg-surface-subtle"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === product.id && (
                        <div className="absolute left-0 top-8 z-20 w-40 bg-background border border-border rounded-md shadow-lg py-1 text-xs">
                          <button
                            onClick={() => {
                              setActiveModal({ type: "view", product });
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-foreground hover:bg-surface-subtle"
                          >
                            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>مشاهده</span>
                          </button>
                          <button
                            onClick={() => {
                              router.push(`/admin/products/${product.id}`);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-foreground hover:bg-surface-subtle"
                          >
                            <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>ویرایش کامل</span>
                          </button>
                          <button
                            onClick={() => handleOpenStockModal(product)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-foreground hover:bg-surface-subtle"
                          >
                            <Boxes className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>مدیریت موجودی</span>
                          </button>
                          <div className="my-1 border-t border-border" />
                          <button
                            onClick={() => {
                              setActiveModal({ type: "delete_product", product });
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-error hover:bg-error/10"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-error" />
                            <span>حذف محصول</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleExpandProduct(product.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full"
                      >
                        <span>{product.variants?.length || 0} واریانت</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${statusInfo.className}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>

                    <span className="font-black text-foreground">
                      {formatPrice(product.pricing.minPrice, true)}
                    </span>
                  </div>

                  {/* Mobile Expanded Variants */}
                  {isExpanded && (
                    <div className="mt-2 pt-2 border-t border-border/80 space-y-2 bg-surface-subtle/50 p-2.5 rounded-md">
                      <p className="text-[11px] font-extrabold text-foreground">
                        واریانت‌ها:
                      </p>
                      {product.variants?.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center justify-between bg-background p-2 rounded border border-border text-xs"
                        >
                          <div>
                            <span className="font-bold text-foreground">
                              {getVariantCombinationText(product, v)}
                            </span>
                            <span className="text-[10px] text-muted-foreground block dir-ltr">
                              {v.sku}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                              {formatPrice(
                                v.pricing?.price ?? product.pricing.minPrice,
                                true
                              )}
                            </span>
                            <button
                              onClick={() => handleOpenEditVariantModal(product, v)}
                              className="p-1 rounded text-muted-foreground hover:text-foreground"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* =========================================================================
              5. PAGINATION SECTION
             ========================================================================= */}
          <div className="bg-background border border-border rounded-md p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3 text-muted-foreground">
              <span>
                نمایش {(validPage - 1) * itemsPerPage + 1} تا{" "}
                {Math.min(validPage * itemsPerPage, totalItems)} از {totalItems} نتیجه
              </span>

              <div className="flex items-center gap-1.5">
                <span>تعداد در صفحه:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="h-8 px-2 bg-surface-subtle border border-border rounded text-foreground font-medium focus:outline-none"
                >
                  <option value={5}>۵</option>
                  <option value={10}>۱۰</option>
                  <option value={20}>۲۰</option>
                  <option value={50}>۵۰</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1 dir-rtl">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={validPage === 1}
                className="p-1.5 rounded-md border border-border hover:bg-surface-subtle disabled:opacity-40 disabled:pointer-events-none text-foreground"
                aria-label="صفحه قبلی"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-md font-bold transition-colors ${
                    page === validPage
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-surface-subtle text-foreground"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={validPage === totalPages}
                className="p-1.5 rounded-md border border-border hover:bg-surface-subtle disabled:opacity-40 disabled:pointer-events-none text-foreground"
                aria-label="صفحه بعدی"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* =========================================================================
          6. MODALS & DIALOGS
         ========================================================================= */}

      {/* A) VIEW PRODUCT MODAL */}
      {activeModal?.type === "view" && activeModal.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setActiveModal(null)}
          />
          <div className="relative bg-background border border-border rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-foreground">مشخصات کامل محصول</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-24 h-24 rounded-lg bg-surface-subtle border border-border shrink-0 overflow-hidden relative">
                <Image
                  src={activeModal.product.images[0]?.url || "/images/bag-1.webp"}
                  alt={activeModal.product.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-1.5 flex-1 min-w-0">
                <h4 className="font-extrabold text-foreground text-sm leading-snug">
                  {activeModal.product.title}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {activeModal.product.description || "بدون توضیحات"}
                </p>
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <span className="font-bold text-primary">
                    {formatPrice(activeModal.product.pricing.minPrice, true)}
                  </span>
                  {activeModal.product.pricing.minCompareAtPrice && (
                    <span className="text-muted-foreground line-through text-[11px]">
                      {formatPrice(activeModal.product.pricing.minCompareAtPrice, false)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-border/60">
              <div className="bg-surface-subtle p-2.5 rounded-md">
                <span className="text-muted-foreground block text-[11px]">دسته‌بندی:</span>
                <span className="font-bold text-foreground">
                  {activeModal.product.category.name}
                </span>
              </div>
              <div className="bg-surface-subtle p-2.5 rounded-md">
                <span className="text-muted-foreground block text-[11px]">برند:</span>
                <span className="font-bold text-foreground">
                  {activeModal.product.brand?.name || "بدون برند"}
                </span>
              </div>
              <div className="bg-surface-subtle p-2.5 rounded-md">
                <span className="text-muted-foreground block text-[11px]">موجودی انبار:</span>
                <span className="font-bold text-foreground">
                  {activeModal.product.inventory.totalStock} عدد
                </span>
              </div>
              <div className="bg-surface-subtle p-2.5 rounded-md">
                <span className="text-muted-foreground block text-[11px]">تعداد واریانت:</span>
                <span className="font-bold text-foreground">
                  {activeModal.product.variants?.length || 0} واریانت
                </span>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="h-9 px-4 text-xs font-bold rounded-md bg-surface-subtle hover:bg-surface-muted text-foreground transition-colors"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* B) MANAGE STOCK QUICK MODAL */}
      {activeModal?.type === "stock" && activeModal.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setActiveModal(null)}
          />
          <div className="relative bg-background border border-border rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4 z-10">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-primary" />
                <h3 className="text-base font-bold text-foreground">مدیریت موجودی کل</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              موجودی جدید برای محصول «
              <strong className="text-foreground">{activeModal.product.title}</strong>» را
              وارد کنید:
            </p>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                موجودی انبار (عدد)
              </label>
              <input
                type="number"
                min="0"
                value={stockInputValue}
                onChange={(e) => setStockInputValue(Number(e.target.value))}
                className="w-full h-10 px-3 bg-surface-subtle border border-border rounded-md text-foreground font-bold text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="h-9 px-4 text-xs font-bold rounded-md bg-surface-subtle text-foreground"
              >
                انصراف
              </button>
              <button
                onClick={handleSaveStock}
                className="h-9 px-4 text-xs font-bold rounded-md bg-primary text-primary-foreground"
              >
                ثبت موجودی
              </button>
            </div>
          </div>
        </div>
      )}

      {/* C) EDIT VARIANT MODAL */}
      {activeModal?.type === "edit_variant" && activeModal.variant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setActiveModal(null)}
          />
          <div className="relative bg-background border border-border rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4 z-10">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-base font-bold text-foreground">ویرایش واریانت</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-bold text-primary">
              {getVariantCombinationText(activeModal.product, activeModal.variant)}
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">کد شناسایی (SKU)</label>
                <input
                  type="text"
                  value={editVariantData.sku}
                  onChange={(e) =>
                    setEditVariantData((prev) => ({ ...prev, sku: e.target.value }))
                  }
                  className="w-full h-9 px-3 bg-surface-subtle border border-border rounded text-foreground dir-ltr text-right"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">قیمت (تومان)</label>
                  <input
                    type="number"
                    value={editVariantData.price}
                    onChange={(e) =>
                      setEditVariantData((prev) => ({
                        ...prev,
                        price: Number(e.target.value),
                      }))
                    }
                    className="w-full h-9 px-3 bg-surface-subtle border border-border rounded text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">قیمت قبل تخفیف</label>
                  <input
                    type="number"
                    value={editVariantData.compareAtPrice || ""}
                    onChange={(e) =>
                      setEditVariantData((prev) => ({
                        ...prev,
                        compareAtPrice: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }))
                    }
                    placeholder="اختیاری"
                    className="w-full h-9 px-3 bg-surface-subtle border border-border rounded text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">موجودی</label>
                  <input
                    type="number"
                    value={editVariantData.stock}
                    onChange={(e) =>
                      setEditVariantData((prev) => ({
                        ...prev,
                        stock: Number(e.target.value),
                      }))
                    }
                    className="w-full h-9 px-3 bg-surface-subtle border border-border rounded text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">وضعیت واریانت</label>
                  <select
                    value={editVariantData.status}
                    onChange={(e) =>
                      setEditVariantData((prev) => ({
                        ...prev,
                        status: e.target.value as "active" | "inactive",
                      }))
                    }
                    className="w-full h-9 px-3 bg-surface-subtle border border-border rounded text-foreground"
                  >
                    <option value="active">فعال</option>
                    <option value="inactive">غیرفعال</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setActiveModal(null)}
                className="h-9 px-4 text-xs font-bold rounded bg-surface-subtle text-foreground"
              >
                انصراف
              </button>
              <button
                onClick={handleSaveEditVariant}
                className="h-9 px-4 text-xs font-bold rounded bg-primary text-primary-foreground"
              >
                ذخیره
              </button>
            </div>
          </div>
        </div>
      )}

      {/* D) CONFIRM DELETE PRODUCT MODAL */}
      {activeModal?.type === "delete_product" && activeModal.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setActiveModal(null)}
          />
          <div className="relative bg-background border border-border rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-error/10 text-error flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">تایید حذف محصول</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  این عملیات تمام واریانت‌های مرتبط با این محصول را حذف می‌کند.
                </p>
              </div>
            </div>

            <p className="text-xs text-foreground bg-surface-subtle p-3 rounded-md">
              آیا از حذف محصول «
              <strong className="text-error">{activeModal.product.title}</strong>» اطمینان
              دارید؟
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="h-9 px-4 text-xs font-bold rounded-md bg-surface-subtle text-foreground"
              >
                انصراف
              </button>
              <button
                onClick={handleConfirmDeleteProduct}
                className="h-9 px-4 text-xs font-bold rounded-md bg-error text-error-foreground hover:opacity-90"
              >
                بله، حذف شود
              </button>
            </div>
          </div>
        </div>
      )}

      {/* E) CONFIRM DELETE VARIANT MODAL */}
      {activeModal?.type === "delete_variant" && activeModal.variant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setActiveModal(null)}
          />
          <div className="relative bg-background border border-border rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-error/10 text-error flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">حذف واریانت</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  فقط این واریانت خاص حذف خواهد شد و خود محصول باقی می‌ماند.
                </p>
              </div>
            </div>

            <p className="text-xs text-foreground bg-surface-subtle p-3 rounded-md">
              آیا از حذف واریانت «
              <strong className="text-error">
                {getVariantCombinationText(activeModal.product, activeModal.variant)}
              </strong>
              » اطمینان دارید؟
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="h-9 px-4 text-xs font-bold rounded-md bg-surface-subtle text-foreground"
              >
                انصراف
              </button>
              <button
                onClick={handleConfirmDeleteVariant}
                className="h-9 px-4 text-xs font-bold rounded-md bg-error text-error-foreground hover:opacity-90"
              >
                بله، حذف شود
              </button>
            </div>
          </div>
        </div>
      )}

      {/* F) BULK STATUS MODAL */}
      {activeModal?.type === "bulk_status" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setActiveModal(null)}
          />
          <div className="relative bg-background border border-border rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4 z-10">
            <h3 className="text-base font-bold text-foreground">
              تغییر وضعیت انتشار گروهی
            </h3>
            <p className="text-xs text-muted-foreground">
              تغییر وضعیت برای {totalSelectedCount} آیتم انتخاب‌شده:
            </p>

            <select
              value={bulkTargetStatus}
              onChange={(e) => setBulkTargetStatus(e.target.value as ProductStatus)}
              className="w-full h-10 px-3 bg-surface-subtle border border-border rounded-md text-xs font-medium text-foreground"
            >
              <option value="active">منتشرشده</option>
              <option value="draft">پیش‌نویس</option>
              <option value="archived">آرشیو شده</option>
            </select>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="h-9 px-4 text-xs font-bold rounded-md bg-surface-subtle text-foreground"
              >
                انصراف
              </button>
              <button
                onClick={handleApplyBulkStatus}
                className="h-9 px-4 text-xs font-bold rounded-md bg-primary text-primary-foreground"
              >
                اعمال تغییرات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* G) BULK STOCK MODAL */}
      {activeModal?.type === "bulk_stock" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setActiveModal(null)}
          />
          <div className="relative bg-background border border-border rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4 z-10">
            <h3 className="text-base font-bold text-foreground">تغییر موجودی گروهی</h3>
            <p className="text-xs text-muted-foreground">
              مقدار موجودی جدید را برای {totalSelectedCount} آیتم انتخاب‌شده وارد کنید:
            </p>

            <input
              type="number"
              min="0"
              value={bulkStockValue}
              onChange={(e) => setBulkStockValue(Number(e.target.value))}
              className="w-full h-10 px-3 bg-surface-subtle border border-border rounded-md text-xs font-bold text-foreground"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="h-9 px-4 text-xs font-bold rounded-md bg-surface-subtle text-foreground"
              >
                انصراف
              </button>
              <button
                onClick={handleApplyBulkStock}
                className="h-9 px-4 text-xs font-bold rounded-md bg-primary text-primary-foreground"
              >
                اعمال موجودی
              </button>
            </div>
          </div>
        </div>
      )}

      {/* H) BULK DELETE MODAL */}
      {activeModal?.type === "bulk_delete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setActiveModal(null)}
          />
          <div className="relative bg-background border border-border rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-error/10 text-error flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">حذف گروهی</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  این عملیات غیرقابل بازگشت است.
                </p>
              </div>
            </div>

            <p className="text-xs text-foreground bg-surface-subtle p-3 rounded-md">
              آیا از حذف <strong className="text-error">{totalSelectedCount}</strong>{" "}
              آیتم انتخاب‌شده اطمینان دارید؟
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="h-9 px-4 text-xs font-bold rounded-md bg-surface-subtle text-foreground"
              >
                انصراف
              </button>
              <button
                onClick={handleApplyBulkDelete}
                className="h-9 px-4 text-xs font-bold rounded-md bg-error text-error-foreground hover:opacity-90"
              >
                بله، حذف شوند
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
