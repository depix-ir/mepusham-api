export type ProductStatus = "active" | "draft" | "archived";

export type ProductBrand = {
  id: string;
  name: string;
  slug: string;
  logo?: string;
};

export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
};

export type ProductImage = {
  id: string;
  url: string;
  alt?: string;
  sortOrder: number;
};

export type ProductOptionType =
  | "color"
  | "size"
  | "material"
  | "style"
  | "pattern"
  | "capacity"
  | "length"
  | "weight"
  | "custom";

export type ProductOptionValue = {
  id: string;
  label: string;
  value: string;
  metadata?: Record<string, unknown>;
  sortOrder: number;
};

export type ProductOption = {
  id: string;
  name: string;
  type: ProductOptionType;
  values: ProductOptionValue[];
  required: boolean;
  sortOrder: number;
};

export type ProductVariantOptionValue = {
  optionId: string;
  valueId: string;
};

export type ProductVariantPricing = {
  price: number;
  compareAtPrice?: number;
  discountPercent?: number;
};

export type ProductVariantInventory = {
  stock: number;
  trackStock: boolean;
  allowBackorder?: boolean;
};

export type ProductVariantStatus = "active" | "inactive";

export type ProductVariant = {
  id: string;
  sku?: string;
  optionValues: ProductVariantOptionValue[];
  pricing: ProductVariantPricing;
  inventory: ProductVariantInventory;
  imageIds?: string[];
  status: ProductVariantStatus;
};

export type ProductPricing = {
  minPrice: number;
  maxPrice?: number;
  minCompareAtPrice?: number;
  hasDiscount: boolean;
};

export type ProductInventory = {
  totalStock: number;
  trackStock: boolean;
  hasAvailableVariants: boolean;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  brand?: ProductBrand;
  category: ProductCategory;
  images: ProductImage[];
  options: ProductOption[];
  variants: ProductVariant[];
  pricing: ProductPricing;
  inventory: ProductInventory;
  tags?: string[];
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
};

export type Banner = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl: string;
  buttonText?: string;
};
