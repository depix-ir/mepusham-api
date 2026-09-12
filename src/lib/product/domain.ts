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

export type VariantSelectionDetails = {
  selectedVariant: ProductVariant | null;
  price: number;
  compareAtPrice?: number;
  discountPercent?: number;
  hasDiscount: boolean;
  sku: string;
  stock: number;
  isAvailable: boolean;
  allOptionsSelected: boolean;
};

export function getVariantDetails(
  product: Product,
  selectedOptions: Record<string, string>
): VariantSelectionDetails {
  const allOptionsSelected = product.options.every((opt) =>
    Boolean(selectedOptions[opt.id])
  );

  if (product.options.length > 0 && !allOptionsSelected) {
    const cardPricing = getProductCardPricing(product);
    return {
      selectedVariant: null,
      price: cardPricing.price,
      compareAtPrice: cardPricing.compareAtPrice,
      discountPercent: cardPricing.discountPercent,
      hasDiscount: cardPricing.hasDiscount,
      sku: product.id,
      stock: product.inventory.totalStock,
      isAvailable: product.inventory.hasAvailableVariants && product.inventory.totalStock > 0,
      allOptionsSelected: false,
    };
  }

  const variant = findVariant(product, selectedOptions);

  if (variant) {
    const isAvail = isVariantAvailable(variant);
    const hasDisc = Boolean(
      variant.pricing.compareAtPrice &&
        variant.pricing.compareAtPrice > variant.pricing.price
    );
    const discPercent =
      variant.pricing.discountPercent ??
      (hasDisc && variant.pricing.compareAtPrice
        ? Math.round(
            ((variant.pricing.compareAtPrice - variant.pricing.price) /
              variant.pricing.compareAtPrice) *
              100
          )
        : undefined);

    return {
      selectedVariant: variant,
      price: variant.pricing.price,
      compareAtPrice: variant.pricing.compareAtPrice,
      discountPercent: discPercent,
      hasDiscount: hasDisc,
      sku: variant.sku || product.id,
      stock: variant.inventory.stock,
      isAvailable: isAvail,
      allOptionsSelected: true,
    };
  }

  // If no variant found or product has no variants
  const cardPricing = getProductCardPricing(product);
  const isAvail =
    product.inventory.hasAvailableVariants && product.inventory.totalStock > 0;

  return {
    selectedVariant: null,
    price: cardPricing.price,
    compareAtPrice: cardPricing.compareAtPrice,
    discountPercent: cardPricing.discountPercent,
    hasDiscount: cardPricing.hasDiscount,
    sku: product.id,
    stock: product.inventory.totalStock,
    isAvailable: isAvail,
    allOptionsSelected: product.options.length === 0,
  };
}

/**
 * Checks if a specific option value is available for selection given other selected options.
 */
export function isOptionValueAvailable(
  product: Product,
  optionId: string,
  valueId: string,
  currentSelections: Record<string, string>
): boolean {
  if (product.variants.length === 0) return true;

  const testSelections = { ...currentSelections, [optionId]: valueId };

  // Find variants that match all test selections present
  const matchingVariants = product.variants.filter(
    (v) =>
      v.status === "active" &&
      Object.entries(testSelections).every(([optId, valId]) =>
        v.optionValues.some(
          (ov) => ov.optionId === optId && ov.valueId === valId
        )
      )
  );

  if (matchingVariants.length === 0) return false;

  return matchingVariants.some((v) => isVariantAvailable(v));
}
