import { Product, ProductQueryFilter, PaginatedProductsResponse } from "@/types/product";
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

export const PRODUCT_PAGE_SIZE = 8;

/**
 * Filter, sort, and paginate product catalog asynchronously (designed to be replaceable by backend API)
 */
export async function getPaginatedProducts(
  filters: ProductQueryFilter = {},
  page: number = 1,
  pageSize: number = PRODUCT_PAGE_SIZE,
  delayMs: number = 80
): Promise<PaginatedProductsResponse> {
  let list = [...products];

  // Filter by category
  if (filters.category) {
    list = list.filter((p) => p.category.slug === filters.category);
  }

  // Filter by brands
  if (filters.brands && filters.brands.length > 0) {
    list = list.filter((p) => p.brand?.slug && filters.brands!.includes(p.brand.slug));
  }

  // Filter by price range
  if (filters.minPrice !== undefined && !isNaN(Number(filters.minPrice))) {
    list = list.filter((p) => p.pricing.minPrice >= Number(filters.minPrice));
  }
  if (filters.maxPrice !== undefined && !isNaN(Number(filters.maxPrice))) {
    list = list.filter((p) => p.pricing.minPrice <= Number(filters.maxPrice));
  }

  // Filter by stock
  if (filters.inStock) {
    list = list.filter((p) => p.inventory.totalStock > 0);
  }

  // Filter by discount
  if (filters.hasDiscount) {
    list = list.filter((p) => p.pricing.hasDiscount);
  }

  // Search query filter
  if (filters.q && filters.q.trim() !== "") {
    const q = filters.q.trim().toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        p.category.name.toLowerCase().includes(q) ||
        (p.brand?.name && p.brand.name.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some((tag) => tag.toLowerCase().includes(q)))
    );
  }

  // Sort list
  const sort = filters.sort || "newest";
  if (sort === "price_asc") {
    list.sort((a, b) => a.pricing.minPrice - b.pricing.minPrice);
  } else if (sort === "price_desc") {
    list.sort((a, b) => b.pricing.minPrice - a.pricing.minPrice);
  } else if (sort === "discount") {
    list.sort(
      (a, b) =>
        (b.variants[0]?.pricing?.discountPercent || 0) -
        (a.variants[0]?.pricing?.discountPercent || 0)
    );
  } else {
    // newest
    list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  const total = list.length;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const items = list.slice(startIndex, endIndex);
  const hasNextPage = endIndex < total;

  if (delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  return {
    items,
    page,
    pageSize,
    total,
    hasNextPage,
  };
}
