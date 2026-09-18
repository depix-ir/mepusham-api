import { CartItem, CartValidationResult, CartValidationError } from "./cart.types";
import { catalogRepository } from "@/lib/repositories/catalogRepository";
import { findVariant, isVariantAvailable } from "@/lib/product/domain";

/**
 * Validates cart items against current business rules & inventory data.
 */
export function validateCart(items: CartItem[]): CartValidationResult {
  const errors: CartValidationError[] = [];

  if (!items || items.length === 0) {
    return { valid: true, errors: [] };
  }

  for (const item of items) {
    // 1. Basic Quantity Check
    if (item.quantity < 1) {
      errors.push({
        itemId: item.id,
        productTitle: item.name,
        type: "INVALID_QUANTITY",
        message: `تعداد درخواست‌شده برای «${item.name}» نامعتبر است.`,
      });
      continue;
    }

    // 2. Check against product catalog if product exists
    const catalogProduct = catalogRepository.getProductById(item.productId);

    if (!catalogProduct) {
      // Product may have been removed or unavailable
      errors.push({
        itemId: item.id,
        productTitle: item.name,
        type: "PRODUCT_NOT_FOUND",
        message: `محصول «${item.name}» دیگر در فروشگاه موجود نیست.`,
      });
      continue;
    }

    // 3. Variant or Product Stock Verification
    let maxAvailableStock = catalogProduct.inventory.totalStock;
    let isAvailable = catalogProduct.inventory.hasAvailableVariants && maxAvailableStock > 0;

    if (item.variantId) {
      const catalogVariant = catalogProduct.variants.find((v) => v.id === item.variantId);
      if (!catalogVariant || !isVariantAvailable(catalogVariant)) {
        errors.push({
          itemId: item.id,
          productTitle: item.name,
          type: "VARIANT_UNAVAILABLE",
          message: `تنوع انتخاب‌شده برای «${item.name}» در حال حاضر ناموجود است.`,
        });
        continue;
      }
      maxAvailableStock = catalogVariant.inventory.stock;
      isAvailable = true;
    } else if (item.selectedVariants && item.selectedVariants.length > 0) {
      // Match by selected options if variantId not directly set
      const selectedMap: Record<string, string> = {};
      item.selectedVariants.forEach((sv) => {
        selectedMap[sv.attributeId] = sv.valueId;
      });
      const matchedVariant = findVariant(catalogProduct, selectedMap);
      if (!matchedVariant || !isVariantAvailable(matchedVariant)) {
        errors.push({
          itemId: item.id,
          productTitle: item.name,
          type: "VARIANT_UNAVAILABLE",
          message: `تنوع انتخاب‌شده برای «${item.name}» در حال حاضر ناموجود است.`,
        });
        continue;
      }
      maxAvailableStock = matchedVariant.inventory.stock;
      isAvailable = true;
    }

    if (!isAvailable || maxAvailableStock <= 0) {
      errors.push({
        itemId: item.id,
        productTitle: item.name,
        type: "OUT_OF_STOCK",
        message: `محصول «${item.name}» متأسفانه ناموجود شده است.`,
        maxAvailable: 0,
      });
    } else if (item.quantity > maxAvailableStock) {
      errors.push({
        itemId: item.id,
        productTitle: item.name,
        type: "QUANTITY_EXCEEDS_STOCK",
        message: `حداکثر موجودی قابل سفارش برای «${item.name}»، ${maxAvailableStock} عدد است.`,
        maxAvailable: maxAvailableStock,
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
