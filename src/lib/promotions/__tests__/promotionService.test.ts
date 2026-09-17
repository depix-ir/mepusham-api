import { describe, test, expect, beforeEach } from "bun:test";
import {
  getPromotionStatus,
  calculateBestDiscount,
  evaluateFreeShipping,
  createDiscount,
  createFreeShippingRule,
  getFreeShippingRules,
  deactivateFreeShippingRule,
} from "../promotionService";
import { ProductDiscount, FreeShippingRule } from "@/types/promotion";

describe("Promotion Service & Status Logic", () => {
  const mockNow = new Date("2026-06-15T12:00:00Z");
  const pastIso = new Date("2026-06-01T00:00:00Z").toISOString();
  const futureIso = new Date("2026-07-01T00:00:00Z").toISOString();
  const farFutureIso = new Date("2026-08-01T00:00:00Z").toISOString();
  const farPastIso = new Date("2026-05-01T00:00:00Z").toISOString();

  // Deactivate initial mock rules for predictable testing of bounds
  beforeEach(() => {
    const initialRules = getFreeShippingRules();
    initialRules.forEach((r) => deactivateFreeShippingRule(r.id));
  });

  test("getPromotionStatus derives active, scheduled, expired, and disabled correctly", () => {
    // Disabled
    expect(getPromotionStatus(false, pastIso, futureIso, mockNow)).toBe("disabled");

    // Scheduled
    expect(getPromotionStatus(true, futureIso, farFutureIso, mockNow)).toBe("scheduled");

    // Expired
    expect(getPromotionStatus(true, farPastIso, pastIso, mockNow)).toBe("expired");

    // Active
    expect(getPromotionStatus(true, pastIso, futureIso, mockNow)).toBe("active");
  });

  describe("calculateBestDiscount (Discount Priority & Non-Stacking Rules)", () => {
    test("selects the single discount giving HIGHEST monetary saving and NEVER stacks", () => {
      const discount20Pct: Omit<ProductDiscount, "id" | "usedCount" | "createdAt" | "updatedAt"> = {
        title: "۲۰٪ تخفیف",
        type: "percentage",
        value: 20,
        productIds: ["prod-test-01"],
        startsAt: pastIso,
        endsAt: futureIso,
        isActive: true,
      };

      const discount500kFixed: Omit<ProductDiscount, "id" | "usedCount" | "createdAt" | "updatedAt"> = {
        title: "۵۰۰ هزار تومان تخفیف",
        type: "fixed",
        value: 500000,
        productIds: ["prod-test-01"],
        startsAt: pastIso,
        endsAt: futureIso,
        isActive: true,
      };

      createDiscount(discount20Pct);
      createDiscount(discount500kFixed);

      // Case A: Price = 2,000,000 Toman
      // 20% = 400,000 saving
      // 500,000 fixed = 500,000 saving
      // Result: 500,000 fixed discount wins (higher saving)
      const resultA = calculateBestDiscount("prod-test-01", 2000000, undefined, mockNow);
      expect(resultA).not.toBeNull();
      expect(resultA?.monetarySaving).toBe(500000);
      expect(resultA?.finalPrice).toBe(1500000);
      expect(resultA?.discount.title).toBe("۵۰۰ هزار تومان تخفیف");

      // Case B: Price = 3,000,000 Toman
      // 20% = 600,000 saving
      // 500,000 fixed = 500,000 saving
      // Result: 20% discount wins (600,000 > 500,000)
      const resultB = calculateBestDiscount("prod-test-01", 3000000, undefined, mockNow);
      expect(resultB).not.toBeNull();
      expect(resultB?.monetarySaving).toBe(600000);
      expect(resultB?.finalPrice).toBe(2400000);
      expect(resultB?.discount.title).toBe("۲۰٪ تخفیف");
    });

    test("scheduled, expired, or disabled discounts produce zero discount", () => {
      const scheduledDisc: Omit<ProductDiscount, "id" | "usedCount" | "createdAt" | "updatedAt"> = {
        title: "تخفیف آینده",
        type: "percentage",
        value: 50,
        productIds: ["prod-test-inactive"],
        startsAt: futureIso,
        endsAt: farFutureIso,
        isActive: true,
      };

      createDiscount(scheduledDisc);

      const res = calculateBestDiscount("prod-test-inactive", 1000000, undefined, mockNow);
      expect(res).toBeNull();
    });

    test("usage limit reached prevents discount application", () => {
      const limitedDisc = createDiscount({
        title: "محدودیت استفاده",
        type: "percentage",
        value: 30,
        productIds: ["prod-test-limit"],
        startsAt: pastIso,
        endsAt: futureIso,
        usageLimit: 10,
        isActive: true,
      });

      // Simulate usedCount = 10 (limit reached)
      limitedDisc.usedCount = 10;

      const res = calculateBestDiscount("prod-test-limit", 1000000, undefined, mockNow);
      expect(res).toBeNull();
    });
  });

  describe("evaluateFreeShipping (Free Shipping Conditions)", () => {
    test("applies free shipping when minimum purchase condition is satisfied", () => {
      createFreeShippingRule({
        title: "ارسال رایگان بالای ۱ میلیون",
        scope: "store",
        minPurchaseAmount: 1000000,
        startsAt: pastIso,
        endsAt: futureIso,
        isActive: true,
      });

      // Cart total = 800,000 -> Below min -> No free shipping
      const resBelow = evaluateFreeShipping([], 800000, mockNow);
      expect(resBelow.isFreeShipping).toBe(false);

      // Cart total = 1,200,000 -> Above min -> Free shipping
      const resAbove = evaluateFreeShipping([], 1200000, mockNow);
      expect(resAbove.isFreeShipping).toBe(true);
    });

    test("enforces minimum and maximum bounds for free shipping", () => {
      createFreeShippingRule({
        title: "ارسال رایگان بین ۱ تا ۵ میلیون",
        scope: "store",
        minPurchaseAmount: 1000000,
        maxPurchaseAmount: 5000000,
        startsAt: pastIso,
        endsAt: futureIso,
        isActive: true,
      });

      // Below range
      expect(evaluateFreeShipping([], 500000, mockNow).isFreeShipping).toBe(false);

      // Within range
      expect(evaluateFreeShipping([], 3000000, mockNow).isFreeShipping).toBe(true);

      // Above range
      expect(evaluateFreeShipping([], 6000000, mockNow).isFreeShipping).toBe(false);
    });

    test("multiple valid free shipping rules apply ONLY ONCE", () => {
      createFreeShippingRule({
        title: "قانون اول",
        scope: "store",
        startsAt: pastIso,
        endsAt: futureIso,
        isActive: true,
      });

      createFreeShippingRule({
        title: "قانون دوم",
        scope: "store",
        startsAt: pastIso,
        endsAt: futureIso,
        isActive: true,
      });

      const result = evaluateFreeShipping([], 2000000, mockNow);
      expect(result.isFreeShipping).toBe(true);
      expect(result.appliedRule).not.toBeNull();
    });
  });
});
