import { describe, it, expect, beforeEach } from "bun:test";
import { reviewService } from "../reviewService";

describe("Review Service Logic", () => {
  beforeEach(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.clear();
    }
  });

  it("submits a review for a delivered order item and calculates updated ratings", () => {
    const review = reviewService.submitReview({
      orderId: "ord-test-1",
      productId: "prod-1",
      authorName: "سارا محمدی",
      rating: 5,
      comment: "کیفیت بسیار عالی و جنس خنک و عالی دارد.",
      images: ["/images/test-review-1.webp"],
    });

    expect(review.id).toBeDefined();
    expect(review.authorName).toBe("سارا محمدی");
    expect(review.rating).toBe(5);
    expect(review.images).toHaveLength(1);

    const { rating, reviews } = reviewService.getProductReviews("prod-1", "مانتو کتان");
    expect(reviews.length).toBeGreaterThan(3);
    expect(reviews[0].id).toBe(review.id);
    expect(rating.count).toBe(reviews.length);

    const customerImages = reviewService.getCustomerImages("prod-1", "مانتو کتان");
    expect(customerImages.length).toBeGreaterThanOrEqual(1);
    expect(customerImages.some((img) => img.url === "/images/test-review-1.webp")).toBe(true);
  });

  it("identifies reviews for order items correctly", () => {
    reviewService.submitReview({
      orderId: "ord-test-2",
      productId: "prod-2",
      authorName: "علی رضایی",
      rating: 4,
      comment: "خوب بود مرسی.",
    });

    const itemReview = reviewService.getReviewForOrderItem("ord-test-2", "prod-2");
    expect(itemReview).toBeDefined();
    expect(itemReview?.comment).toBe("خوب بود مرسی.");

    const orderReviews = reviewService.getReviewsForOrder("ord-test-2");
    expect(orderReviews).toHaveLength(1);
  });
});
