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
  MoreHorizontal,
  Edit,
  Boxes,
  CheckSquare,
  Square,
  ChevronDown,
  RotateCcw,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  PackageX,
  Package,
  ChevronRight,
  ChevronLeft,
  Layers,
  History,
  ArrowUp,
  ArrowDown,
  Power,
  Eye,
  Bell,
  Check,
} from "lucide-react";

import { useProducts } from "@/context/ProductContext";
import { formatPrice } from "@/lib/formatting/currency";
import { useToast } from "@/components/ui/Toast";
import {
  getVariantInventoryItems,
  calculateInventorySummary,
  addInventoryHistoryLog,
} from "@/lib/inventory/inventoryService";
import {
  VariantInventoryItem,
  InventoryStatus,
} from "@/lib/inventory/inventoryTypes";

import { AddVariantDrawer } from "@/components/admin/inventory/AddVariantDrawer";
import { QuickEditVariantDrawer } from "@/components/admin/inventory/QuickEditVariantDrawer";
import {
  ConfirmActionDialog,
  ConfirmDialogConfig,
} from "@/components/admin/inventory/ConfirmActionDialog";

export default function AdminInventoryPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { products, updateVariant, isLoaded } = useProducts();

  // Drawers & Modals
  const [addVariantOpen, setAddVariantOpen] = useState(false);
  const [addVariantPreselectedProductId, setAddVariantPreselectedProductId] =
    useState<string | undefined>(undefined);
  const [editingVariantItem, setEditingVariantItem] =
    useState<VariantInventoryItem | null>(null);

  const [confirmDialogConfig, setConfirmDialogConfig] =
    useState<ConfirmDialogConfig | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<string>("all"); // "all" | "in-stock" | "low-stock" | "out-of-stock" | "attention"
  const [statusFilter, setStatusFilter] = useState<string>("all"); // "all" | "active" | "inactive"
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "updated_desc" | "stock_asc" | "stock_desc" | "product_asc" | "sku_asc"
  >("updated_desc");

  // Inline Stock Edit State (key: variantId, value: string string representation during edit)
  const [editingStockKey, setEditingStockKey] = useState<string | null>(null);
  const [editingStockValue, setEditingStockValue] = useState<string>("");

  // Bulk Selection (Array of variantKeys e.g. "prodId:varId")
  const [selectedVariantKeys, setSelectedVariantKeys] = useState<string[]>([]);
  const [bulkDrawerOpen, setBulkDrawerOpen] = useState<
    "increase" | "set" | "activate" | "deactivate" | null
  >(null);
  const [bulkAmountInput, setBulkAmountInput] = useState<number>(5);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Mobile Drawer
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [activeMenuKey, setActiveMenuKey] = useState<string | null>(null);

  // Convert raw products into flat variant items list
  const allVariantItems = useMemo(() => {
    return getVariantInventoryItems(products);
  }, [products]);

  // Summary Metrics
  const summary = useMemo(() => {
    return calculateInventorySummary(allVariantItems);
  }, [allVariantItems]);

  // Extract unique categories & brands for filters
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    allVariantItems.forEach((item) => {
      if (item.categoryName) set.add(item.categoryName);
    });
    return Array.from(set);
  }, [allVariantItems]);

  const brandsList = useMemo(() => {
    const set = new Set<string>();
    allVariantItems.forEach((item) => {
      if (item.brandName) set.add(item.brandName);
    });
    return Array.from(set);
  }, [allVariantItems]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (stockFilter !== "all") count++;
    if (statusFilter !== "all") count++;
    if (categoryFilter !== "all") count++;
    if (brandFilter !== "all") count++;
    return count;
  }, [searchQuery, stockFilter, statusFilter, categoryFilter, brandFilter]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setStockFilter("all");
    setStatusFilter("all");
    setCategoryFilter("all");
    setBrandFilter("all");
    setSortBy("updated_desc");
    setCurrentPage(1);
  };

  // Filter & Sort Variants
  const filteredVariants = useMemo(() => {
    return allVariantItems.filter((item) => {
      // Search: product title, SKU, option values, color, size
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = item.productTitle.toLowerCase().includes(q);
        const skuMatch = item.sku.toLowerCase().includes(q);
        const displayMatch = item.displayVariantName.toLowerCase().includes(q);
        const catMatch = item.categoryName.toLowerCase().includes(q);
        const brandMatch = item.brandName?.toLowerCase().includes(q) || false;
        const optMatch = item.optionCombinations.some(
          (oc) =>
            oc.optionName.toLowerCase().includes(q) ||
            oc.valueLabel.toLowerCase().includes(q)
        );

        if (
          !titleMatch &&
          !skuMatch &&
          !displayMatch &&
          !catMatch &&
          !brandMatch &&
          !optMatch
        ) {
          return false;
        }
      }

      // Stock Filter
      if (stockFilter === "in-stock" && item.inventoryStatus !== "in-stock") {
        return false;
      }
      if (stockFilter === "low-stock" && item.inventoryStatus !== "low-stock") {
        return false;
      }
      if (stockFilter === "out-of-stock" && item.inventoryStatus !== "out-of-stock") {
        return false;
      }
      if (
        stockFilter === "attention" &&
        item.inventoryStatus === "in-stock" &&
        item.isActive
      ) {
        return false;
      }

      // Activation Status
      if (statusFilter === "active" && !item.isActive) {
        return false;
      }
      if (statusFilter === "inactive" && item.isActive) {
        return false;
      }

      // Category
      if (categoryFilter !== "all" && item.categoryName !== categoryFilter) {
        return false;
      }

      // Brand
      if (brandFilter !== "all" && item.brandName !== brandFilter) {
        return false;
      }

      return true;
    });
  }, [
    allVariantItems,
    searchQuery,
    stockFilter,
    statusFilter,
    categoryFilter,
    brandFilter,
  ]);

  const sortedVariants = useMemo(() => {
    return [...filteredVariants].sort((a, b) => {
      if (sortBy === "updated_desc") {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (sortBy === "stock_asc") {
        return a.stock - b.stock;
      }
      if (sortBy === "stock_desc") {
        return b.stock - a.stock;
      }
      if (sortBy === "product_asc") {
        return a.productTitle.localeCompare(b.productTitle, "fa");
      }
      if (sortBy === "sku_asc") {
        return a.sku.localeCompare(b.sku);
      }
      return 0;
    });
  }, [filteredVariants, sortBy]);

  // Pagination Slice
  const totalItems = sortedVariants.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const validPage = Math.min(currentPage, totalPages);

  const paginatedVariants = useMemo(() => {
    const start = (validPage - 1) * itemsPerPage;
    return sortedVariants.slice(start, start + itemsPerPage);
  }, [sortedVariants, validPage, itemsPerPage]);

  // Selection Logic
  const isAllPageSelected =
    paginatedVariants.length > 0 &&
    paginatedVariants.every((v) =>
      selectedVariantKeys.includes(`${v.productId}:${v.variantId}`)
    );

  const handleSelectAllPage = () => {
    const pageKeys = paginatedVariants.map((v) => `${v.productId}:${v.variantId}`);
    if (isAllPageSelected) {
      setSelectedVariantKeys((prev) => prev.filter((k) => !pageKeys.includes(k)));
    } else {
      setSelectedVariantKeys((prev) => Array.from(new Set([...prev, ...pageKeys])));
    }
  };

  const handleToggleSelectVariant = (productId: string, variantId: string) => {
    const key = `${productId}:${variantId}`;
    setSelectedVariantKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Optimistic Inline Stock Mutators (+ / -)
  const handleStockDelta = (item: VariantInventoryItem, delta: number) => {
    const previousStock = item.stock;
    const newStock = Math.max(0, previousStock + delta);

    if (newStock === previousStock) return;

    // Direct store mutation
    updateVariant(item.productId, item.variantId, {
      inventory: { stock: newStock, trackStock: true },
    });

    addInventoryHistoryLog({
      productId: item.productId,
      productTitle: item.productTitle,
      variantId: item.variantId,
      variantDisplay: item.displayVariantName,
      sku: item.sku,
      previousStock,
      changeAmount: delta,
      newStock,
      reason: delta > 0 ? "افزایش سریع" : "کاهش سریع",
      actor: "مدیر سیستم",
    });
  };

  // Direct Stock Numeric Edit
  const handleStartStockEdit = (item: VariantInventoryItem) => {
    setEditingStockKey(`${item.productId}:${item.variantId}`);
    setEditingStockValue(item.stock.toString());
  };

  const handleSaveDirectStockEdit = (item: VariantInventoryItem) => {
    const newStockNum = parseInt(editingStockValue, 10);
    setEditingStockKey(null);

    if (isNaN(newStockNum) || newStockNum < 0) {
      showToast("مقدار موجودی باید یک عدد صحیح نامنفی باشد.", "error");
      return;
    }

    const previousStock = item.stock;
    if (newStockNum === previousStock) return;

    const delta = newStockNum - previousStock;

    if (newStockNum === 0) {
      showToast(`موجودی واریانت «${item.displayVariantName}» صفر شد.`, "info");
    }

    updateVariant(item.productId, item.variantId, {
      inventory: { stock: newStockNum, trackStock: true },
    });

    addInventoryHistoryLog({
      productId: item.productId,
      productTitle: item.productTitle,
      variantId: item.variantId,
      variantDisplay: item.displayVariantName,
      sku: item.sku,
      previousStock,
      changeAmount: delta,
      newStock: newStockNum,
      reason: "تنظیم مستقیم موجودی",
      actor: "مدیر سیستم",
    });
  };

  // Status Activation Toggle Handler
  const handleToggleStatus = (item: VariantInventoryItem) => {
    const newActiveState = !item.isActive;

    if (!newActiveState) {
      // Deactivating requires confirmation dialog
      setConfirmDialogConfig({
        title: "غیرفعال کردن واریانت؟",
        description: `واریانت «${item.displayVariantName}» مربوط به «${item.productTitle}» غیرفعال خواهد شد و کاربران قادر به خرید آن در فروشگاه نخواهند بود.`,
        confirmLabel: "غیرفعال کردن",
        isDestructive: true,
        onConfirm: () => {
          updateVariant(item.productId, item.variantId, { status: "inactive" });
          showToast(`واریانت «${item.displayVariantName}» غیرفعال شد.`, "success");
        },
      });
    } else {
      // Activating is immediate
      updateVariant(item.productId, item.variantId, { status: "active" });
      showToast(`واریانت «${item.displayVariantName}» فعال شد.`, "success");
    }
  };

  // Bulk Operations Action Apply
  const handleApplyBulkAction = () => {
    if (selectedVariantKeys.length === 0 || !bulkDrawerOpen) return;

    const selectedItems = allVariantItems.filter((i) =>
      selectedVariantKeys.includes(`${i.productId}:${i.variantId}`)
    );

    if (bulkDrawerOpen === "increase") {
      const amount = Number(bulkAmountInput) || 0;
      selectedItems.forEach((item) => {
        const newStock = item.stock + amount;
        updateVariant(item.productId, item.variantId, {
          inventory: { stock: newStock, trackStock: true },
        });
        addInventoryHistoryLog({
          productId: item.productId,
          productTitle: item.productTitle,
          variantId: item.variantId,
          variantDisplay: item.displayVariantName,
          sku: item.sku,
          previousStock: item.stock,
          changeAmount: amount,
          newStock,
          reason: "افزایش موجودی گروهی",
          actor: "مدیر سیستم",
        });
      });
      showToast(
        `موجودی ${selectedItems.length} واریانت با موفقیت افزایش یافت.`,
        "success"
      );
    } else if (bulkDrawerOpen === "set") {
      const targetStock = Math.max(0, Number(bulkAmountInput) || 0);
      selectedItems.forEach((item) => {
        const delta = targetStock - item.stock;
        updateVariant(item.productId, item.variantId, {
          inventory: { stock: targetStock, trackStock: true },
        });
        addInventoryHistoryLog({
          productId: item.productId,
          productTitle: item.productTitle,
          variantId: item.variantId,
          variantDisplay: item.displayVariantName,
          sku: item.sku,
          previousStock: item.stock,
          changeAmount: delta,
          newStock: targetStock,
          reason: "تنظیم موجودی گروهی",
          actor: "مدیر سیستم",
        });
      });
      showToast(
        `موجودی ${selectedItems.length} واریانت به ${targetStock} تغییر یافت.`,
        "success"
      );
    } else if (bulkDrawerOpen === "activate") {
      selectedItems.forEach((item) => {
        updateVariant(item.productId, item.variantId, { status: "active" });
      });
      showToast(`${selectedItems.length} واریانت فعال شدند.`, "success");
    } else if (bulkDrawerOpen === "deactivate") {
      selectedItems.forEach((item) => {
        updateVariant(item.productId, item.variantId, { status: "inactive" });
      });
      showToast(`${selectedItems.length} واریانت غیرفعال شدند.`, "success");
    }

    setBulkDrawerOpen(null);
    setSelectedVariantKeys([]);
  };

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-muted-foreground font-medium">
          در حال بارگذاری مدیریت موجودی...
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
              مدیریت موجودی
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              {summary.totalVariants} واریانت
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            مدیریت سریع موجودی، وضعیت انتشار و واریانت‌های کالا
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* History link */}
          <Link
            href="/admin/inventory/history"
            className="inline-flex items-center gap-1.5 h-10 px-3.5 text-xs font-bold rounded-md bg-surface-subtle hover:bg-surface-muted text-foreground border border-border transition-colors"
          >
            <History className="w-4 h-4 text-muted-foreground" />
            <span>تاریخچه تغییرات</span>
          </Link>

          {/* Quick Add Variant */}
          <button
            onClick={() => {
              setAddVariantPreselectedProductId(undefined);
              setAddVariantOpen(true);
            }}
            className="inline-flex items-center gap-1.5 h-10 px-3.5 text-xs font-bold rounded-md bg-surface-subtle hover:bg-surface-muted text-foreground border border-border transition-colors"
          >
            <Plus className="w-4 h-4 text-primary" />
            <span>+ واریانت</span>
          </button>

          {/* Canonical New Product Link */}
          <Link
            href="/admin/products/new"
            className="inline-flex items-center justify-center gap-2 h-10 px-4 text-xs sm:text-sm font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ محصول جدید</span>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          2. COMPACT SUMMARY METRICS
         ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Total Variants */}
        <div
          onClick={() => {
            setStockFilter("all");
            setStatusFilter("all");
          }}
          className={`p-3 rounded-md border text-right cursor-pointer transition-all ${
            stockFilter === "all" && statusFilter === "all"
              ? "bg-background border-primary shadow-xs"
              : "bg-background border-border hover:bg-surface-subtle"
          }`}
        >
          <span className="text-[11px] font-semibold text-muted-foreground block">
            کل واریانت‌ها
          </span>
          <span className="text-lg font-black text-foreground mt-0.5 block">
            {summary.totalVariants}
          </span>
        </div>

        {/* In Stock */}
        <div
          onClick={() => {
            setStockFilter("in-stock");
            setStatusFilter("all");
          }}
          className={`p-3 rounded-md border text-right cursor-pointer transition-all ${
            stockFilter === "in-stock"
              ? "bg-emerald-50/60 border-emerald-500 shadow-xs"
              : "bg-background border-border hover:bg-surface-subtle"
          }`}
        >
          <span className="text-[11px] font-semibold text-emerald-700 block">
            موجود
          </span>
          <span className="text-lg font-black text-emerald-800 mt-0.5 block">
            {summary.inStockCount}
          </span>
        </div>

        {/* Low Stock */}
        <div
          onClick={() => {
            setStockFilter("low-stock");
            setStatusFilter("all");
          }}
          className={`p-3 rounded-md border text-right cursor-pointer transition-all ${
            stockFilter === "low-stock"
              ? "bg-amber-50/60 border-amber-500 shadow-xs"
              : "bg-background border-border hover:bg-surface-subtle"
          }`}
        >
          <span className="text-[11px] font-semibold text-amber-700 block">
            موجودی کم (≤۵)
          </span>
          <span className="text-lg font-black text-amber-800 mt-0.5 block">
            {summary.lowStockCount}
          </span>
        </div>

        {/* Out of Stock */}
        <div
          onClick={() => {
            setStockFilter("out-of-stock");
            setStatusFilter("all");
          }}
          className={`p-3 rounded-md border text-right cursor-pointer transition-all ${
            stockFilter === "out-of-stock"
              ? "bg-rose-50/60 border-rose-500 shadow-xs"
              : "bg-background border-border hover:bg-surface-subtle"
          }`}
        >
          <span className="text-[11px] font-semibold text-rose-700 block">
            ناموجود
          </span>
          <span className="text-lg font-black text-rose-800 mt-0.5 block">
            {summary.outOfStockCount}
          </span>
        </div>

        {/* Inactive */}
        <div
          onClick={() => {
            setStatusFilter("inactive");
            setStockFilter("all");
          }}
          className={`p-3 rounded-md border text-right cursor-pointer transition-all col-span-2 sm:col-span-1 ${
            statusFilter === "inactive"
              ? "bg-gray-100 border-gray-400 shadow-xs"
              : "bg-background border-border hover:bg-surface-subtle"
          }`}
        >
          <span className="text-[11px] font-semibold text-muted-foreground block">
            غیرفعال
          </span>
          <span className="text-lg font-black text-foreground mt-0.5 block">
            {summary.inactiveCount}
          </span>
        </div>
      </div>

      {/* =========================================================================
          3. ACTIONABLE ATTENTION NOTIFICATION BANNER
         ========================================================================= */}
      {summary.attentionCount > 0 && stockFilter !== "attention" && (
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-md p-3 px-4 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-900">
            <Bell className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-bold">
              {summary.attentionCount} واریانت نیاز به بررسی یا افزایش موجودی دارند.
            </span>
          </div>
          <button
            onClick={() => setStockFilter("attention")}
            className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded transition-colors"
          >
            <span>نیاز به اقدام</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =========================================================================
          4. SEARCH & FILTER TOOLBAR
         ========================================================================= */}
      {/* Desktop Toolbar */}
      <div className="hidden lg:flex flex-col gap-3 bg-background p-4 rounded-md border border-border">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="جستجوی محصول، SKU، رنگ، سایز..."
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

          {/* Stock Status Filter */}
          <select
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 bg-surface-subtle border border-border/80 rounded-md text-xs font-medium text-foreground focus:outline-none focus:border-primary cursor-pointer min-w-[130px]"
          >
            <option value="all">همه موجودی‌ها</option>
            <option value="in-stock">موجود</option>
            <option value="low-stock">موجودی کم (≤۵)</option>
            <option value="out-of-stock">ناموجود</option>
            <option value="attention">نیاز به اقدام</option>
          </select>

          {/* Activation Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 bg-surface-subtle border border-border/80 rounded-md text-xs font-medium text-foreground focus:outline-none focus:border-primary cursor-pointer min-w-[110px]"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="active">فعال</option>
            <option value="inactive">غیرفعال</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 bg-surface-subtle border border-border/80 rounded-md text-xs font-medium text-foreground focus:outline-none focus:border-primary cursor-pointer min-w-[130px]"
          >
            <option value="all">همه دسته‌بندی‌ها</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Brand Filter */}
          {brandsList.length > 0 && (
            <select
              value={brandFilter}
              onChange={(e) => {
                setBrandFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 px-3 bg-surface-subtle border border-border/80 rounded-md text-xs font-medium text-foreground focus:outline-none focus:border-primary cursor-pointer min-w-[110px]"
            >
              <option value="all">همه برندها</option>
              {brandsList.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          )}

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-10 px-3 bg-surface-subtle border border-border/80 rounded-md text-xs font-medium text-foreground focus:outline-none focus:border-primary cursor-pointer min-w-[120px]"
          >
            <option value="updated_desc">آخرین تغییر</option>
            <option value="stock_asc">کمترین موجودی</option>
            <option value="stock_desc">بیشترین موجودی</option>
            <option value="product_asc">نام محصول</option>
            <option value="sku_asc">کد SKU</option>
          </select>

          {/* Clear Filters Button */}
          {activeFiltersCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 h-10 px-3 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors shrink-0"
              title="حذف فیلترها"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>حذف فیلترها ({activeFiltersCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Search & Filter Button */}
      <div className="lg:hidden flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="جستجوی محصول، SKU، رنگ یا سایز..."
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
          <div className="relative bg-background border-t border-border rounded-t-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto z-10 dir-rtl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">فیلتر و مرتب‌سازی موجودی</h3>
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
                  وضعیت موجودی
                </label>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-subtle border border-border rounded-md font-medium text-foreground"
                >
                  <option value="all">همه موجودی‌ها</option>
                  <option value="in-stock">موجود</option>
                  <option value="low-stock">موجودی کم (≤۵)</option>
                  <option value="out-of-stock">ناموجود</option>
                  <option value="attention">نیاز به اقدام</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-medium">
                  وضعیت انتشار
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-subtle border border-border rounded-md font-medium text-foreground"
                >
                  <option value="all">همه وضعیت‌ها</option>
                  <option value="active">فعال</option>
                  <option value="inactive">غیرفعال</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-medium">
                  دسته‌بندی
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-subtle border border-border rounded-md font-medium text-foreground"
                >
                  <option value="all">همه دسته‌بندی‌ها</option>
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
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
                  <option value="updated_desc">آخرین تغییر</option>
                  <option value="stock_asc">کمترین موجودی</option>
                  <option value="stock_desc">بیشترین موجودی</option>
                  <option value="product_asc">نام محصول</option>
                  <option value="sku_asc">کد SKU</option>
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
                  className="h-10 px-3 bg-surface-subtle text-rose-600 font-semibold rounded-md text-xs"
                >
                  حذف همه
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. BULK ACTION CONTEXTUAL BAR
         ========================================================================= */}
      {selectedVariantKeys.length > 0 && (
        <div className="sticky top-20 z-10 bg-primary text-primary-foreground p-3 sm:p-4 rounded-md shadow-md flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-150 dir-rtl">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-bold">
              {selectedVariantKeys.length} واریانت انتخاب شده است
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs font-semibold">
            <button
              onClick={() => setBulkDrawerOpen("increase")}
              className="h-8 px-3 rounded bg-white/10 hover:bg-white/20 transition-colors"
            >
              افزایش موجودی
            </button>
            <button
              onClick={() => setBulkDrawerOpen("set")}
              className="h-8 px-3 rounded bg-white/10 hover:bg-white/20 transition-colors"
            >
              تنظیم موجودی
            </button>
            <button
              onClick={() => setBulkDrawerOpen("activate")}
              className="h-8 px-3 rounded bg-white/10 hover:bg-white/20 transition-colors"
            >
              فعال کردن
            </button>
            <button
              onClick={() => setBulkDrawerOpen("deactivate")}
              className="h-8 px-3 rounded bg-white/10 hover:bg-white/20 transition-colors"
            >
              غیرفعال کردن
            </button>
            <button
              onClick={() => setSelectedVariantKeys([])}
              className="h-8 px-2 text-white/80 hover:text-white"
              title="انصراف از انتخاب"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. INVENTORY TABLE / MOBILE CARDS
         ========================================================================= */}
      {paginatedVariants.length === 0 ? (
        /* EMPTY STATE */
        <div className="bg-background border border-border rounded-md p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-3 dir-rtl">
          <div className="w-12 h-12 rounded-full bg-surface-subtle flex items-center justify-center text-muted-foreground">
            <PackageX className="w-6 h-6" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-foreground">
            واریانتی پیدا نشد
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            فیلترها یا عبارت جستجو را تغییر دهید یا واریانت جدید اضافه کنید.
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
          <div className="hidden lg:block bg-background border border-border rounded-md overflow-hidden dir-rtl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-surface-subtle border-b border-border text-muted-foreground text-[11px] font-semibold select-none">
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
                    <th className="py-3 px-3">واریانت</th>
                    <th className="py-3 px-3">SKU</th>
                    <th className="py-3 px-3 min-w-[140px]">موجودی</th>
                    <th className="py-3 px-3">وضعیت موجودی</th>
                    <th className="py-3 px-3">وضعیت</th>
                    <th className="py-3 px-4 text-left">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedVariants.map((item) => {
                    const varKey = `${item.productId}:${item.variantId}`;
                    const isSelected = selectedVariantKeys.includes(varKey);
                    const isEditingStock = editingStockKey === varKey;

                    return (
                      <tr
                        key={varKey}
                        className={`hover:bg-surface-subtle/70 transition-colors ${
                          isSelected ? "bg-primary/5" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() =>
                              handleToggleSelectVariant(item.productId, item.variantId)
                            }
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-primary" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* Product Image & Title Link */}
                        <td className="py-3 px-3 min-w-[200px]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded bg-surface-subtle border border-border shrink-0 overflow-hidden relative">
                              <Image
                                src={item.productImage || "/images/bag-1.webp"}
                                alt={item.productTitle}
                                fill
                                className="object-cover"
                                sizes="36px"
                              />
                            </div>
                            <div className="min-w-0">
                              <Link
                                href={`/admin/products/${item.productId}`}
                                className="font-bold text-foreground text-xs hover:text-primary transition-colors line-clamp-1"
                              >
                                {item.productTitle}
                              </Link>
                              <span className="text-[10px] text-muted-foreground block truncate">
                                {item.categoryName}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Dynamic Variant Options (e.g. سفید / M) */}
                        <td className="py-3 px-3 font-bold text-foreground text-xs">
                          {item.displayVariantName}
                        </td>

                        {/* SKU */}
                        <td className="py-3 px-3 text-[11px] font-mono text-muted-foreground dir-ltr text-right">
                          {item.sku}
                        </td>

                        {/* Stock Stepper & Direct Numeric Edit */}
                        <td className="py-3 px-3">
                          {isEditingStock ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                value={editingStockValue}
                                onChange={(e) => setEditingStockValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleSaveDirectStockEdit(item);
                                  } else if (e.key === "Escape") {
                                    setEditingStockKey(null);
                                  }
                                }}
                                className="w-16 h-7 px-1.5 bg-background border border-primary rounded text-xs font-bold text-center focus:outline-none"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveDirectStockEdit(item)}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                title="ذخیره"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingStockKey(null)}
                                className="p-1 text-muted-foreground hover:bg-surface-subtle rounded"
                                title="انصراف"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 bg-surface-subtle border border-border rounded-md px-1.5 py-0.5">
                              {/* Minus Button */}
                              <button
                                onClick={() => handleStockDelta(item, -1)}
                                className="w-5 h-5 flex items-center justify-center rounded hover:bg-surface-muted text-foreground font-bold transition-colors"
                                aria-label="کاهش موجودی"
                                title="کاهش موجودی (-۱)"
                              >
                                −
                              </button>

                              {/* Clickable Numeric Display */}
                              <button
                                onClick={() => handleStartStockEdit(item)}
                                className="px-1.5 text-xs font-black text-foreground hover:text-primary transition-colors min-w-[24px] text-center"
                                title="برای ویرایش مستقیم کلیک کنید"
                              >
                                {item.stock}
                              </button>

                              {/* Plus Button */}
                              <button
                                onClick={() => handleStockDelta(item, 1)}
                                className="w-5 h-5 flex items-center justify-center rounded hover:bg-surface-muted text-foreground font-bold transition-colors"
                                aria-label="افزایش موجودی"
                                title="افزایش موجودی (+۱)"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Inventory Derived Status */}
                        <td className="py-3 px-3">
                          {item.inventoryStatus === "out-of-stock" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <AlertTriangle className="w-3 h-3" />
                              <span>ناموجود</span>
                            </span>
                          )}
                          {item.inventoryStatus === "low-stock" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <AlertTriangle className="w-3 h-3" />
                              <span>موجودی کم</span>
                            </span>
                          )}
                          {item.inventoryStatus === "in-stock" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>موجود</span>
                            </span>
                          )}
                        </td>

                        {/* Activation Toggle */}
                        <td className="py-3 px-3">
                          <button
                            onClick={() => handleToggleStatus(item)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors ${
                              item.isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                            }`}
                            title={item.isActive ? "غیرفعال کردن واریانت" : "فعال کردن واریانت"}
                          >
                            <Power className="w-3 h-3" />
                            <span>{item.isActive ? "فعال" : "غیرفعال"}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-left">
                          <div className="flex items-center justify-end gap-1">
                            {/* Quick Add Variant to same product */}
                            <button
                              onClick={() => {
                                setAddVariantPreselectedProductId(item.productId);
                                setAddVariantOpen(true);
                              }}
                              className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-surface-subtle transition-colors"
                              title="افزودن واریانت دیگر به این محصول"
                            >
                              <Plus className="w-4 h-4" />
                            </button>

                            {/* Quick Edit Variant */}
                            <button
                              onClick={() => setEditingVariantItem(item)}
                              className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
                              title="ویرایش این واریانت"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* Go to Product Edit page */}
                            <Link
                              href={`/admin/products/${item.productId}`}
                              className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
                              title="مشاهده/ویرایش محصول اصلی"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE COMPACT CARDS */}
          <div className="lg:hidden space-y-3 dir-rtl">
            {paginatedVariants.map((item) => {
              const varKey = `${item.productId}:${item.variantId}`;
              const isSelected = selectedVariantKeys.includes(varKey);

              return (
                <div
                  key={varKey}
                  className={`bg-background border rounded-md p-3.5 flex flex-col gap-3 transition-colors ${
                    isSelected ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        onClick={() =>
                          handleToggleSelectVariant(item.productId, item.variantId)
                        }
                        className="text-muted-foreground hover:text-foreground shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-primary" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      <div className="w-10 h-10 rounded bg-surface-subtle border border-border shrink-0 overflow-hidden relative">
                        <Image
                          src={item.productImage || "/images/bag-1.webp"}
                          alt={item.productTitle}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>

                      <div className="min-w-0">
                        <Link
                          href={`/admin/products/${item.productId}`}
                          className="font-bold text-foreground text-xs line-clamp-1 hover:text-primary"
                        >
                          {item.productTitle}
                        </Link>
                        <p className="font-extrabold text-primary text-xs mt-0.5">
                          {item.displayVariantName}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 relative">
                      <button
                        onClick={() =>
                          setActiveMenuKey(activeMenuKey === varKey ? null : varKey)
                        }
                        className="p-1.5 rounded-md text-muted-foreground hover:bg-surface-subtle"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuKey === varKey && (
                        <div className="absolute left-0 top-8 z-20 w-44 bg-background border border-border rounded-md shadow-lg py-1 text-xs">
                          <button
                            onClick={() => {
                              setEditingVariantItem(item);
                              setActiveMenuKey(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-foreground hover:bg-surface-subtle"
                          >
                            <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>ویرایش واریانت</span>
                          </button>

                          <button
                            onClick={() => {
                              setAddVariantPreselectedProductId(item.productId);
                              setAddVariantOpen(true);
                              setActiveMenuKey(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-foreground hover:bg-surface-subtle"
                          >
                            <Plus className="w-3.5 h-3.5 text-primary" />
                            <span>+ واریانت برای این محصول</span>
                          </button>

                          <Link
                            href={`/admin/products/${item.productId}`}
                            className="w-full flex items-center gap-2 px-3 py-2 text-foreground hover:bg-surface-subtle"
                            onClick={() => setActiveMenuKey(null)}
                          >
                            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>مشاهده محصول</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stock Controls & Status on Mobile */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-2 bg-surface-subtle border border-border rounded px-2 py-1">
                        <button
                          onClick={() => handleStockDelta(item, -1)}
                          className="w-6 h-6 rounded bg-background border border-border flex items-center justify-center font-extrabold text-sm"
                        >
                          −
                        </button>
                        <span className="font-black text-sm px-1">{item.stock}</span>
                        <button
                          onClick={() => handleStockDelta(item, 1)}
                          className="w-6 h-6 rounded bg-background border border-border flex items-center justify-center font-extrabold text-sm"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`px-2 py-1 rounded text-[10px] font-bold border ${
                          item.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-gray-100 text-gray-600 border-gray-300"
                        }`}
                      >
                        {item.isActive ? "فعال" : "غیرفعال"}
                      </button>
                    </div>

                    <span className="text-[11px] font-mono text-muted-foreground">
                      {item.sku}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* =========================================================================
              7. PAGINATION CONTROLS
             ========================================================================= */}
          <div className="bg-background border border-border rounded-md p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs dir-rtl">
            <div className="flex items-center gap-3 text-muted-foreground">
              <span>
                نمایش {(validPage - 1) * itemsPerPage + 1} تا{" "}
                {Math.min(validPage * itemsPerPage, totalItems)} از {totalItems} واریانت
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
          8. DRAWERS & DIALOGS
         ========================================================================= */}

      {/* Add Variant Drawer */}
      <AddVariantDrawer
        isOpen={addVariantOpen}
        onClose={() => setAddVariantOpen(false)}
        preselectedProductId={addVariantPreselectedProductId}
        onEditExistingVariant={(prodId, varId) => {
          const item = allVariantItems.find(
            (i) => i.productId === prodId && i.variantId === varId
          );
          if (item) {
            setEditingVariantItem(item);
          }
        }}
      />

      {/* Quick Edit Variant Drawer */}
      <QuickEditVariantDrawer
        isOpen={!!editingVariantItem}
        onClose={() => setEditingVariantItem(null)}
        item={editingVariantItem}
      />

      {/* Confirmation Dialog */}
      <ConfirmActionDialog
        isOpen={!!confirmDialogConfig}
        onClose={() => setConfirmDialogConfig(null)}
        config={confirmDialogConfig}
      />

      {/* Bulk Action Config Modal */}
      {bulkDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setBulkDrawerOpen(null)}
          />
          <div className="relative bg-background border border-border rounded-xl shadow-xl w-full max-w-sm p-5 space-y-4 z-10 dir-rtl">
            <h3 className="text-sm font-bold text-foreground">
              {bulkDrawerOpen === "increase" && "افزایش موجودی گروهی"}
              {bulkDrawerOpen === "set" && "تنظیم موجودی گروهی"}
              {bulkDrawerOpen === "activate" && "فعال‌سازی گروهی"}
              {bulkDrawerOpen === "deactivate" && "غیرفعال‌سازی گروهی"}
            </h3>

            <p className="text-xs text-muted-foreground">
              تعداد واریانت‌های انتخاب‌شده:{" "}
              <strong className="text-foreground">{selectedVariantKeys.length}</strong>
            </p>

            {(bulkDrawerOpen === "increase" || bulkDrawerOpen === "set") && (
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {bulkDrawerOpen === "increase"
                    ? "مقدار افزایش (عدد):"
                    : "مقدار جدید موجودی:"}
                </label>
                <input
                  type="number"
                  min="0"
                  value={bulkAmountInput}
                  onChange={(e) => setBulkAmountInput(Number(e.target.value))}
                  className="w-full h-10 px-3 bg-surface-subtle border border-border rounded-md text-xs font-bold text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            )}

            {(bulkDrawerOpen === "activate" || bulkDrawerOpen === "deactivate") && (
              <p className="text-xs text-foreground bg-surface-subtle p-3 rounded-md">
                آیا از {bulkDrawerOpen === "activate" ? "فعال‌سازی" : "غیرفعال‌سازی"}{" "}
                گروهی واریانت‌ها اطمینان دارید؟
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setBulkDrawerOpen(null)}
                className="h-9 px-4 text-xs font-bold rounded-md bg-surface-subtle text-foreground"
              >
                انصراف
              </button>
              <button
                onClick={handleApplyBulkAction}
                className="h-9 px-4 text-xs font-bold rounded-md bg-primary text-primary-foreground"
              >
                اعمال تغییرات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
