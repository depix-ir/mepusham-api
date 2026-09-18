import { describe, expect, test } from "bun:test";
import { resolveProductMedia } from "@/lib/product/mediaService";
import { Product } from "@/types/product";

const mockProduct: Product = {
  id: "prod-test-1",
  slug: "test-product",
  title: "محصول تست مپوشام",
  category: { id: "cat-1", name: "پوشاک", slug: "clothing" },
  images: [
    { id: "img-2", url: "/images/img2.webp", alt: "تصویر دوم", sortOrder: 2 },
    { id: "img-1", url: "/images/img1.webp", alt: "تصویر اول", sortOrder: 1 },
  ],
  options: [],
  variants: [
    {
      id: "var-1",
      optionValues: [],
      pricing: { price: 100000 },
      inventory: { stock: 10, trackStock: true },
      imageIds: ["img-2"],
      status: "active",
    },
  ],
  pricing: { minPrice: 100000, hasDiscount: false },
  inventory: { totalStock: 10, trackStock: true, hasAvailableVariants: true },
  status: "active",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("Product Media Resolver", () => {
  test("resolves official images in correct sort order", () => {
    const media = resolveProductMedia({ product: mockProduct, includeCustomerMedia: false });
    expect(media.length).toBe(2);
    expect(media[0].id).toBe("img-1");
    expect(media[1].id).toBe("img-2");
    expect(media[0].type).toBe("product");
  });

  test("prioritizes variant image when variant is selected", () => {
    const media = resolveProductMedia({
      product: mockProduct,
      selectedVariantId: "var-1",
      includeCustomerMedia: false,
    });
    expect(media.length).toBe(2);
    expect(media[0].id).toBe("img-2");
    expect(media[0].variantId).toBe("var-1");
  });

  test("appends customer review images after official images with review context", () => {
    const media = resolveProductMedia({ product: mockProduct, includeCustomerMedia: true });
    expect(media.length).toBeGreaterThan(2);
    const customerItems = media.filter((m) => m.type === "customer");
    expect(customerItems.length).toBeGreaterThan(0);
    expect(customerItems[0].customerContext).toBeDefined();
    expect(customerItems[0].customerContext?.authorName).toBeDefined();
  });
});
