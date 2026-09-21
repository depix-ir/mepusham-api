import { ProductReview, ProductRating } from "@/types/product";
import { getDefaultRatingAndReviews } from "@/data/pdp-defaults";

const STORAGE_KEY = "mepusham_reviews_v1";

export interface SubmitReviewInput {
  orderId: string;
  productId: string;
  authorName: string;
  rating: number;
  comment: string;
  images?: string[];
}

class ReviewService {
  private inMemoryReviews: ProductReview[] = [];

  private isLocalStorageAvailable(): boolean {
    return typeof window !== "undefined" && typeof localStorage !== "undefined";
  }

  private getStoredReviews(): ProductReview[] {
    if (!this.isLocalStorageAvailable()) {
      return this.inMemoryReviews;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return this.inMemoryReviews;
      return JSON.parse(raw) as ProductReview[];
    } catch {
      return this.inMemoryReviews;
    }
  }

  private saveStoredReviews(reviews: ProductReview[]): void {
    this.inMemoryReviews = reviews;
    if (!this.isLocalStorageAvailable()) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    } catch (err) {
      console.error("Failed to save reviews to localStorage:", err);
    }
  }

  /**
   * Retrieves all reviews for a specific product, merging stored reviews with default PDP reviews
   */
  public getProductReviews(productId: string, productTitle: string): { rating: ProductRating; reviews: ProductReview[] } {
    const defaults = getDefaultRatingAndReviews(productTitle);
    const stored = this.getStoredReviews().filter((r) => r.productId === productId);

    const allReviews = [...stored, ...defaults.reviews];

    if (allReviews.length === 0) {
      return defaults;
    }

    // Recalculate rating stats
    const totalCount = allReviews.length;
    const totalSum = allReviews.reduce((acc, r) => acc + r.rating, 0);
    const average = Math.round((totalSum / totalCount) * 10) / 10;

    const starDistribution = {
      5: allReviews.filter((r) => Math.round(r.rating) === 5).length,
      4: allReviews.filter((r) => Math.round(r.rating) === 4).length,
      3: allReviews.filter((r) => Math.round(r.rating) === 3).length,
      2: allReviews.filter((r) => Math.round(r.rating) === 2).length,
      1: allReviews.filter((r) => Math.round(r.rating) === 1).length,
    };

    return {
      rating: {
        average,
        count: totalCount,
        starDistribution,
      },
      reviews: allReviews,
    };
  }

  /**
   * Returns all customer images submitted for a product across all reviews
   */
  public getCustomerImages(productId: string, productTitle: string): Array<{ id: string; url: string; authorName: string; rating: number; comment: string; date: string }> {
    const { reviews } = this.getProductReviews(productId, productTitle);
    const customerImages: Array<{ id: string; url: string; authorName: string; rating: number; comment: string; date: string }> = [];

    reviews.forEach((rev) => {
      if (rev.images && rev.images.length > 0) {
        rev.images.forEach((imgUrl, idx) => {
          customerImages.push({
            id: `${rev.id}-img-${idx}`,
            url: imgUrl,
            authorName: rev.authorName,
            rating: rev.rating,
            comment: rev.comment,
            date: rev.date,
          });
        });
      }
    });

    return customerImages;
  }

  /**
   * Checks if a review was already submitted for an order item
   */
  public getReviewForOrderItem(orderId: string, productId: string): ProductReview | undefined {
    const stored = this.getStoredReviews();
    return stored.find((r) => r.orderId === orderId && r.productId === productId);
  }

  /**
   * Checks if an entire order has reviews for all items
   */
  public getReviewsForOrder(orderId: string): ProductReview[] {
    const stored = this.getStoredReviews();
    return stored.filter((r) => r.orderId === orderId);
  }

  /**
   * Submits a new review for a delivered order item
   */
  public submitReview(input: SubmitReviewInput): ProductReview {
    const stored = this.getStoredReviews();

    const newReview: ProductReview = {
      id: `rev-usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderId: input.orderId,
      productId: input.productId,
      authorName: input.authorName.trim() || "کاربر مپوشــــم",
      rating: Math.min(5, Math.max(1, input.rating)),
      date: new Date().toLocaleDateString("fa-IR"),
      comment: input.comment.trim(),
      verifiedPurchase: true,
      images: input.images && input.images.length > 0 ? input.images : undefined,
    };

    // Remove old review for same order item if exists, then prepend
    const filtered = stored.filter((r) => !(r.orderId === input.orderId && r.productId === input.productId));
    const updated = [newReview, ...filtered];

    this.saveStoredReviews(updated);
    return newReview;
  }
}

export const reviewService = new ReviewService();
