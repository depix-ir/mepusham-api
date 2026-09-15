import { Product, ProductVariant, ProductOption, ProductStatus } from "@/types/product";

export type InventoryStatus = "in-stock" | "low-stock" | "out-of-stock";

export interface VariantInventoryItem {
  variantId: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  productImage?: string;
  categoryName: string;
  brandName?: string;
  productStatus: ProductStatus;
  sku: string;
  stock: number;
  reservedStock: number;
  availableStock: number;
  isActive: boolean;
  lowStockThreshold: number;
  inventoryStatus: InventoryStatus;
  price: number;
  compareAtPrice?: number;
  optionCombinations: Array<{
    optionId: string;
    optionName: string;
    valueId: string;
    valueLabel: string;
  }>;
  displayVariantName: string; // e.g., "سفید / M"
  updatedAt: string;
  parentProduct: Product;
  rawVariant: ProductVariant;
}

export interface InventorySummaryStats {
  totalVariants: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  inactiveCount: number;
  attentionCount: number; // low-stock + out-of-stock + inactive
}

export interface InventoryHistoryLog {
  id: string;
  timestamp: string;
  productId: string;
  productTitle: string;
  variantId: string;
  variantDisplay: string;
  sku?: string;
  previousStock: number;
  changeAmount: number;
  newStock: number;
  reason: string;
  actor: string;
}
