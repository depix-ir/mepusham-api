"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowRight,
  Plus,
  Image as ImageIcon,
  Tag,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
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
import { normalizeSizeGuide } from "@/lib/sizeguide/sizeGuideService";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const { showToast } = useToast();
  const { products, categories, brands, isLoaded, updateProduct } = useProducts();

  // Target product
  const targetProduct = products.find((p) => p.id === productId);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [status, setStatus] = useState<ProductStatus>("active");

  const [defaultPrice, setDefaultPrice] = useState<number>(1500000);
  const [defaultCompareAtPrice, setDefaultCompareAtPrice] = useState<number | undefined>(
    1800000
  );
  const [defaultStock, setDefaultStock] = useState<number>(10);
  const [skuPrefix, setSkuPrefix] = useState<string>("PROD");

  const [images, setImages] = useState<string[]>([]);
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  const [sizeGuide, setSizeGuide] = useState<SizeGuide | null>(null);

  const [specifications, setSpecifications] = useState<ProductSpecification[]>([]);
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

  // Pre-fill form when product loaded
  useEffect(() => {
    if (targetProduct) {
      setTitle(targetProduct.title);
      setDescription(targetProduct.description || "");
      setSelectedCategoryId(targetProduct.category?.id || categories[0]?.id || "");
      setSelectedBrandId(targetProduct.brand?.id || brands[0]?.id || "");
      setTagsInput(targetProduct.tags ? targetProduct.tags.join(", ") : "");
      setStatus(targetProduct.status);
      setDefaultPrice(targetProduct.pricing.minPrice);
      setDefaultCompareAtPrice(targetProduct.pricing.minCompareAtPrice);
      setDefaultStock(targetProduct.inventory.totalStock);
      setImages(targetProduct.images.map((img) => img.url));
      setOptions(targetProduct.options || []);
      setVariants(targetProduct.variants || []);
      setSpecifications(targetProduct.specifications || []);
      setSizeGuide(normalizeSizeGuide(targetProduct.sizeGuide));
    }
  }, [targetProduct, categories, brands]);

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-muted-foreground font-medium">
          در حال بارگذاری اطلاعات محصول...
        </p>
      </div>
    );
  }

  if (!targetProduct) {
    return (
      <div className="bg-background border border-border rounded-xl p-12 text-center flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto mt-8 shadow-xs">
        <AlertTriangle className="w-10 h-10 text-amber-500" />
        <h2 className="text-base font-bold text-foreground">محصول یافت نشد!</h2>
        <p className="text-xs text-muted-foreground">
          محصولی با کد «{productId}» وجود ندارد یا ممکن است حذف شده باشد.
        </p>
        <Link
          href="/admin/products"
          className="h-9 px-4 inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary-hover"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به فهرست محصولات</span>
        </Link>
      </div>
    );
  }

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

  // Save Updates Handler
  const handleSaveProduct = (targetStatus?: ProductStatus) => {
    if (!title.trim()) {
      showToast("لطفاً عنوان محصول را وارد کنید.", "warning");
      return;
    }

    const catObj =
      categories.find((c) => c.id === selectedCategoryId) || targetProduct.category;
    const brandObj =
      brands.find((b) => b.id === selectedBrandId) || targetProduct.brand;

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

    updateProduct(targetProduct.id, {
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
    });

    showToast(`تغییرات محصول «${title.trim()}» با موفقیت ذخیره شد.`, "success");
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
            <span className="text-foreground font-semibold">ویرایش محصول</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
            ویرایش «{targetProduct.title}»
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
            onClick={() => handleSaveProduct(status)}
            className="h-9 px-4 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover transition-colors shadow-xs"
          >
            ذخیره تغییرات
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 px-3.5 bg-surface-subtle border border-border/80 rounded-lg text-foreground focus:outline-none focus:border-primary text-xs font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category Select + Quick Create Modal */}
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

              {/* Brand Select + Quick Create Modal */}
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
            <span>مدیریت واریانت‌ها (Variant Builder)</span>
          </div>
          {openSections.variants ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {openSections.variants && (
          <div className="p-4 space-y-4">
            {/* Defaults config */}
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
                placeholder="عنوان ویژگی"
                value={newSpecLabel}
                onChange={(e) => setNewSpecLabel(e.target.value)}
                className="flex-1 h-9 px-3 bg-surface-subtle border border-border rounded-lg text-foreground text-xs"
              />
              <input
                type="text"
                placeholder="مقدار"
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
            ذخیره تغییرات
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
