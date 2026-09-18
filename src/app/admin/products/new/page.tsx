"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Plus,
  Image as ImageIcon,
  Tag,
  FileText,
  ChevronDown,
  ChevronUp,
  Sliders,
  Trash2,
} from "lucide-react";

import { useProducts } from "@/context/ProductContext";
import {
  Product,
  ProductOption,
  ProductVariant,
  ProductStatus,
  ProductSpecification,
  ProductCategory,
  ProductBrand,
} from "@/types/product";
import { useToast } from "@/components/ui/Toast";
import { CreateCategoryModal } from "@/components/admin/CreateCategoryModal";
import { CreateBrandModal } from "@/components/admin/CreateBrandModal";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { ProductVariantBuilder } from "@/components/admin/ProductVariantBuilder";
import { SizeGuideSection } from "@/components/admin/sizeguide/SizeGuideSection";
import { SizeGuide } from "@/types/product";

export default function AddProductPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { categories, brands, addProduct } = useProducts();

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

  // Product Options & Variants State
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Size Guide State
  const [sizeGuide, setSizeGuide] = useState<SizeGuide | null>(null);

  // Specifications State
  const [specifications, setSpecifications] = useState<ProductSpecification[]>([
    { label: "جنس رویه", value: "چرم مصنوعی اعلا" },
    { label: "کشور سازنده", value: "ایران" },
  ]);
  const [newSpecLabel, setNewSpecLabel] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");

  // Modals state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);

  // Accordion Toggles
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    basic: true,
    images: true,
    variants: true,
    sizeguide: true,
    specs: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
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
        ? Math.min(...variants.map((v) => v.pricing?.price ?? defaultPrice))
        : defaultPrice;

    const maxPrice =
      variants.length > 0
        ? Math.max(...variants.map((v) => v.pricing?.price ?? defaultPrice))
        : defaultPrice;

    const totalStock =
      variants.length > 0
        ? variants.reduce((sum, v) => sum + (v.inventory?.stock ?? 0), 0)
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
      sizeGuide: sizeGuide || undefined,
      tags: tagsArr,
      status: targetStatus || status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addProduct(newProduct);
    showToast(`محصول «${newProduct.title}» با موفقیت ثبت شد.`, "success");
    router.push("/admin/products");
  };

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto text-xs">
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
            className="h-9 px-3.5 text-xs font-semibold rounded-lg bg-surface-subtle border border-border hover:bg-surface-muted text-foreground transition-colors"
          >
            ذخیره پیش‌نویس
          </button>
          <button
            onClick={() => handleSaveProduct("active")}
            className="h-9 px-4 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover transition-colors shadow-xs"
          >
            انتشار محصول
          </button>
        </div>
      </div>

      {/* SECTION 1: BASIC INFORMATION */}
      <div className="bg-background border border-border rounded-xl overflow-hidden shadow-xs">
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
          <div className="p-4 space-y-4">
            <div>
              <label className="block font-bold text-foreground mb-1">
                عنوان محصول *
              </label>
              <input
                type="text"
                placeholder="مثلاً: کیف دستی چرم کلاسیک مدل آرتیمیس"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 px-3.5 bg-surface-subtle border border-border/80 rounded-lg text-foreground focus:outline-none focus:border-primary text-xs font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category Select + Quick Create Modal Trigger */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-foreground">دسته‌بندی *</label>
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="text-[11px] text-primary font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>دسته‌بندی جدید</span>
                  </button>
                </div>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-subtle border border-border/80 rounded-lg text-foreground focus:outline-none focus:border-primary font-medium"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand Select + Quick Create Modal Trigger */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-foreground">برند *</label>
                  <button
                    type="button"
                    onClick={() => setIsBrandModalOpen(true)}
                    className="text-[11px] text-primary font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>برند جدید</span>
                  </button>
                </div>
                <select
                  value={selectedBrandId}
                  onChange={(e) => setSelectedBrandId(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-subtle border border-border/80 rounded-lg text-foreground focus:outline-none focus:border-primary font-medium"
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
                className="w-full p-3 bg-surface-subtle border border-border/80 rounded-lg text-foreground focus:outline-none focus:border-primary text-xs font-medium"
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
                className="w-full h-10 px-3 bg-surface-subtle border border-border/80 rounded-lg text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: IMAGES WITH SHARED IMAGEPICKER */}
      <div className="bg-background border border-border rounded-xl overflow-hidden shadow-xs">
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
          <div className="p-4">
            <ImagePicker
              multiple={true}
              value={images}
              onChange={setImages}
              label="آپلود یا انتخاب تصاویر محصول"
              required
            />
          </div>
        )}
      </div>

      {/* SECTION 3: REUSABLE VARIANT BUILDER */}
      <div className="bg-background border border-border rounded-xl overflow-hidden shadow-xs">
        <button
          onClick={() => toggleSection("variants")}
          className="w-full flex items-center justify-between p-4 bg-surface-subtle border-b border-border text-right"
        >
          <div className="flex items-center gap-2 font-bold text-sm text-foreground">
            <Sliders className="w-4 h-4 text-primary" />
            <span>ساخت و مدیریت واریانت‌ها (Variant Builder)</span>
          </div>
          {openSections.variants ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {openSections.variants && (
          <div className="p-4 space-y-4">
            {/* Default values config */}
            <div className="p-3 bg-surface-subtle border border-border rounded-xl space-y-2">
              <span className="font-bold text-foreground text-[11px] block">
                تنظیمات پیش‌فرض واریانت‌های جدید:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1 font-medium text-[11px]">
                    قیمت پیش‌فرض (تومان)
                  </label>
                  <input
                    type="number"
                    value={defaultPrice}
                    onChange={(e) => setDefaultPrice(Number(e.target.value))}
                    className="w-full h-9 px-2.5 bg-background border border-border rounded-lg font-bold text-foreground text-xs"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1 font-medium text-[11px]">
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
                    className="w-full h-9 px-2.5 bg-background border border-border rounded-lg font-bold text-foreground text-xs"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1 font-medium text-[11px]">
                    موجودی پیش‌فرض
                  </label>
                  <input
                    type="number"
                    value={defaultStock}
                    onChange={(e) => setDefaultStock(Number(e.target.value))}
                    className="w-full h-9 px-2.5 bg-background border border-border rounded-lg font-bold text-foreground text-xs"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1 font-medium text-[11px]">
                    پیشوند SKU
                  </label>
                  <input
                    type="text"
                    value={skuPrefix}
                    onChange={(e) => setSkuPrefix(e.target.value.toUpperCase())}
                    className="w-full h-9 px-2.5 bg-background border border-border rounded-lg font-mono font-bold text-foreground text-xs"
                  />
                </div>
              </div>
            </div>

            <ProductVariantBuilder
              options={options}
              setOptions={setOptions}
              variants={variants}
              setVariants={setVariants}
              defaultPrice={defaultPrice}
              defaultCompareAtPrice={defaultCompareAtPrice}
              defaultStock={defaultStock}
              skuPrefix={skuPrefix}
            />
          </div>
        )}
      </div>

      {/* SECTION 4: SIZE GUIDE */}
      <SizeGuideSection
        sizeGuide={sizeGuide}
        onChange={setSizeGuide}
        isOpen={openSections.sizeguide}
        onToggle={() => toggleSection("sizeguide")}
      />

      {/* SECTION 5: SPECIFICATIONS */}
      <div className="bg-background border border-border rounded-xl overflow-hidden shadow-xs">
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
          <div className="p-4 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="عنوان ویژگی (مثلاً: جنس آستر)"
                value={newSpecLabel}
                onChange={(e) => setNewSpecLabel(e.target.value)}
                className="flex-1 h-9 px-3 bg-surface-subtle border border-border rounded-lg text-foreground text-xs"
              />
              <input
                type="text"
                placeholder="مقدار (مثلاً: پلی‌استر)"
                value={newSpecValue}
                onChange={(e) => setNewSpecValue(e.target.value)}
                className="flex-1 h-9 px-3 bg-surface-subtle border border-border rounded-lg text-foreground text-xs"
              />
              <button
                type="button"
                onClick={handleAddSpecification}
                className="h-9 px-4 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary-hover shrink-0 text-xs"
              >
                افزودن ویژگی
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              {specifications.map((spec, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-surface-subtle border border-border rounded-lg"
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

      {/* SECTION 5: PUBLICATION STATUS & FOOTER */}
      <div className="bg-background border border-border rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-foreground">وضعیت انتشار:</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProductStatus)}
            className="h-9 px-3 bg-surface-subtle border border-border rounded-lg font-bold text-foreground text-xs"
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
            className="h-10 px-6 font-bold bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg shadow-xs transition-colors"
          >
            ثبت محصول
          </button>
        </div>
      </div>

      {/* QUICK CREATION MODALS */}
      <CreateCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSuccess={(newCat: ProductCategory) => {
          setSelectedCategoryId(newCat.id);
        }}
      />

      <CreateBrandModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        onSuccess={(newBrand: ProductBrand) => {
          setSelectedBrandId(newBrand.id);
        }}
      />
    </div>
  );
}
