"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Plus,
  Trash2,
  X,
  Check,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Tag,
  CheckSquare,
  Square,
  RotateCcw,
  Sliders,
  FileText,
  Copy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { useProducts } from "@/context/ProductContext";
import {
  Product,
  ProductOption,
  ProductOptionValue,
  ProductVariant,
  ProductStatus,
  ProductSpecification,
} from "@/types/product";
import { useToast } from "@/components/ui/Toast";

// Pre-defined option templates
const OPTION_TEMPLATES = [
  {
    name: "رنگ",
    type: "color" as const,
    values: [
      { label: "مشکی", value: "#000000" },
      { label: "سفید", value: "#FFFFFF" },
      { label: "قهوه‌ای", value: "#654321" },
      { label: "کرم", value: "#FFFDD0" },
      { label: "عسلی", value: "#D2B48C" },
    ],
  },
  {
    name: "سایز",
    type: "size" as const,
    values: [
      { label: "36", value: "36" },
      { label: "37", value: "37" },
      { label: "38", value: "38" },
      { label: "39", value: "39" },
      { label: "40", value: "40" },
    ],
  },
  {
    name: "جنس",
    type: "material" as const,
    values: [
      { label: "چرم طبیعی", value: "natural_leather" },
      { label: "چرم مصنوعی", value: "synthetic_leather" },
      { label: "جیر", value: "suede" },
      { label: "برزنت", value: "canvas" },
    ],
  },
];

