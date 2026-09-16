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
  imageUrl?: string;
  parentId?: string;
  isActive?: boolean;
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
  discountPercent?: number;
  hasDiscount: boolean;
};

export type ProductInventory = {
  totalStock: number;
  trackStock: boolean;
  hasAvailableVariants: boolean;
};

export type ProductReview = {
  id: string;
  authorName: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
  storeResponse?: {
    author: string;
    date: string;
    text: string;
  };
  aspects?: {
    fit?: "small" | "true_to_size" | "large";
    quality?: number;
    comfort?: number;
  };
};

export type ProductRating = {
  average: number;
  count: number;
  starDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
};

export type SizeGuideCategory = "clothing" | "footwear" | "pants" | "accessories" | "none";

export type SizeGuideRow = Record<string, string>;

export type SizeGuideData = {
  type: SizeGuideCategory;
  title: string;
  description?: string;
  columns: { key: string; label: string }[];
  rows: SizeGuideRow[];
};

export type ProductSpecification = {
  label: string;
  value: string;
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
  rating?: ProductRating;
  reviews?: ProductReview[];
  specifications?: ProductSpecification[];
  careInstructions?: string[];
  sizeGuide?: SizeGuideData;
  shippingReturns?: string;
};

export type Banner = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  desktopImageUrl?: string;
  mobileImageUrl?: string;
  linkUrl: string;
  buttonText?: string;
};

export interface ProductQueryFilter {
  category?: string;
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  hasDiscount?: boolean;
  q?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "discount" | string;
}

export interface PaginatedProductsResponse {
  items: Product[];
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
}
