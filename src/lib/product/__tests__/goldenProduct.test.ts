import { describe, test, expect, beforeEach } from "bun:test";
import { catalogRepository } from "@/lib/repositories/catalogRepository";
import { getProductBySlug, getProductById, getPaginatedProducts } from "@/lib/product/service";
import { getSearchSuggestions } from "@/lib/search/suggestionService";
import { validateCart } from "@/store/cart/cart.validation";
import { accountService } from "@/lib/account/accountService";

describe("Golden Product End-to-End Consistency & Snapshot Integrity Test", () => {
  beforeEach(() => {
    catalogRepository.resetToDefaults();
  });

  test("Admin update propagates to Listing, Search, PDP, Cart, while preserving historical Order snapshots", async () => {
    // 1. Initial State Check
    const initialProd = catalogRepository.getProductById("prod-bag-01");
    expect(initialProd).not.toBeNull();
    const prodId = initialProd!.id;
    const variantId = initialProd!.variants[0]?.id;

    // 2. Admin Edit Action: Change title and price
    const updatedProducts = catalogRepository.getProducts().map((p) => {
      if (p.id === prodId) {
        return {
          ...p,
          title: "عنوان طلایی جدید محصولات تک‌شاخ",
          pricing: {
            ...p.pricing,
            minPrice: 1950000,
          },
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });
    catalogRepository.saveProducts(updatedProducts);

    // 3. Verify Repository & Service Level Propagation
    const updatedInRepo = catalogRepository.getProductById(prodId);
    expect(updatedInRepo?.title).toBe("عنوان طلایی جدید محصولات تک‌شاخ");
    expect(updatedInRepo?.pricing.minPrice).toBe(1950000);

    // 4. Verify Storefront Listing (Paginated Products)
    const paginated = await getPaginatedProducts({ q: "تک‌شاخ" }, 1, 10, 0);
    expect(paginated.items.length).toBeGreaterThan(0);
    const matchedItem = paginated.items.find((p) => p.id === prodId);
    expect(matchedItem?.title).toBe("عنوان طلایی جدید محصولات تک‌شاخ");

    // 5. Verify PDP Resolution
    const pdpProduct = getProductBySlug(initialProd!.slug);
    expect(pdpProduct).not.toBeNull();
    expect(pdpProduct?.title).toBe("عنوان طلایی جدید محصولات تک‌شاخ");

    // 6. Verify Search Suggestion Resolution
    const searchSuggestions = getSearchSuggestions("تک‌شاخ", catalogRepository.getProducts());
    expect(searchSuggestions.some((s) => s.text.includes("تک‌شاخ"))).toBe(true);

    // 7. Verify Cart Resolution
    const cartValidation = validateCart([
      {
        id: `${prodId}:${variantId}`,
        productId: prodId,
        productSlug: initialProd!.slug,
        name: "عنوان طلایی جدید محصولات تک‌شاخ",
        image: "/images/product-1.webp",
        variantId,
        unitPrice: 1950000,
        quantity: 1,
        availableStock: 10,
      },
    ]);
    expect(cartValidation.valid).toBe(true);

    // 8. Place Order (Historical Snapshot Captured)
    const createdOrder = accountService.createOrder({
      customerId: "cust_golden_1",
      customer: {
        firstName: "سارا",
        lastName: "احمدی",
        phone: "09121111111",
        province: "تهران",
        city: "تهران",
        address: "خیابان ولیعصر",
        postalCode: "1234567890",
      },
      shipping: {
        methodId: "post_express",
        price: 45000,
        title: "پست پیشتاز",
      },
      items: [
        {
          productId: prodId,
          variantId,
          quantity: 1,
          unitPrice: 1950000,
        },
      ],
      pricing: {
        itemsSubtotal: 1950000,
        shippingCost: 45000,
        payableTotal: 1995000,
      },
    });

    expect(createdOrder.items[0].title).toBe("عنوان طلایی جدید محصولات تک‌شاخ");
    expect(createdOrder.items[0].unitPrice).toBe(1950000);

    // 9. Admin Updates Product Title SECOND Time (Catalog changes again)
    const secondUpdateProducts = catalogRepository.getProducts().map((p) => {
      if (p.id === prodId) {
        return {
          ...p,
          title: "عنوان ویرایش دوم محصول",
          pricing: {
            ...p.pricing,
            minPrice: 2500000,
          },
        };
      }
      return p;
    });
    catalogRepository.saveProducts(secondUpdateProducts);

    // 10. Verify Catalog reflects new edit
    const secondEditInRepo = catalogRepository.getProductById(prodId);
    expect(secondEditInRepo?.title).toBe("عنوان ویرایش دوم محصول");

    // 11. CRITICAL: Verify Historical Order Snapshot REMAINS IMMUTABLE
    const retrievedOrder = accountService.getOrderById(createdOrder.id);
    expect(retrievedOrder).not.toBeUndefined();
    expect(retrievedOrder?.items[0].title).toBe("عنوان طلایی جدید محصولات تک‌شاخ");
    expect(retrievedOrder?.items[0].unitPrice).toBe(1950000);
  });
});
