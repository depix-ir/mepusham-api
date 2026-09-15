import { Product, ProductVariant, ProductOption } from "@/types/product";
import {
  VariantInventoryItem,
  InventoryStatus,
  InventorySummaryStats,
  InventoryHistoryLog,
} from "./inventoryTypes";

const HISTORY_STORAGE_KEY = "mepusham_inventory_history_v1";
const DEFAULT_LOW_STOCK_THRESHOLD = 5;

/**
 * Derives the inventory status based on stock level and threshold.
 */
export function calculateInventoryStatus(
  stock: number,
  threshold: number = DEFAULT_LOW_STOCK_THRESHOLD
): InventoryStatus {
  if (stock <= 0) return "out-of-stock";
  if (stock <= threshold) return "low-stock";
  return "in-stock";
}

/**
 * Builds a human-readable display string for variant option values (e.g. "سفید / M").
 */
export function getVariantDisplayString(product: Product, variant: ProductVariant): string {
  if (!variant.optionValues || variant.optionValues.length === 0) {
    return "پیش‌فرض";
  }
  return variant.optionValues
    .map((ov) => {
      const opt = product.options.find((o) => o.id === ov.optionId);
      const valObj = opt?.values.find((v) => v.id === ov.valueId);
      return valObj ? valObj.label : ov.valueId;
    })
    .join(" / ");
}

/**
 * Transforms all products into a flat array of variant inventory items.
 */
export function getVariantInventoryItems(products: Product[]): VariantInventoryItem[] {
  const items: VariantInventoryItem[] = [];

  for (const product of products) {
    const mainImage = product.images?.[0]?.url || "/images/bag-1.webp";

    // If product has variants, map each variant
    if (product.variants && product.variants.length > 0) {
      for (const variant of product.variants) {
        const stock = variant.inventory?.stock ?? 0;
        const reservedStock = 0; // extendable for future reserved stock
        const availableStock = Math.max(0, stock - reservedStock);
        const isActive = variant.status === "active";
        const threshold = DEFAULT_LOW_STOCK_THRESHOLD;
        const status = calculateInventoryStatus(stock, threshold);

        const optionCombinations = (variant.optionValues || []).map((ov) => {
          const opt = product.options.find((o) => o.id === ov.optionId);
          const valObj = opt?.values.find((v) => v.id === ov.valueId);
          return {
            optionId: ov.optionId,
            optionName: opt?.name || "ویژگی",
            valueId: ov.valueId,
            valueLabel: valObj?.label || ov.valueId,
          };
        });

        const displayVariantName = getVariantDisplayString(product, variant);

        items.push({
          variantId: variant.id,
          productId: product.id,
          productTitle: product.title,
          productSlug: product.slug,
          productImage: mainImage,
          categoryName: product.category?.name || "دسته‌بندی",
          brandName: product.brand?.name,
          productStatus: product.status,
          sku: variant.sku || `SKU-${variant.id.slice(0, 6)}`,
          stock,
          reservedStock,
          availableStock,
          isActive,
          lowStockThreshold: threshold,
          inventoryStatus: status,
          price: variant.pricing?.price ?? product.pricing?.minPrice ?? 0,
          compareAtPrice: variant.pricing?.compareAtPrice,
          optionCombinations,
          displayVariantName,
          updatedAt: product.updatedAt || new Date().toISOString(),
          parentProduct: product,
          rawVariant: variant,
        });
      }
    }
  }

  return items;
}

/**
 * Calculates summary statistics for the inventory page.
 */
export function calculateInventorySummary(items: VariantInventoryItem[]): InventorySummaryStats {
  let inStockCount = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  let inactiveCount = 0;

  for (const item of items) {
    if (!item.isActive) {
      inactiveCount++;
    }
    if (item.inventoryStatus === "out-of-stock") {
      outOfStockCount++;
    } else if (item.inventoryStatus === "low-stock") {
      lowStockCount++;
    } else {
      inStockCount++;
    }
  }

  // Actionable items: low-stock + out-of-stock + inactive
  const attentionCount = items.filter(
    (i) => i.inventoryStatus !== "in-stock" || !i.isActive
  ).length;

  return {
    totalVariants: items.length,
    inStockCount,
    lowStockCount,
    outOfStockCount,
    inactiveCount,
    attentionCount,
  };
}

/**
 * Validates whether an option combination already exists for a product.
 * Returns true if duplicate exists.
 */
export function isDuplicateVariant(
  product: Product,
  optionValues: Array<{ optionId: string; valueId: string }>,
  excludeVariantId?: string
): boolean {
  if (!product.variants || product.variants.length === 0) return false;

  // Normalize optionValues by sorting by optionId
  const targetKey = [...optionValues]
    .sort((a, b) => a.optionId.localeCompare(b.optionId))
    .map((ov) => `${ov.optionId}:${ov.valueId}`)
    .join("|");

  return product.variants.some((v) => {
    if (excludeVariantId && v.id === excludeVariantId) return false;
    const existingKey = [...(v.optionValues || [])]
      .sort((a, b) => a.optionId.localeCompare(b.optionId))
      .map((ov) => `${ov.optionId}:${ov.valueId}`)
      .join("|");
    return existingKey === targetKey;
  });
}

/**
 * Inventory History log functions.
 */
export function getInventoryHistoryLogs(): InventoryHistoryLog[] {
  if (typeof window === "undefined") return getInitialMockHistory();
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error reading inventory history log:", e);
  }
  return getInitialMockHistory();
}

export function addInventoryHistoryLog(
  log: Omit<InventoryHistoryLog, "id" | "timestamp">
): void {
  if (typeof window === "undefined") return;
  try {
    const logs = getInventoryHistoryLogs();
    const newLog: InventoryHistoryLog = {
      ...log,
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newLog, ...logs];
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Error saving inventory history log:", e);
  }
}

function getInitialMockHistory(): InventoryHistoryLog[] {
  const now = new Date();
  return [
    {
      id: "hist_1",
      timestamp: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
      productId: "prod_1",
      productTitle: "کت کیف دوشی رز",
      variantId: "v_1",
      variantDisplay: "مشکی / S",
      sku: "ROSE-BLK-S",
      previousStock: 5,
      changeAmount: 5,
      newStock: 10,
      reason: "ورود کالا",
      actor: "مدیر سیستم",
    },
    {
      id: "hist_2",
      timestamp: new Date(now.getTime() - 1000 * 60 * 120).toISOString(),
      productId: "prod_2",
      productTitle: "کفش چرم مجلسی",
      variantId: "v_2",
      variantDisplay: "عسلی / 38",
      sku: "SHO-HS-38",
      previousStock: 2,
      changeAmount: -1,
      newStock: 1,
      reason: "فروش آنلاین",
      actor: "سیستم",
    },
    {
      id: "hist_3",
      timestamp: new Date(now.getTime() - 1000 * 60 * 300).toISOString(),
      productId: "prod_3",
      productTitle: "شومیز لینن تابستانه",
      variantId: "v_3",
      variantDisplay: "سفید / L",
      sku: "SHOM-WHT-L",
      previousStock: 0,
      changeAmount: 12,
      newStock: 12,
      reason: "اصلاح دستی",
      actor: "مدیر سیستم",
    },
  ];
}
