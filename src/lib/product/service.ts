import { Product } from "@/types/product";
import { products } from "@/data/products";
import {
  FOOTWEAR_SIZE_GUIDE,
  CLOTHING_SIZE_GUIDE,
  DEFAULT_SHIPPING_RETURNS,
  getDefaultRatingAndReviews,
  getDefaultSpecifications,
  getDefaultCareInstructions,
} from "@/data/pdp-defaults";

/**
 * Enriches a raw Product with PDP defaults (ratings, reviews, specs, care instructions, size guide)
 * if they are not already present.
 */
export function enrichProduct(product: Product): Product {
  const categorySlug = product.category.slug;
  const { rating, reviews } = getDefaultRatingAndReviews(product.title);

  let sizeGuide = product.sizeGuide;
  if (!sizeGuide) {
    if (categorySlug === "shoes-sandals") {
      sizeGuide = FOOTWEAR_SIZE_GUIDE;
    } else if (
      categorySlug === "womens-dresses" ||
      categorySlug === "coats-jackets" ||
      categorySlug === "pants-skirts"
    ) {
      sizeGuide = CLOTHING_SIZE_GUIDE;
    }
  }

  return {
    ...product,
    rating: product.rating || rating,
    reviews: product.reviews || reviews,
    specifications:
      product.specifications ||
      getDefaultSpecifications(
        categorySlug === "shoes-sandals"
          ? "shoes"
          : categorySlug === "bags-backpacks"
          ? "bags"
          : categorySlug === "accessories"
          ? "accessories"
          : "clothing"
      ),
    careInstructions:
      product.careInstructions ||
      getDefaultCareInstructions(
        categorySlug === "shoes-sandals"
          ? "shoes"
          : categorySlug === "bags-backpacks"
          ? "bags"
          : categorySlug === "accessories"
          ? "accessories"
          : "clothing"
      ),
    sizeGuide,
    shippingReturns: product.shippingReturns || DEFAULT_SHIPPING_RETURNS,
  };
}

/**
 * Finds a product by slug and returns its enriched version.
 */
export function getProductBySlug(slug: string): Product | null {
  const found = products.find((p) => p.slug === slug);
  if (!found) return null;
  return enrichProduct(found);
}

/**
 * Returns related products for a given product (e.g., same category or brand).
 */
export function getRelatedProducts(
  product: Product,
  limit: number = 8
): Product[] {
  const sameCategory = products.filter(
    (p) => p.id !== product.id && p.category.id === product.category.id
  );
  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }
  const others = products.filter(
    (p) => p.id !== product.id && p.category.id !== product.category.id
  );
  return [...sameCategory, ...others].slice(0, limit);
}