export default function AddProductPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { categories, brands, addProduct, addCategory, addBrand } = useProducts();

  // Basic Product Info State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    categories[0]?.id || ""
  );
  const [selectedBrandId, setSelectedBrandId] = useState(brands[0]?.id || "");
  const [tagsInput, setTagsInput] = useState("");
  const [status, setStatus] = useState<ProductStatus>("active");

  // Defaults for Generator & Variants
  const [defaultPrice, setDefaultPrice] = useState<number>(1500000);
  const [defaultCompareAtPrice, setDefaultCompareAtPrice] = useState<number | undefined>(
    1800000
  );
  const [defaultStock, setDefaultStock] = useState<number>(10);
  const [skuPrefix, setSkuPrefix] = useState<string>("PROD");

  // Product Images
  const [images, setImages] = useState<string[]>([
    "/images/bag-1.webp",
    "/images/bag-2.webp",
  ]);
  const [newImageUrl, setNewImageUrl] = useState("");

  // Product Options State
  const [options, setOptions] = useState<ProductOption[]>([]);

  // Generated Variants State
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);

  // Specifications State
  const [specifications, setSpecifications] = useState<ProductSpecification[]>([
    { label: "جنس رویه", value: "چرم مصنوعی اعلا" },
    { label: "کشور سازنده", value: "ایران" },
  ]);
  const [newSpecLabel, setNewSpecLabel] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");

  // Modals state
  const [modalType, setModalType] = useState<
    "category" | "brand" | "option" | "value" | null
  >(null);
  const [activeOptionIdForValue, setActiveOptionIdForValue] = useState<string | null>(
    null
  );

  // Quick Modal Inputs
  const [newCatName, setNewCatName] = useState("");
  const [newBrandName, setNewBrandName] = useState("");
  const [newOptionName, setNewOptionName] = useState("");
  const [newValueLabel, setNewValueLabel] = useState("");
  const [newValueColor, setNewValueColor] = useState("#000000");

  // Bulk Variant Editing In Table
  const [bulkPriceInput, setBulkPriceInput] = useState<number>(0);
  const [bulkStockInput, setBulkStockInput] = useState<number>(0);

  // Accordion Toggles
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    basic: true,
    images: true,
    options: true,
    variants: true,
    specs: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Image Handlers
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Quick Category & Brand Handlers
  const handleCreateCategory = () => {
    if (!newCatName.trim()) return;
    const newCat = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      slug: newCatName.trim().toLowerCase().replace(/\s+/g, "-"),
    };
    addCategory(newCat);
    setSelectedCategoryId(newCat.id);
    setNewCatName("");
    setModalType(null);
    showToast(`دسته‌بندی «${newCat.name}» ایجاد شد.`, "success");
  };

  const handleCreateBrand = () => {
    if (!newBrandName.trim()) return;
    const newBrand = {
      id: `brand-${Date.now()}`,
      name: newBrandName.trim(),
      slug: newBrandName.trim().toLowerCase().replace(/\s+/g, "-"),
    };
    addBrand(newBrand);
    setSelectedBrandId(newBrand.id);
    setNewBrandName("");
    setModalType(null);
    showToast(`برند «${newBrand.name}» ایجاد شد.`, "success");
  };

  // Option & Value Handlers
  const handleAddOptionFromTemplate = (templateIndex: number) => {
    const tmpl = OPTION_TEMPLATES[templateIndex];
    if (options.some((o) => o.name === tmpl.name)) {
      showToast(`آپشن «${tmpl.name}» قبلاً اضافه شده است.`, "warning");
      return;
    }
    const optId = `opt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newOpt: ProductOption = {
      id: optId,
      name: tmpl.name,
      type: tmpl.type,
      required: true,
      sortOrder: options.length,
      values: tmpl.values.map((v, idx) => ({
        id: `val-${optId}-${idx}`,
        label: v.label,
        value: v.value,
        sortOrder: idx,
      })),
    };
    setOptions((prev) => [...prev, newOpt]);
    showToast(`آپشن «${tmpl.name}» اضافه شد.`, "success");
  };

  const handleCreateCustomOption = () => {
    if (!newOptionName.trim()) return;
    const optId = `opt-${Date.now()}`;
    const newOpt: ProductOption = {
      id: optId,
      name: newOptionName.trim(),
      type: "custom",
      required: true,
      sortOrder: options.length,
      values: [],
    };
    setOptions((prev) => [...prev, newOpt]);
    setNewOptionName("");
    setModalType(null);
    showToast(`آپشن «${newOpt.name}» ایجاد شد.`, "success");
  };

  const handleRemoveOption = (optionId: string) => {
    setOptions((prev) => prev.filter((o) => o.id !== optionId));
  };

  const handleAddValueToOption = (optionId: string) => {
    if (!newValueLabel.trim()) return;
    const valId = `val-${optionId}-${Date.now()}`;
    const newVal: ProductOptionValue = {
      id: valId,
      label: newValueLabel.trim(),
      value: newValueColor || newValueLabel.trim(),
      sortOrder: 0,
    };
    setOptions((prev) =>
      prev.map((o) => (o.id === optionId ? { ...o, values: [...o.values, newVal] } : o))
    );
    setNewValueLabel("");
    setModalType(null);
    setActiveOptionIdForValue(null);
  };

  const handleRemoveValueFromOption = (optionId: string, valueId: string) => {
    setOptions((prev) =>
      prev.map((o) =>
        o.id === optionId
          ? { ...o, values: o.values.filter((v) => v.id !== valueId) }
          : o
      )
    );
  };

  // Cartesian Combination Generator
  const handleGenerateCombinations = () => {
    if (options.length === 0 || options.some((o) => o.values.length === 0)) {
      showToast(
        "لطفاً ابتدا حداقل یک آپشن با مقادیر (Values) تعریف کنید.",
        "warning"
      );
      return;
    }

    // Cartesian Product
    const cartesian = (
      args: ProductOptionValue[][]
    ): ProductOptionValue[][] => {
      let r: ProductOptionValue[][] = [[]];
      for (const optValues of args) {
        const next: ProductOptionValue[][] = [];
        for (const existingComb of r) {
          for (const val of optValues) {
            next.push([...existingComb, val]);
          }
        }
        r = next;
      }
      return r;
    };

    const optionValuesArray = options.map((o) => o.values);
    const combinations = cartesian(optionValuesArray);

    const newGeneratedVariants: ProductVariant[] = combinations.map(
      (comb, idx) => {
        const optValues = comb.map((v, optIdx) => ({
          optionId: options[optIdx].id,
          valueId: v.id,
        }));

        const skuCodes = comb.map((v) => v.label.toUpperCase().replace(/\s+/g, ""));
        const sku = `${skuPrefix}-${skuCodes.join("-")}-${idx + 1}`;

        return {
          id: `var-${Date.now()}-${idx}`,
          sku,
          optionValues: optValues,
          pricing: {
            price: defaultPrice,
            compareAtPrice: defaultCompareAtPrice,
          },
          inventory: {
            stock: defaultStock,
            trackStock: true,
          },
          status: "active",
        };
      }
    );

    setVariants(newGeneratedVariants);
    setSelectedVariantIds([]);
    showToast(
      `${newGeneratedVariants.length} ترکیب واریانت با موفقیت تولید شد.`,
      "success"
    );
  };

  // Variant Table Actions
  const handleUpdateVariantInTable = (
    variantId: string,
    field: string,
    value: any
  ) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== variantId) return v;
        if (field === "price") {
          return { ...v, pricing: { ...v.pricing, price: Number(value) } };
        }
        if (field === "compareAtPrice") {
          return {
            ...v,
            pricing: {
              ...v.pricing,
              compareAtPrice: value ? Number(value) : undefined,
            },
          };
        }
        if (field === "stock") {
          return {
            ...v,
            inventory: { ...v.inventory, stock: Number(value) },
          };
        }
        if (field === "sku") {
          return { ...v, sku: value };
        }
        if (field === "status") {
          return { ...v, status: value };
        }
        return v;
      })
    );
  };

  const handleDeleteVariantInTable = (variantId: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== variantId));
    setSelectedVariantIds((prev) => prev.filter((id) => id !== variantId));
  };

  const handleDuplicateVariantInTable = (variant: ProductVariant) => {
    const dup: ProductVariant = {
      ...variant,
      id: `var-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      sku: `${variant.sku}-COPY`,
    };
    setVariants((prev) => [...prev, dup]);
    showToast("واریانت تکثیر شد.", "info");
  };

  // Bulk Variant Handlers
  const handleToggleSelectAllVariants = () => {
    if (selectedVariantIds.length === variants.length) {
      setSelectedVariantIds([]);
    } else {
      setSelectedVariantIds(variants.map((v) => v.id));
    }
  };

  const handleToggleSelectVariant = (id: string) => {
    setSelectedVariantIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleApplyBulkVariantPrice = () => {
    if (selectedVariantIds.length === 0 || !bulkPriceInput) return;
    setVariants((prev) =>
      prev.map((v) =>
        selectedVariantIds.includes(v.id)
          ? { ...v, pricing: { ...v.pricing, price: bulkPriceInput } }
          : v
      )
    );
    showToast(
      `قیمت ${selectedVariantIds.length} واریانت تغییر یافت.`,
      "success"
    );
  };

  const handleApplyBulkVariantStock = () => {
    if (selectedVariantIds.length === 0) return;
    setVariants((prev) =>
      prev.map((v) =>
        selectedVariantIds.includes(v.id)
          ? { ...v, inventory: { ...v.inventory, stock: bulkStockInput } }
          : v
      )
    );
    showToast(
      `موجودی ${selectedVariantIds.length} واریانت تغییر یافت.`,
      "success"
    );
  };

  const handleApplyBulkDeleteVariants = () => {
    if (selectedVariantIds.length === 0) return;
    setVariants((prev) =>
      prev.filter((v) => !selectedVariantIds.includes(v.id))
    );
    setSelectedVariantIds([]);
    showToast("واریانت‌های انتخاب‌شده حذف شدند.", "success");
  };

  // Specification Handlers
  const handleAddSpecification = () => {
    if (!newSpecLabel.trim() || !newSpecValue.trim()) return;
    setSpecifications((prev) => [
      ...prev,
      { label: newSpecLabel.trim(), value: newSpecValue.trim() },
    ]);
    setNewSpecLabel("");
    setNewSpecValue("");
  };

  const handleRemoveSpecification = (index: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  // Save Product Handler
  const handleSaveProduct = (targetStatus?: ProductStatus) => {
    if (!title.trim()) {
      showToast("لطفاً عنوان محصول را وارد کنید.", "warning");
      return;
    }

    const catObj =
      categories.find((c) => c.id === selectedCategoryId) || categories[0];
    const brandObj = brands.find((b) => b.id === selectedBrandId) || brands[0];

    const minPrice =
      variants.length > 0
        ? Math.min(...variants.map((v) => v.pricing.price))
        : defaultPrice;

    const maxPrice =
      variants.length > 0
        ? Math.max(...variants.map((v) => v.pricing.price))
        : defaultPrice;

    const totalStock =
      variants.length > 0
        ? variants.reduce((sum, v) => sum + v.inventory.stock, 0)
        : defaultStock;

    const tagsArr = tagsInput
      ? tagsInput
          .split("،")
          .join(",")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      slug: title
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\u0600-\u06FF-]/g, ""),
      title: title.trim(),
      description: description.trim(),
      category: catObj,
      brand: brandObj,
      images: images.map((url, idx) => ({
        id: `img-${Date.now()}-${idx}`,
        url,
        alt: title,
        sortOrder: idx,
      })),
      options,
      variants,
      pricing: {
        minPrice,
        maxPrice,
        minCompareAtPrice: defaultCompareAtPrice,
        hasDiscount: !!defaultCompareAtPrice && defaultCompareAtPrice > minPrice,
      },
      inventory: {
        totalStock,
        trackStock: true,
        hasAvailableVariants: totalStock > 0,
      },
      specifications,
      tags: tagsArr,
      status: targetStatus || status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addProduct(newProduct);
    showToast(`محصول «${newProduct.title}» با موفقیت ثبت شد.`, "success");
    router.push("/admin/products");
  };

  // Option Label Helper for Table
  const getOptionValueLabel = (optionId: string, valueId: string) => {
    const option = options.find((o) => o.id === optionId);
    if (!option) return valueId;
    const valObj = option.values.find((v) => v.id === valueId);
    return valObj ? valObj.label : valueId;
  };

  const getVariantCombinationText = (variant: ProductVariant) => {
    if (!variant.optionValues || variant.optionValues.length === 0) {
      return "پیش‌فرض";
    }
    return variant.optionValues
      .map((ov) => getOptionValueLabel(ov.optionId, ov.valueId))
      .join(" / ");
  };

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link
              href="/admin/products"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>محصولات</span>
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold">افزودن محصول جدید</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
            تعریف محصول و واریانت جدید
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSaveProduct("draft")}
            className="h-9 px-3.5 text-xs font-semibold rounded-md bg-surface-subtle border border-border hover:bg-surface-muted text-foreground transition-colors"
          >
            ذخیره پیش‌نویس
          </button>
          <button
            onClick={() => handleSaveProduct("active")}
            className="h-9 px-4 text-xs font-bold rounded-md bg-primary text-primary-foreground hover:bg-primary-hover transition-colors shadow-xs"
          >
            انتشار محصول
          </button>
        </div>
      </div>

      {/* SECTION 1: BASIC INFORMATION */}
      <div className="bg-background border border-border rounded-md overflow-hidden">
        <button
          onClick={() => toggleSection("basic")}
          className="w-full flex items-center justify-between p-4 bg-surface-subtle border-b border-border text-right"
        >
          <div className="flex items-center gap-2 font-bold text-sm text-foreground">
            <FileText className="w-4 h-4 text-primary" />
            <span>اطلاعات اصلی محصول</span>
          </div>
          {openSections.basic ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {openSections.basic && (
          <div className="p-4 space-y-4 text-xs">
            <div>
              <label className="block font-bold text-foreground mb-1">
                عنوان محصول *
              </label>
              <input
                type="text"
                placeholder="مثلاً: کیف دستی چرم کلاسیک مدل آرتیمیس"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 px-3 bg-surface-subtle border border-border/80 rounded-md text-foreground focus:outline-none focus:border-primary text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category Select + Quick Create */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-foreground">دسته‌بندی *</label>
                  <button
                    type="button"
                    onClick={() => setModalType("category")}
                    className="text-[11px] text-primary font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>دسته‌بندی جدید</span>
                  </button>
                </div>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-subtle border border-border/80 rounded-md text-foreground focus:outline-none focus:border-primary font-medium"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand Select + Quick Create */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-foreground">برند</label>
                  <button
                    type="button"
                    onClick={() => setModalType("brand")}
                    className="text-[11px] text-primary font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>برند جدید</span>
                  </button>
                </div>
                <select
                  value={selectedBrandId}
                  onChange={(e) => setSelectedBrandId(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-subtle border border-border/80 rounded-md text-foreground focus:outline-none focus:border-primary font-medium"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">توضیحات</label>
              <textarea
                rows={3}
                placeholder="توضیحات کامل محصول، کاربردها و ویژگی‌های برجسته..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-surface-subtle border border-border/80 rounded-md text-foreground focus:outline-none focus:border-primary text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">
                برچسب‌ها (با کاما یا ویرگول جدا کنید)
              </label>
              <input
                type="text"
                placeholder="چرم, تخفیف, زنانه, جدید"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full h-10 px-3 bg-surface-subtle border border-border/80 rounded-md text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: IMAGES */}
      <div className="bg-background border border-border rounded-md overflow-hidden">
        <button
          onClick={() => toggleSection("images")}
          className="w-full flex items-center justify-between p-4 bg-surface-subtle border-b border-border text-right"
        >
          <div className="flex items-center gap-2 font-bold text-sm text-foreground">
            <ImageIcon className="w-4 h-4 text-primary" />
            <span>تصاویر محصول</span>
          </div>
          {openSections.images ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {openSections.images && (
          <div className="p-4 space-y-3 text-xs">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="آدرس تصویر (URL) را وارد کنید (مثلاً: /images/bag-1.webp)"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 h-10 px-3 bg-surface-subtle border border-border/80 rounded-md text-foreground focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="h-10 px-4 font-bold bg-primary text-primary-foreground rounded-md hover:bg-primary-hover shrink-0"
              >
                افزودن تصویر
              </button>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              {images.map((url, idx) => (
                <div
                  key={idx}
                  className="w-20 h-20 rounded-md border border-border bg-surface-subtle relative group overflow-hidden"
                >
                  <Image
                    src={url}
                    alt={`Product Image ${idx}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 left-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-0 inset-x-0 bg-primary/90 text-primary-foreground text-[9px] font-bold text-center py-0.5">
                      تصویر اصلی
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: OPTIONS & VALUES */}
      <div className="bg-background border border-border rounded-md overflow-hidden">
        <button
          onClick={() => toggleSection("options")}
          className="w-full flex items-center justify-between p-4 bg-surface-subtle border-b border-border text-right"
        >
          <div className="flex items-center gap-2 font-bold text-sm text-foreground">
            <Sliders className="w-4 h-4 text-primary" />
            <span>تعریف Optionها و المقادیر (Values)</span>
          </div>
          {openSections.options ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {openSections.options && (
          <div className="p-4 space-y-4 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-foreground">افزودن سریع آپشن:</span>
              {OPTION_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={tmpl.name}
                  type="button"
                  onClick={() => handleAddOptionFromTemplate(idx)}
                  className="h-8 px-3 rounded-full bg-surface-subtle border border-border hover:border-primary text-foreground font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3 text-primary" />
                  <span>{tmpl.name}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setModalType("option")}
                className="h-8 px-3 rounded-full bg-primary/10 text-primary font-bold hover:bg-primary/20 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>آپشن سفارشی جدید</span>
              </button>
            </div>

            {/* List of Defined Options */}
            {options.length === 0 ? (
              <p className="text-muted-foreground italic py-2">
                هنوز هیچ آپشنی اضافه نشده است. با دکمه‌های بالا آپشن‌ها را اضافه کنید.
              </p>
            ) : (
              <div className="space-y-3 pt-2">
                {options.map((opt) => (
                  <div
                    key={opt.id}
                    className="p-3 bg-surface-subtle border border-border rounded-md space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">
                          {opt.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground bg-background px-2 py-0.5 rounded border border-border">
                          {opt.type === "color"
                            ? "رنگ"
                            : opt.type === "size"
                            ? "سایز"
                            : "سفارشی"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(opt.id)}
                        className="text-error hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Values Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {opt.values.map((v) => (
                        <span
                          key={v.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-background border border-border text-foreground font-semibold text-xs"
                        >
                          {opt.type === "color" && (
                            <span
                              className="w-3 h-3 rounded-full border border-black/20"
                              style={{ backgroundColor: v.value }}
                            />
                          )}
                          <span>{v.label}</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveValueFromOption(opt.id, v.id)
                            }
                            className="text-muted-foreground hover:text-error"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          setActiveOptionIdForValue(opt.id);
                          setModalType("value");
                        }}
                        className="h-7 px-2.5 rounded bg-primary/10 text-primary font-bold hover:bg-primary/20 text-[11px] flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>افزودن مقدار (Value)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 4: VARIANT COMBINATION GENERATOR */}
      <div className="bg-background border border-border rounded-md overflow-hidden">
        <button
          onClick={() => toggleSection("variants")}
          className="w-full flex items-center justify-between p-4 bg-surface-subtle border-b border-border text-right"
        >
          <div className="flex items-center gap-2 font-bold text-sm text-foreground">
            <Layers className="w-4 h-4 text-primary" />
            <span>ساخت و مدیریت سریع Variantها</span>
          </div>
          {openSections.variants ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {openSections.variants && (
          <div className="p-4 space-y-4 text-xs">
            {/* Defaults Configuration Box */}
            <div className="bg-surface-subtle p-3.5 rounded-md border border-border space-y-3">
              <span className="font-bold text-foreground block">
                مقادیر پیش‌فرض برای تولید خودکار واریانت‌ها:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1 font-medium">
                    قیمت پیش‌فرض (تومان)
                  </label>
                  <input
                    type="number"
                    value={defaultPrice}
                    onChange={(e) => setDefaultPrice(Number(e.target.value))}
                    className="w-full h-9 px-2.5 bg-background border border-border rounded font-bold text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1 font-medium">
                    قیمت قبل تخفیف
                  </label>
                  <input
                    type="number"
                    value={defaultCompareAtPrice || ""}
                    onChange={(e) =>
                      setDefaultCompareAtPrice(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    placeholder="اختیاری"
                    className="w-full h-9 px-2.5 bg-background border border-border rounded font-bold text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1 font-medium">
                    موجودی پیش‌فرض
                  </label>
                  <input
                    type="number"
                    value={defaultStock}
                    onChange={(e) => setDefaultStock(Number(e.target.value))}
                    className="w-full h-9 px-2.5 bg-background border border-border rounded font-bold text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1 font-medium">
                    پیشوند شناسه (SKU Prefix)
                  </label>
                  <input
                    type="text"
                    value={skuPrefix}
                    onChange={(e) => setSkuPrefix(e.target.value.toUpperCase())}
                    className="w-full h-9 px-2.5 bg-background border border-border rounded font-mono font-bold text-foreground"
                  />
                </div>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={handleGenerateCombinations}
                  className="inline-flex items-center justify-center gap-2 h-10 px-5 text-xs font-bold rounded-md bg-primary text-primary-foreground hover:bg-primary-hover shadow-xs transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>تولید تمام ترکیب‌های واریانت (Combination Generator)</span>
                </button>
              </div>
            </div>

            {/* Variants Table / Spreadsheet */}
            {variants.length > 0 && (
              <div className="space-y-3 pt-2">
                {/* Bulk Action Bar for Variants */}
                <div className="p-2.5 bg-surface-subtle border border-border rounded-md flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleSelectAllVariants}
                      className="flex items-center gap-1 font-bold text-foreground"
                    >
                      {selectedVariantIds.length === variants.length ? (
                        <CheckSquare className="w-4 h-4 text-primary" />
                      ) : (
                        <Square className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span>
                        انتخاب همه ({selectedVariantIds.length} از {variants.length})
                      </span>
                    </button>
                  </div>

                  {selectedVariantIds.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          placeholder="قیمت گروهی"
                          value={bulkPriceInput || ""}
                          onChange={(e) => setBulkPriceInput(Number(e.target.value))}
                          className="w-24 h-8 px-2 bg-background border border-border rounded text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={handleApplyBulkVariantPrice}
                          className="h-8 px-2.5 bg-primary text-primary-foreground font-bold rounded text-[11px]"
                        >
                          اعمال قیمت
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          placeholder="موجودی"
                          value={bulkStockInput || ""}
                          onChange={(e) => setBulkStockInput(Number(e.target.value))}
                          className="w-20 h-8 px-2 bg-background border border-border rounded text-[11px]"
                        />
                        <button
                          type="button"
                          onClick={handleApplyBulkVariantStock}
                          className="h-8 px-2.5 bg-primary text-primary-foreground font-bold rounded text-[11px]"
                        >
                          اعمال موجودی
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleApplyBulkDeleteVariants}
                        className="h-8 px-2.5 bg-error text-error-foreground font-bold rounded text-[11px]"
                      >
                        حذف انتخاب‌شده‌ها
                      </button>
                    </div>
                  )}
                </div>

                {/* Spreadsheet Table */}
                <div className="border border-border rounded-md overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-surface-subtle border-b border-border text-muted-foreground font-semibold">
                        <th className="py-2.5 px-3 w-8 text-center"></th>
                        <th className="py-2.5 px-3">ترکیب Options</th>
                        <th className="py-2.5 px-3">SKU</th>
                        <th className="py-2.5 px-3">قیمت (تومان)</th>
                        <th className="py-2.5 px-3">قیمت قبل تخفیف</th>
                        <th className="py-2.5 px-3">موجودی</th>
                        <th className="py-2.5 px-3">وضعیت</th>
                        <th className="py-2.5 px-3 text-left">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {variants.map((v) => {
                        const isSelected = selectedVariantIds.includes(v.id);
                        return (
                          <tr
                            key={v.id}
                            className={`hover:bg-surface-subtle/50 transition-colors ${
                              isSelected ? "bg-primary/5" : ""
                            }`}
                          >
                            <td className="py-2 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleSelectVariant(v.id)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-primary" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </button>
                            </td>

                            <td className="py-2 px-3 font-bold text-foreground">
                              {getVariantCombinationText(v)}
                            </td>

                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={v.sku || ""}
                                onChange={(e) =>
                                  handleUpdateVariantInTable(
                                    v.id,
                                    "sku",
                                    e.target.value
                                  )
                                }
                                className="w-28 h-8 px-2 bg-surface-subtle border border-border rounded font-mono text-[11px] dir-ltr text-right"
                              />
                            </td>

                            <td className="py-2 px-3">
                              <input
                                type="number"
                                value={v.pricing?.price ?? defaultPrice}
                                onChange={(e) =>
                                  handleUpdateVariantInTable(
                                    v.id,
                                    "price",
                                    e.target.value
                                  )
                                }
                                className="w-24 h-8 px-2 bg-surface-subtle border border-border rounded font-bold text-foreground"
                              />
                            </td>

                            <td className="py-2 px-3">
                              <input
                                type="number"
                                value={v.pricing?.compareAtPrice || ""}
                                onChange={(e) =>
                                  handleUpdateVariantInTable(
                                    v.id,
                                    "compareAtPrice",
                                    e.target.value
                                  )
                                }
                                placeholder="اختیاری"
                                className="w-24 h-8 px-2 bg-surface-subtle border border-border rounded text-muted-foreground"
                              />
                            </td>

                            <td className="py-2 px-3">
                              <input
                                type="number"
                                value={v.inventory?.stock ?? defaultStock}
                                onChange={(e) =>
                                  handleUpdateVariantInTable(
                                    v.id,
                                    "stock",
                                    e.target.value
                                  )
                                }
                                className="w-16 h-8 px-2 bg-surface-subtle border border-border rounded font-bold text-foreground"
                              />
                            </td>

                            <td className="py-2 px-3">
                              <select
                                value={v.status || "active"}
                                onChange={(e) =>
                                  handleUpdateVariantInTable(
                                    v.id,
                                    "status",
                                    e.target.value
                                  )
                                }
                                className="h-8 px-2 bg-surface-subtle border border-border rounded font-medium text-[11px]"
                              >
                                <option value="active">فعال</option>
                                <option value="inactive">غیرفعال</option>
                              </select>
                            </td>

                            <td className="py-2 px-3 text-left">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleDuplicateVariantInTable(v)}
                                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-surface-subtle"
                                  title="تکثیر"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteVariantInTable(v.id)}
                                  className="p-1 rounded text-muted-foreground hover:text-error hover:bg-error/10"
                                  title="حذف"
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
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 5: SPECIFICATIONS */}
      <div className="bg-background border border-border rounded-md overflow-hidden">
        <button
          onClick={() => toggleSection("specs")}
          className="w-full flex items-center justify-between p-4 bg-surface-subtle border-b border-border text-right"
        >
          <div className="flex items-center gap-2 font-bold text-sm text-foreground">
            <Tag className="w-4 h-4 text-primary" />
            <span>ویژگی‌های ساختاریافته (Specifications)</span>
          </div>
          {openSections.specs ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {openSections.specs && (
          <div className="p-4 space-y-3 text-xs">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="عنوان ویژگی (مثلاً: جنس آستر)"
                value={newSpecLabel}
                onChange={(e) => setNewSpecLabel(e.target.value)}
                className="flex-1 h-9 px-3 bg-surface-subtle border border-border rounded-md text-foreground"
              />
              <input
                type="text"
                placeholder="مقدار (مثلاً: پلی‌استر)"
                value={newSpecValue}
                onChange={(e) => setNewSpecValue(e.target.value)}
                className="flex-1 h-9 px-3 bg-surface-subtle border border-border rounded-md text-foreground"
              />
              <button
                type="button"
                onClick={handleAddSpecification}
                className="h-9 px-4 bg-primary text-primary-foreground font-bold rounded-md hover:bg-primary-hover shrink-0"
              >
                افزودن ویژگی
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              {specifications.map((spec, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-surface-subtle border border-border rounded-md"
                >
                  <div>
                    <span className="font-bold text-foreground">{spec.label}: </span>
                    <span className="text-muted-foreground">{spec.value}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSpecification(idx)}
                    className="text-muted-foreground hover:text-error p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 6: PUBLICATION STATUS & STICKY FOOTER */}
      <div className="bg-background border border-border rounded-md p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-foreground">وضعیت انتشار:</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProductStatus)}
            className="h-9 px-3 bg-surface-subtle border border-border rounded-md font-bold text-foreground"
          >
            <option value="active">منتشرشده</option>
            <option value="draft">پیش‌نویس</option>
            <option value="archived">آرشیو شده</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products"
            className="h-10 px-4 flex items-center justify-center font-bold text-muted-foreground hover:text-foreground"
          >
            انصراف
          </Link>
          <button
            type="button"
            onClick={() => handleSaveProduct(status)}
            className="h-10 px-6 font-bold bg-primary text-primary-foreground hover:bg-primary-hover rounded-md shadow-xs transition-colors"
          >
            ذخیره محصول
          </button>
        </div>
      </div>

      {/* QUICK MODALS */}
      {/* Category Quick Create Modal */}
      {modalType === "category" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setModalType(null)}
          />
          <div className="relative bg-background border border-border rounded-xl p-5 w-full max-w-xs space-y-3 z-10 text-xs">
            <h3 className="font-bold text-sm text-foreground">دسته‌بندی جدید</h3>
            <input
              type="text"
              placeholder="نام دسته‌بندی..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="w-full h-9 px-3 bg-surface-subtle border border-border rounded text-foreground"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="h-8 px-3 rounded bg-surface-subtle font-bold"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleCreateCategory}
                className="h-8 px-4 rounded bg-primary text-primary-foreground font-bold"
              >
                ایجاد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brand Quick Create Modal */}
      {modalType === "brand" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setModalType(null)}
          />
          <div className="relative bg-background border border-border rounded-xl p-5 w-full max-w-xs space-y-3 z-10 text-xs">
            <h3 className="font-bold text-sm text-foreground">برند جدید</h3>
            <input
              type="text"
              placeholder="نام برند..."
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              className="w-full h-9 px-3 bg-surface-subtle border border-border rounded text-foreground"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="h-8 px-3 rounded bg-surface-subtle font-bold"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleCreateBrand}
                className="h-8 px-4 rounded bg-primary text-primary-foreground font-bold"
              >
                ایجاد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Option Custom Create Modal */}
      {modalType === "option" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setModalType(null)}
          />
          <div className="relative bg-background border border-border rounded-xl p-5 w-full max-w-xs space-y-3 z-10 text-xs">
            <h3 className="font-bold text-sm text-foreground">آپشن سفارشی جدید</h3>
            <input
              type="text"
              placeholder="مثلاً: جنس، نوع یقه..."
              value={newOptionName}
              onChange={(e) => setNewOptionName(e.target.value)}
              className="w-full h-9 px-3 bg-surface-subtle border border-border rounded text-foreground"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="h-8 px-3 rounded bg-surface-subtle font-bold"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleCreateCustomOption}
                className="h-8 px-4 rounded bg-primary text-primary-foreground font-bold"
              >
                ایجاد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Value Create Modal */}
      {modalType === "value" && activeOptionIdForValue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => {
              setModalType(null);
              setActiveOptionIdForValue(null);
            }}
          />
          <div className="relative bg-background border border-border rounded-xl p-5 w-full max-w-xs space-y-3 z-10 text-xs">
            <h3 className="font-bold text-sm text-foreground">افزودن مقدار جدید</h3>
            <input
              type="text"
              placeholder="عنوان مقدار (مثلاً: قرمز، L)"
              value={newValueLabel}
              onChange={(e) => setNewValueLabel(e.target.value)}
              className="w-full h-9 px-3 bg-surface-subtle border border-border rounded text-foreground"
            />
            {options.find((o) => o.id === activeOptionIdForValue)?.type === "color" && (
              <div className="flex items-center gap-2">
                <label className="font-bold text-foreground">کد رنگ:</label>
                <input
                  type="color"
                  value={newValueColor}
                  onChange={(e) => setNewValueColor(e.target.value)}
                  className="w-8 h-8 rounded border border-border cursor-pointer"
                />
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setModalType(null);
                  setActiveOptionIdForValue(null);
                }}
                className="h-8 px-3 rounded bg-surface-subtle font-bold"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => handleAddValueToOption(activeOptionIdForValue)}
                className="h-8 px-4 rounded bg-primary text-primary-foreground font-bold"
              >
                افزودن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
