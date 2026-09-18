import { Product, ProductImage, ProductMediaItem } from "@/types/product";
import { reviewService } from "./reviewService";

export interface ResolveProductMediaOptions {
  product: Product;
  selectedVariantId?: string;
  includeCustomerMedia?: boolean;
}

/**
 * Resolves all media items for a product gallery in a deterministic, prioritized order:
 * 1. Official product images sorted by `sortOrder`
 * 2. Variant-specific images (if matching variant has specific image IDs)
 * 3. Customer-submitted review media appended after official images
 */
export function resolveProductMedia({
  product,
  selectedVariantId,
  includeCustomerMedia = true,
}: ResolveProductMediaOptions): ProductMediaItem[] {
  const mediaItems: ProductMediaItem[] = [];

  // 1. Official product images
  let officialImages: ProductImage[] = product.images || [];

  // Fallback placeholder if no product images exist
  if (officialImages.length === 0) {
    officialImages = [
      {
        id: `placeholder-${product.id}`,
        url: "/images/placeholders/product-placeholder.webp",
        alt: product.title,
        sortOrder: 0,
      },
    ];
  }

  // Sort official product images strictly by sortOrder
  const sortedOfficial = [...officialImages].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );

  // If a variant is selected and has specific imageIds associated
  let variantImageIds: string[] = [];
  if (selectedVariantId && product.variants) {
    const variant = product.variants.find((v) => v.id === selectedVariantId);
    if (variant && variant.imageIds && variant.imageIds.length > 0) {
      variantImageIds = variant.imageIds;
    }
  }

  // Map official product images into canonical ProductMediaItem
  sortedOfficial.forEach((img, idx) => {
    // If variantImageIds exist, bump priority of variant images while retaining all
    const isVariantSpecific = variantImageIds.includes(img.id);
    mediaItems.push({
      id: img.id || `official-${product.id}-${idx}`,
      type: "product",
      url: img.url,
      alt: img.alt || `${product.title} - تصویر ${idx + 1}`,
      productId: product.id,
      variantId: isVariantSpecific ? selectedVariantId : undefined,
      sortOrder: isVariantSpecific ? idx - 1000 : img.sortOrder ?? idx,
    });
  });

  // Re-sort official items if variant image priority applies
  if (variantImageIds.length > 0) {
    mediaItems.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  // 2. Customer review images appended deterministically
  if (includeCustomerMedia) {
    const { reviews } = reviewService.getProductReviews(product.id, product.title);
    let customerMediaCount = 0;

    reviews.forEach((rev) => {
      if (rev.images && rev.images.length > 0) {
        rev.images.forEach((imgUrl, imgIdx) => {
          customerMediaCount++;
          mediaItems.push({
            id: `customer-${rev.id}-${imgIdx}`,
            type: "customer",
            url: imgUrl,
            alt: `عکس ارسالی توسط ${rev.authorName} برای ${product.title}`,
            productId: product.id,
            sortOrder: 1000 + customerMediaCount,
            customerContext: {
              reviewId: rev.id,
              authorName: rev.authorName,
              rating: rev.rating,
              comment: rev.comment,
              date: rev.date,
              verifiedPurchase: rev.verifiedPurchase,
            },
          });
        });
      }
    });
  }

  return mediaItems;
}
