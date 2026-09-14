"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Package,
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
  Check,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RotateCcw,
  SlidersHorizontal,
  CheckCircle2,
  PackageX,
  PackageCheck,
  FileText,
  ChevronDown,
  ArrowUpDown,
  Tag,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

import { products as initialProducts } from "@/data/products";
import { categories, brands } from "@/data/common";
import { Product, ProductStatus } from "@/types/product";
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
  | { type: "edit"; product: Product }
  | { type: "stock"; product: Product }
  | { type: "delete"; product: Product }
  | { type: "add" }
  | { type: "bulk_status" }
  | { type: "bulk_stock" }
  | { type: "bulk_delete" }
  | null;

export default function AdminProductsPage() {
  const { showToast } = useToast();

  // Master State
  const [productList, setProductList] = useState<Product[]>(initialProducts);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedStockStatus, setSelectedStockStatus] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "price_asc" | "price_desc" | "stock_asc" | "stock_desc"
  >("newest");

  // Selection & Pagination
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // UI Drawers & Modals & Action Menus
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Form states inside modals
  const [editFormData, setEditFormData] = useState<{
    title: string;
    price: number;
    compareAtPrice: number | undefined;
    stock: number;
    status: ProductStatus;
  }>({
    title: "",
    price: 0,
    compareAtPrice: undefined,
    stock: 0,
    status: "active",
  });

  const [stockInputValue, setStockInputValue] = useState<number>(0);
  const [bulkTargetStatus, setBulkTargetStatus] = useState<ProductStatus>("active");
  const [bulkStockValue, setBulkStockValue] = useState<number>(10);

  const [newProductData, setNewProductData] = useState({
    title: "",
    categoryId: categories[0]?.id || "",
    brandId: brands[0]?.id || "",
    price: 1000000,
    stock: 10,
    status: "active" as ProductStatus,
  });

  // Calculate Active Filters Count
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

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSelectedStockStatus("all");
    setSelectedBrand("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return productList.filter((product) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = product.title.toLowerCase().includes(query);
        const slugMatch = product.slug.toLowerCase().includes(query);
        const categoryMatch = product.category.name.toLowerCase().includes(query);
        const brandMatch = product.brand?.name.toLowerCase().includes(query);
        const tagMatch = product.tags?.some((t) => t.toLowerCase().includes(query));

        if (!titleMatch && !slugMatch && !categoryMatch && !brandMatch && !tagMatch) {
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
    productList,
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

  // Checkbox Selection Logic
  const isAllSelected =
    paginatedProducts.length > 0 &&
    paginatedProducts.every((p) => selectedProductIds.includes(p.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedProductIds((prev) =>
        prev.filter((id) => !paginatedProducts.some((p) => p.id === id))
      );
    } else {
      const pageIds = paginatedProducts.map((p) => p.id);
      setSelectedProductIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Actions Logic
  const handleOpenEditModal = (product: Product) => {
    setEditFormData({
      title: product.title,
      price: product.pricing.minPrice,
      compareAtPrice: product.pricing.minCompareAtPrice,
      stock: product.inventory.totalStock,
      status: product.status,
    });
    setActiveModal({ type: "edit", product });
    setActiveMenuId(null);
  };

  const handleSaveEditProduct = () => {
    if (activeModal?.type !== "edit" || !activeModal.product) return;

    const prodId = activeModal.product.id;
    setProductList((prev) =>
      prev.map((p) => {
        if (p.id !== prodId) return p;
        const hasDiscount =
          !!editFormData.compareAtPrice && editFormData.compareAtPrice > editFormData.price;
        return {
          ...p,
          title: editFormData.title,
          status: editFormData.status,
          pricing: {
            ...p.pricing,
            minPrice: editFormData.price,
            maxPrice: editFormData.price,
            minCompareAtPrice: editFormData.compareAtPrice,
            hasDiscount,
          },
          inventory: {
            ...p.inventory,
            totalStock: editFormData.stock,
            hasAvailableVariants: editFormData.stock > 0,
          },
          updatedAt: new Date().toISOString(),
        };
      })
    );

    showToast(`محصول «${editFormData.title}» با موفقیت ویرایش شد.`, "success");
    setActiveModal(null);
  };

  const handleOpenStockModal = (product: Product) => {
    setStockInputValue(product.inventory.totalStock);
    setActiveModal({ type: "stock", product });
    setActiveMenuId(null);
  };

  const handleSaveStock = () => {
    if (activeModal?.type !== "stock" || !activeModal.product) return;

    const prodId = activeModal.product.id;
    setProductList((prev) =>
      prev.map((p) => {
        if (p.id !== prodId) return p;
        return {
          ...p,
          inventory: {
            ...p.inventory,
            totalStock: stockInputValue,
            hasAvailableVariants: stockInputValue > 0,
          },
          updatedAt: new Date().toISOString(),
        };
      })
    );

    showToast(
      `موجودی محصول «${activeModal.product.title}» به ${stockInputValue} تغییر یافت.`,
      "success"
    );
    setActiveModal(null);
  };

  const handleConfirmDelete = () => {
    if (activeModal?.type !== "delete" || !activeModal.product) return;

    const prodId = activeModal.product.id;
    setProductList((prev) => prev.filter((p) => p.id !== prodId));
    setSelectedProductIds((prev) => prev.filter((id) => id !== prodId));

    showToast(`محصول «${activeModal.product.title}» با موفقیت حذف شد.`, "success");
    setActiveModal(null);
  };

  const handleCreateProduct = () => {
    if (!newProductData.title.trim()) {
      showToast("لطفاً نام محصول را وارد کنید.", "warning");
      return;
    }

    const categoryObj =
      categories.find((c) => c.id === newProductData.categoryId) || categories[0];
    const brandObj = brands.find((b) => b.id === newProductData.brandId) || brands[0];

    const newProd: Product = {
      id: `prod-custom-${Date.now()}`,
      slug: `product-${Date.now()}`,
      title: newProductData.title,
      description: "توضیحات محصول جدید افزوده‌شده از پنل مدیریت.",
      category: categoryObj,
      brand: brandObj,
      images: [
        {
          id: `img-${Date.now()}`,
          url: "/images/bag-1.webp",
          alt: newProductData.title,
          sortOrder: 0,
        },
      ],
      options: [],
      variants: [],
      pricing: {
        minPrice: newProductData.price,
        maxPrice: newProductData.price,
        hasDiscount: false,
      },
      inventory: {
        totalStock: newProductData.stock,
        trackStock: true,
        hasAvailableVariants: newProductData.stock > 0,
      },
      status: newProductData.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProductList((prev) => [newProd, ...prev]);
    showToast(`محصول «${newProd.title}» با موفقیت ایجاد شد.`, "success");
    setActiveModal(null);
    setNewProductData({
      title: "",
      categoryId: categories[0]?.id || "",
      brandId: brands[0]?.id || "",
      price: 1000000,
      stock: 10,
      status: "active",
    });
  };

  // Bulk Actions
  const handleApplyBulkStatus = () => {
    if (selectedProductIds.length === 0) return;

    setProductList((prev) =>
      prev.map((p) => {
        if (selectedProductIds.includes(p.id)) {
          return { ...p, status: bulkTargetStatus, updatedAt: new Date().toISOString() };
        }
        return p;
      })
    );

    showToast(
      `وضعیت انتشار ${selectedProductIds.length} محصول به‌روزرسانی شد.`,
      "success"
    );
    setSelectedProductIds([]);
    setActiveModal(null);
  };

  const handleApplyBulkStock = () => {
    if (selectedProductIds.length === 0) return;

    setProductList((prev) =>
      prev.map((p) => {
        if (selectedProductIds.includes(p.id)) {
          return {
            ...p,
            inventory: {
              ...p.inventory,
              totalStock: bulkStockValue,
              hasAvailableVariants: bulkStockValue > 0,
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );

    showToast(
      `موجودی ${selectedProductIds.length} محصول به ${bulkStockValue} تغییر یافت.`,
      "success"
    );
    setSelectedProductIds([]);
    setActiveModal(null);
  };

  const handleApplyBulkDelete = () => {
    if (selectedProductIds.length === 0) return;

    const count = selectedProductIds.length;
    setProductList((prev) => prev.filter((p) => !selectedProductIds.includes(p.id)));
    setSelectedProductIds([]);
    showToast(`${count} محصول با موفقیت حذف شدند.`, "success");
    setActiveModal(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* =========================================================================
          1. HEADER SECTION
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
              محصولات
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              {productList.length} کالا
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            مدیریت کاتالوگ محصولات، موجودی انبار، وضعیت انتشار و قیمت‌گذاری
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveModal({ type: "add" })}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 text-xs sm:text-sm font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن محصول</span>
          </button>
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
              placeholder="جستجو در نام محصول، برند، دسته‌بندی یا برچسب..."
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
              title="پاک کردن همه فیلترها"
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

      {/* Mobile Filter Drawer / Bottom Sheet */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative bg-background border-t border-border rounded-t-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-200 z-10">
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
          3. BULK ACTIONS BAR (When items are selected)
         ========================================================================= */}
      {selectedProductIds.length > 0 && (
        <div className="sticky top-20 z-10 bg-primary text-primary-foreground p-3 sm:p-4 rounded-md shadow-md flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-bold">
              {selectedProductIds.length} محصول انتخاب شده است
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
              onClick={() => setSelectedProductIds([])}
              className="h-8 px-2.5 text-xs text-white/80 hover:text-white"
              title="انصراف از انتخاب"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. PRODUCTS LIST / TABLE & COMPACT ROWS
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
            محصول جدید بیفزایید.
          </p>
          {activeFiltersCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 h-9 px-4 text-xs font-semibold rounded-md bg-surface-subtle hover:bg-surface-muted text-foreground transition-colors mt-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>پاک کردن فیلترها</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE (lg & up) */}
          <div className="hidden lg:block bg-background border border-border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-surface-subtle border-b border-border text-muted-foreground text-[11px] font-semibold select-none">
                    <th className="py-3 px-4 w-10 text-center">
                      <button
                        onClick={handleSelectAll}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {isAllSelected ? (
                          <CheckSquare className="w-4 h-4 text-primary" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="py-3 px-3">تصویر و نام محصول</th>
                    <th className="py-3 px-3">برند / دسته</th>
                    <th className="py-3 px-3">قیمت و تخفیف</th>
                    <th className="py-3 px-3">موجودی</th>
                    <th className="py-3 px-3">وضعیت انتشار</th>
                    <th className="py-3 px-3">آخرین تغییر</th>
                    <th className="py-3 px-4 text-left">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedProducts.map((product) => {
                    const isSelected = selectedProductIds.includes(product.id);
                    const statusInfo = getStatusInfo(product.status);
                    const StatusIcon = statusInfo.icon;
                    const mainImage = product.images[0]?.url || "/images/bag-1.webp";

                    return (
                      <tr
                        key={product.id}
                        className={`hover:bg-surface-subtle/70 transition-colors ${
                          isSelected ? "bg-primary/5" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleToggleSelectProduct(product.id)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-primary" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* Product Image & Title */}
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

                        {/* Price & Discount */}
                        <td className="py-3 px-3">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-foreground text-xs">
                              {formatPrice(product.pricing.minPrice, true)}
                            </span>
                            {product.pricing.minCompareAtPrice &&
                              product.pricing.minCompareAtPrice >
                                product.pricing.minPrice && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="text-[10px] text-muted-foreground line-through">
                                    {formatPrice(
                                      product.pricing.minCompareAtPrice,
                                      false
                                    )}
                                  </span>
                                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">
                                    تخفیف‌دار
                                  </span>
                                </div>
                              )}
                          </div>
                        </td>

                        {/* Stock */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
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
                          </div>
                        </td>

                        {/* Publication Status */}
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${statusInfo.className}`}
                          >
                            <StatusIcon className="w-3 h-3 shrink-0" />
                            <span>{statusInfo.label}</span>
                          </span>
                        </td>

                        {/* Last Updated Date */}
                        <td className="py-3 px-3 text-muted-foreground text-[11px]">
                          {formatDate(product.updatedAt)}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-left relative">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() =>
                                setActiveModal({ type: "view", product })
                              }
                              className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-surface-subtle transition-colors"
                              title="مشاهده جزئیات"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(product)}
                              className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
                              title="ویرایش محصول"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenStockModal(product)}
                              className="p-1.5 rounded text-muted-foreground hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              title="مدیریت موجودی"
                            >
                              <Boxes className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setActiveModal({ type: "delete", product })
                              }
                              className="p-1.5 rounded text-muted-foreground hover:text-error hover:bg-error/10 transition-colors"
                              title="حذف محصول"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE COMPACT LIST (Under lg) */}
          <div className="lg:hidden space-y-3">
            {paginatedProducts.map((product) => {
              const isSelected = selectedProductIds.includes(product.id);
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
                        onClick={() => handleToggleSelectProduct(product.id)}
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

                      {/* Mobile Dropdown Action Menu */}
                      {activeMenuId === product.id && (
                        <div className="absolute left-0 top-8 z-20 w-40 bg-background border border-border rounded-md shadow-lg py-1 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
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
                            onClick={() => handleOpenEditModal(product)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-foreground hover:bg-surface-subtle"
                          >
                            <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>ویرایش</span>
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
                              setActiveModal({ type: "delete", product });
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-error hover:bg-error/10"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-error" />
                            <span>حذف</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${statusInfo.className}`}
                      >
                        {statusInfo.label}
                      </span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          product.inventory.totalStock === 0
                            ? "bg-rose-50 text-rose-700"
                            : product.inventory.totalStock <= 5
                            ? "bg-amber-50 text-amber-700"
                            : "bg-surface-subtle text-foreground"
                        }`}
                      >
                        موجودی: {product.inventory.totalStock}
                      </span>
                    </div>

                    <span className="font-black text-foreground">
                      {formatPrice(product.pricing.minPrice, true)}
                    </span>
                  </div>
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
          6. MODALS DIALOGS
         ========================================================================= */}

      {/* A) VIEW PRODUCT MODAL */}
      {activeModal?.type === "view" && activeModal.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setActiveModal(null)}
          />
          <div className="relative bg-background border border-border rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-foreground">مشخصات محصول</h3>
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
                <span className="text-muted-foreground block text-[11px]">وضعیت:</span>
                <span className="font-bold text-foreground">
                  {getStatusInfo(activeModal.product.status).label}
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

      {/* B) EDIT PRODUCT MODAL */}
      {activeModal?.type === "edit" && activeModal.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setActiveModal(null)}
          />
          <div className="relative bg-background border border-border rounded-xl shadow-xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-foreground">ویرایش محصول</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-foreground font-semibold mb-1">
                  نام محصول
                </label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) =>
                    setEditFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full h-10 px-3 bg-surface-subtle border border-border rounded-md text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground font-semibold mb-1">
                    قیمت (تومان)
                  </label>
                  <input
                    type="number"
                    value={editFormData.price}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        price: Number(e.target.value),
                      }))
                    }
                    className="w-full h-10 px-3 bg-surface-subtle border border-border rounded-md text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-foreground font-semibold mb-1">
                    قیمت قبل تخفیف
                  </label>
                  <input
                    type="number"
                    value={editFormData.compareAtPrice || ""}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        compareAtPrice: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }))
                    }
                    placeholder="اختیاری"
                    className="w-full h-10 px-3 bg-surface-subtle border border-border rounded-md text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground font-semibold mb-1">
                    موجودی
                  </label>
                  <input
                    type="number"
                    value={editFormData.stock}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        stock: Number(e.target.value),
                      }))
                    }
                    className="w-full h-10 px-3 bg-surface-subtle border border-border rounded-md text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-foreground font-semibold mb-1">
                    وضعیت انتشار
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        status: e.target.value as ProductStatus,
                      }))
                    }
                    className="w-full h-10 px-3 bg-surface-subtle border border-border rounded-md text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="active">منتشرشده</option>
                    <option value="draft">پیش‌نویس</option>
                    <option value="archived">آرشیو شده</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-border">
              <button
                onClick={() => setActiveModal(null)}
                className="h-9 px-4 text-xs font-bold rounded-md bg-surface-subtle hover:bg-surface-muted text-foreground transition-colors"
              >
                انصراف
              </button>
              <button
                onClick={handleSaveEditProduct}
                className="h-9 px-4 text-xs font-bold rounded-md bg-primary text-primary-foreground hover:bg-primary-hover transition-colors"
              >
                ذخیره تغییرات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* C) MANAGE STOCK QUICK MODAL */}
      {activeModal?.type === "stock" && activeModal.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setActiveModal(null)}
          />
          <div className="relative bg-background border border-border rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 z-10">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-primary" />
                <h3 className="text-base font-bold text-foreground">مدیریت موجودی</h3>
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

      {/* D) CONFIRM DELETE SINGLE MODAL */}
      {activeModal?.type === "delete" && activeModal.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setActiveModal(null)}
          />
          <div className="relative bg-background border border-border rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-error/10 text-error flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">تایید حذف محصول</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  این عملیات غیرقابل بازگشت است.
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
                onClick={handleConfirmDelete}
                className="h-9 px-4 text-xs font-bold rounded-md bg-error text-error-foreground hover:opacity-90"
              >
                بله، حذف شود
              </button>
            </div>
          </div>
        </div>
      )}

      {/* E) ADD NEW PRODUCT MODAL */}
      {activeModal?.type === "add" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setActiveModal(null)}
          />
          <div className="relative bg-background border border-border rounded-xl shadow-xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                <h3 className="text-base font-bold text-foreground">افزودن محصول جدید</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-foreground font-semibold mb-1">
                  عنوان محصول *
                </label>
                <input
                  type="text"
                  placeholder="مثلاً: کیف چرمی کلاسیک زنانه"
                  value={newProductData.title}
                  onChange={(e) =>
                    setNewProductData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full h-10 px-3 bg-surface-subtle border border-border rounded-md text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground font-semibold mb-1">
                    دسته‌بندی
                  </label>
                  <select
                    value={newProductData.categoryId}
                    onChange={(e) =>
                      setNewProductData((prev) => ({ ...prev, categoryId: e.target.value }))
                    }
                    className="w-full h-10 px-3 bg-surface-subtle border border-border rounded-md text-foreground focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-foreground font-semibold mb-1">برند</label>
                  <select
                    value={newProductData.brandId}
                    onChange={(e) =>
                      setNewProductData((prev) => ({ ...prev, brandId: e.target.value }))
                    }
                    className="w-full h-10 px-3 bg-surface-subtle border border-border rounded-md text-foreground focus:outline-none"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground font-semibold mb-1">
                    قیمت (تومان)
                  </label>
                  <input
                    type="number"
                    value={newProductData.price}
                    onChange={(e) =>
                      setNewProductData((prev) => ({
                        ...prev,
                        price: Number(e.target.value),
                      }))
                    }
                    className="w-full h-10 px-3 bg-surface-subtle border border-border rounded-md text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-foreground font-semibold mb-1">
                    موجودی اولیه
                  </label>
                  <input
                    type="number"
                    value={newProductData.stock}
                    onChange={(e) =>
                      setNewProductData((prev) => ({
                        ...prev,
                        stock: Number(e.target.value),
                      }))
                    }
                    className="w-full h-10 px-3 bg-surface-subtle border border-border rounded-md text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">
                  وضعیت انتشار
                </label>
                <select
                  value={newProductData.status}
                  onChange={(e) =>
                    setNewProductData((prev) => ({
                      ...prev,
                      status: e.target.value as ProductStatus,
                    }))
                  }
                  className="w-full h-10 px-3 bg-surface-subtle border border-border rounded-md text-foreground focus:outline-none"
                >
                  <option value="active">منتشرشده</option>
                  <option value="draft">پیش‌نویس</option>
                  <option value="archived">آرشیو شده</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-border">
              <button
                onClick={() => setActiveModal(null)}
                className="h-9 px-4 text-xs font-bold rounded-md bg-surface-subtle text-foreground"
              >
                انصراف
              </button>
              <button
                onClick={handleCreateProduct}
                className="h-9 px-4 text-xs font-bold rounded-md bg-primary text-primary-foreground"
              >
                ایجاد محصول
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
          <div className="relative bg-background border border-border rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 z-10">
            <h3 className="text-base font-bold text-foreground">
              تغییر وضعیت انتشار گروهی
            </h3>
            <p className="text-xs text-muted-foreground">
              تغییر وضعیت برای {selectedProductIds.length} محصول انتخاب‌شده:
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
          <div className="relative bg-background border border-border rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 z-10">
            <h3 className="text-base font-bold text-foreground">تغییر موجودی گروهی</h3>
            <p className="text-xs text-muted-foreground">
              مقدار موجودی جدید را برای {selectedProductIds.length} محصول انتخاب‌شده وارد
              کنید:
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
          <div className="relative bg-background border border-border rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-error/10 text-error flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">حذف گروهی محصولات</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  این عملیات غیرقابل بازگشت است.
                </p>
              </div>
            </div>

            <p className="text-xs text-foreground bg-surface-subtle p-3 rounded-md">
              آیا از حذف <strong className="text-error">{selectedProductIds.length}</strong>{" "}
              محصول انتخاب‌شده اطمینان دارید؟
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
