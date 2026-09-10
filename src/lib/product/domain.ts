import { Product, ProductVariant } from "@/types/product";

/**
 * Finds a matching variant given a map of selected option IDs and value IDs.
 */
export function findVariant(
  product: Product,
  selectedOptions: Record<string, string>
): ProductVariant | null {
  const selectedEntries = Object.entries(selectedOptions);
  if (selectedEntries.length === 0) return null;

  return (
    product.variants.find((variant) => {
      if (variant.status !== "active") return false;
      return selectedEntries.every(([optId, valId]) =>
        variant.optionValues.some(
          (ov) => ov.optionId === optId && ov.valueId === valId
        )
      );
    }) || null
  );
}

/**
 * Checks if a variant is available for purchase.
 */
export function isVariantAvailable(variant: ProductVariant): boolean {
  if (variant.status !== "active") return false;
  if (!variant.inventory.trackStock) return true;
  return (
    variant.inventory.stock > 0 || Boolean(variant.inventory.allowBackorder)
  );
}

/**
 * Computes pricing and discount status for a product card presentation.
 */
export function getProductCardPricing(product: Product) {
  const activeVariants = product.variants.filter((v) => v.status === "active");

  if (activeVariants.length === 0) {
    return {
      price: product.pricing.minPrice,
      compareAtPrice: product.pricing.minCompareAtPrice,
      discountPercent: undefined,
      hasDiscount: product.pricing.hasDiscount,
    };
  }

  // Find lowest priced variant
  const cheapest = activeVariants.reduce((min, curr) =>
    curr.pricing.price < min.pricing.price ? curr : min
  , activeVariants[0]);

  return {
    price: cheapest.pricing.price,
    compareAtPrice: cheapest.pricing.compareAtPrice,
    discountPercent: cheapest.pricing.discountPercent,
    hasDiscount: Boolean(cheapest.pricing.compareAtPrice && cheapest.pricing.compareAtPrice > cheapest.pricing.price),
  };
}
