import {
  ProductOption,
  ProductOptionValue,
  ProductVariant,
  ProductVariantOptionValue,
  ProductVariantStatus,
} from "@/types/product";

export interface ColorSelection {
  id: string;
  label: string;
  hex: string;
  sizes: string[]; // List of size labels selected for this color
}

export interface VariantGeneratorDefaults {
  defaultPrice: number;
  defaultCompareAtPrice?: number;
  defaultStock: number;
  skuPrefix?: string;
}

/**
 * Creates a deterministic unique key for a set of option values
 */
export function getCombinationKey(optionValues: ProductVariantOptionValue[]): string {
  return [...optionValues]
    .sort((a, b) => a.optionId.localeCompare(b.optionId))
    .map((ov) => `${ov.optionId}:${ov.valueId}`)
    .join("|");
}

/**
 * Pure deterministic function to generate live variant combinations
 * preserving existing variant data (stock, price, SKU, etc.)
 */
export function generateLiveVariants(
  colorOption: ProductOption | null,
  sizeOption: ProductOption | null,
  colorSelections: ColorSelection[],
  existingVariants: ProductVariant[],
  defaults: VariantGeneratorDefaults
): ProductVariant[] {
  if (!colorOption || colorSelections.length === 0) {
    return existingVariants.map((v) => ({ ...v }));
  }

  const skuPrefix = defaults.skuPrefix || "PROD";

  // Build key map for fast lookup of existing variants
  const existingMap = new Map<string, ProductVariant>();
  for (const v of existingVariants) {
    const key = getCombinationKey(v.optionValues);
    existingMap.set(key, v);
  }

  const newVariants: ProductVariant[] = [];
  const activeKeys = new Set<string>();

  colorSelections.forEach((colorSel) => {
    // Find matching color option value ID
    const colorValObj = colorOption.values.find(
      (v) => v.label.trim().toLowerCase() === colorSel.label.trim().toLowerCase()
    );
    if (!colorValObj) return;

    const sizesForColor = colorSel.sizes;

    if (!sizeOption || sizesForColor.length === 0) {
      // Single dimension (Color only)
      const optionValues: ProductVariantOptionValue[] = [
        { optionId: colorOption.id, valueId: colorValObj.id },
      ];
      const combKey = getCombinationKey(optionValues);
      activeKeys.add(combKey);

      if (existingMap.has(combKey)) {
        const existing = existingMap.get(combKey)!;
        newVariants.push({ ...existing, status: "active" as ProductVariantStatus });
      } else {
        const skuCode = colorValObj.label.toUpperCase().replace(/\s+/g, "");
        newVariants.push({
          id: `var-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          sku: `${skuPrefix}-${skuCode}`,
          optionValues,
          pricing: {
            price: defaults.defaultPrice,
            compareAtPrice: defaults.defaultCompareAtPrice,
          },
          inventory: {
            stock: defaults.defaultStock,
            trackStock: true,
          },
          status: "active",
        });
      }
    } else {
      // Multi dimension (Color × Size)
      sizesForColor.forEach((sizeLabel) => {
        const sizeValObj = sizeOption.values.find(
          (v) => v.label.trim().toLowerCase() === sizeLabel.trim().toLowerCase()
        );
        if (!sizeValObj) return;

        const optionValues: ProductVariantOptionValue[] = [
          { optionId: colorOption.id, valueId: colorValObj.id },
          { optionId: sizeOption.id, valueId: sizeValObj.id },
        ];
        const combKey = getCombinationKey(optionValues);
        activeKeys.add(combKey);

        if (existingMap.has(combKey)) {
          const existing = existingMap.get(combKey)!;
          newVariants.push({ ...existing, status: "active" as ProductVariantStatus });
        } else {
          const colorCode = colorValObj.label.toUpperCase().replace(/\s+/g, "");
          const sizeCode = sizeValObj.label.toUpperCase().replace(/\s+/g, "");
          newVariants.push({
            id: `var-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            sku: `${skuPrefix}-${colorCode}-${sizeCode}`,
            optionValues,
            pricing: {
              price: defaults.defaultPrice,
              compareAtPrice: defaults.defaultCompareAtPrice,
            },
            inventory: {
              stock: defaults.defaultStock,
              trackStock: true,
            },
            status: "active",
          });
        }
      });
    }
  });

  // Preserve existing variants that were unselected by marking them as inactive instead of deleting
  existingVariants.forEach((existing) => {
    const key = getCombinationKey(existing.optionValues);
    if (!activeKeys.has(key)) {
      newVariants.push({
        ...existing,
        status: "inactive",
      });
    }
  });

  return newVariants;
}

/**
 * Validates whether modifying a variant's attributes creates a duplicate collision
 */
export function checkVariantCollision(
  variantId: string,
  newOptionValues: ProductVariantOptionValue[],
  allVariants: ProductVariant[]
): boolean {
  const targetKey = getCombinationKey(newOptionValues);
  return allVariants.some(
    (v) => v.id !== variantId && getCombinationKey(v.optionValues) === targetKey
  );
}
