import { describe, expect, test } from "bun:test";
import { resolveProductMedia } from "@/lib/product/mediaService";
import { reviewService } from "@/lib/product/reviewService";
import { Product } from "@/types/product";

const goldenProductFixture: Product = {
  id: "prod-golden-gallery-1",
  slug: "golden-leather-bag",
  title: "کیف دوشی چرم طبیعی مدل گلدن",
  category: { id: "cat-bags", name: "کیف زنانه", slug: "bags" },
  images: [
    { id: "img-off-1", url: "/images/golden-1.webp", alt: "کیف چرم زاویه روبرو", sortOrder: 1 },
    { id: "img-off-2", url: "/images/golden-2.webp", alt: "کیف چرم زاویه پشت", sortOrder: 2 },
    { id: "img-off-3", url: "/images/golden-3.webp", alt: "کیف چرم نمای داخلی", sortOrder: 3 },
  ],
  options: [
    {
      id: "color",
      name: "رنگ",
      type: "color",
      required: true,
      sortOrder: 1,
      values: [
        { id: "black", label: "مشکی", value: "#000000", sortOrder: 1 },
        { id: "brown", label: "قهوه‌ای", value: "#8B4513", sortOrder: 2 },
      ],
    },
  ],
  variants: [
    {
      id: "var-black",
      sku: "GLD-BLK-01",
      optionValues: [{ optionId: "color", valueId: "black" }],
      pricing: { price: 2500000 },
      inventory: { stock: 5, trackStock: true },
      imageIds: ["img-off-1"],
      status: "active",
    },
    {
      id: "var-brown",
      sku: "GLD-BRN-01",
      optionValues: [{ optionId: "color", valueId: "brown" }],
      pricing: { price: 2500000 },
      inventory: { stock: 3, trackStock: true },
      imageIds: ["img-off-2"],
      status: "active",
    },
  ],
  pricing: { minPrice: 2500000, hasDiscount: false },
  inventory: { totalStock: 8, trackStock: true, hasAvailableVariants: true },
  status: "active",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("P0/P1 Product Gallery & Media Integration Tests", () => {
  test("1. Golden Product resolves 3 official images in correct order", () => {
    const media = resolveProductMedia({
      product: goldenProductFixture,
      includeCustomerMedia: false,
    });

    expect(media.length).toBe(3);
    expect(media[0].id).toBe("img-off-1");
    expect(media[1].id).toBe("img-off-2");
    expect(media[2].id).toBe("img-off-3");
    expect(media.every((m) => m.type === "product")).toBe(true);
  });

  test("2. Selecting brown variant prioritizes brown variant image (img-off-2)", () => {
    const media = resolveProductMedia({
      product: goldenProductFixture,
      selectedVariantId: "var-brown",
      includeCustomerMedia: false,
    });

    expect(media[0].id).toBe("img-off-2");
    expect(media[0].variantId).toBe("var-brown");
  });

  test("3. Customer review photos append after official images and preserve review metadata", () => {
    // Submit a customer review with an image for this golden product
    reviewService.submitReview({
      orderId: "ord-test-golden",
      productId: goldenProductFixture.id,
      authorName: "سارا حسینی",
      rating: 5,
      comment: "کیف بسیار باکیفیت و چرم اصل بود. عکسش رو می‌ذارم ببینید.",
      images: ["/images/customer-photo-1.webp"],
    });

    const media = resolveProductMedia({
      product: goldenProductFixture,
      includeCustomerMedia: true,
    });

    const customerItems = media.filter((m) => m.type === "customer");
    expect(customerItems.length).toBeGreaterThanOrEqual(1);

    const firstCustomerItem = customerItems[0];
    expect(firstCustomerItem.customerContext).toBeDefined();
    expect(firstCustomerItem.customerContext?.authorName).toBe("سارا حسینی");
    expect(firstCustomerItem.customerContext?.rating).toBe(5);
    expect(firstCustomerItem.customerContext?.verifiedPurchase).toBe(true);
  });

  test("4. Empty product images falls back gracefully to square placeholder", () => {
    const emptyProduct: Product = {
      ...goldenProductFixture,
      id: "prod-empty-img",
      images: [],
    };

    const media = resolveProductMedia({
      product: emptyProduct,
      includeCustomerMedia: false,
    });

    expect(media.length).toBe(1);
    expect(media[0].url).toContain("product-placeholder.webp");
  });
});
