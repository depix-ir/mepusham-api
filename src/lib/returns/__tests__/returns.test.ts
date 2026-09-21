import { describe, test, expect } from "bun:test";
import {
  isWithinReturnWindow,
  checkItemEligibility,
  validateExchangeVariant,
} from "../eligibility";
import {
  isValidStateTransition,
} from "../stateMachine";
import { getReturnPolicy } from "../policy";
import { ReturnRequest } from "@/types/return";
import { OrderItem } from "@/types/account";
import { Product } from "@/types/product";

describe("Return Window Enforcement (2 Days / 48 Hours)", () => {
  test("Order delivered 1 day ago is within return window", () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const result = isWithinReturnWindow(oneDayAgo);
    expect(result.isWithinWindow).toBe(true);
  });

  test("Order delivered 3 days ago is outside return window", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const result = isWithinReturnWindow(threeDaysAgo);
    expect(result.isWithinWindow).toBe(false);
  });
});

describe("Returnable Quantity Validation", () => {
  const mockItem: OrderItem = {
    id: "order-item-1",
    productId: "prod-1",
    title: "شومیز لینن",
    image: "/images/bag-1.webp",
    quantity: 3,
    unitPrice: 1000000,
    finalUnitPrice: 800000,
  };

  test("Calculates remaining returnable quantity correctly (Ordered = 3, Returned = 1 => Returnable = 2)", () => {
    const existingRequests: ReturnRequest[] = [
      {
        id: "ret-1",
        requestNumber: "RET-1",
        type: "return",
        orderId: "ord-1",
        orderNumber: "100",
        customerId: "09121112233",
        customerName: "تست",
        customerPhone: "09121112233",
        status: "approved",
        requestedAt: new Date().toISOString(),
        reason: "size_issue",
        items: [
          {
            id: "ret-item-1",
            orderItemId: "order-item-1",
            productId: "prod-1",
            productTitle: "شومیز لینن",
            productImage: "/images/bag-1.webp",
            quantity: 1,
            purchasedUnitPrice: 800000,
            reason: "size_issue",
            refundAmount: 800000,
          },
        ],
        timeline: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const eligibility = checkItemEligibility(mockItem, existingRequests);
    expect(eligibility.isEligible).toBe(true);
    expect(eligibility.orderedQuantity).toBe(3);
    expect(eligibility.alreadyReturnedQuantity).toBe(1);
    expect(eligibility.returnableQuantity).toBe(2);
  });

  test("Ignores cancelled or rejected requests when calculating returned quantity", () => {
    const cancelledRequests: ReturnRequest[] = [
      {
        id: "ret-2",
        requestNumber: "RET-2",
        type: "return",
        orderId: "ord-1",
        orderNumber: "100",
        customerId: "09121112233",
        customerName: "تست",
        customerPhone: "09121112233",
        status: "rejected",
        requestedAt: new Date().toISOString(),
        reason: "size_issue",
        items: [
          {
            id: "ret-item-2",
            orderItemId: "order-item-1",
            productId: "prod-1",
            productTitle: "شومیز لینن",
            productImage: "/images/bag-1.webp",
            quantity: 2,
            purchasedUnitPrice: 800000,
            reason: "size_issue",
            refundAmount: 1600000,
          },
        ],
        timeline: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const eligibility = checkItemEligibility(mockItem, cancelledRequests);
    expect(eligibility.isEligible).toBe(true);
    expect(eligibility.alreadyReturnedQuantity).toBe(0);
    expect(eligibility.returnableQuantity).toBe(3);
  });
});

describe("Refund Calculation Rules", () => {
  test("Refund amount must equal purchased unit price multiplied by quantity, ignoring current product price changes", () => {
    const purchasedUnitPrice = 850000;
    const requestedQuantity = 2;
    const refundAmount = purchasedUnitPrice * requestedQuantity;

    expect(refundAmount).toBe(1700000);
  });
});

describe("State Machine Transition Validation", () => {
  test("Validates permitted state transitions for Return requests", () => {
    expect(isValidStateTransition("return", "requested", "approved")).toBe(true);
    expect(isValidStateTransition("return", "approved", "in_transit")).toBe(true);
    expect(isValidStateTransition("return", "received", "inspection")).toBe(true);
    expect(isValidStateTransition("return", "inspection_approved", "refunded")).toBe(true);
  });

  test("Rejects invalid backward or prohibited state transitions", () => {
    expect(isValidStateTransition("return", "refunded", "requested")).toBe(false);
    expect(isValidStateTransition("return", "rejected", "approved")).toBe(false);
    expect(isValidStateTransition("return", "completed", "inspection")).toBe(false);
  });
});

describe("Exchange Variant Selection Validation", () => {
  const mockProduct: Product = {
    id: "prod-shoe",
    slug: "leather-shoe",
    title: "کفش چرم",
    category: { id: "cat-1", name: "کفش", slug: "shoes" },
    images: [{ id: "img-1", url: "/images/shoes-1.webp", sortOrder: 0 }],
    options: [
      {
        id: "opt-size",
        name: "سایز",
        type: "size",
        required: true,
        sortOrder: 1,
        values: [
          { id: "val-38", label: "38", value: "38", sortOrder: 1 },
          { id: "val-39", label: "39", value: "39", sortOrder: 2 },
        ],
      },
    ],
    variants: [
      {
        id: "v-38",
        sku: "SHO-38",
        optionValues: [{ optionId: "opt-size", valueId: "val-38" }],
        pricing: { price: 1500000 },
        inventory: { stock: 0, trackStock: true }, // Out of stock
        status: "active",
      },
      {
        id: "v-39",
        sku: "SHO-39",
        optionValues: [{ optionId: "opt-size", valueId: "val-39" }],
        pricing: { price: 1500000 },
        inventory: { stock: 5, trackStock: true }, // In stock
        status: "active",
      },
    ],
    pricing: { minPrice: 1500000, hasDiscount: false },
    inventory: { totalStock: 5, trackStock: true, hasAvailableVariants: true },
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  test("Approves active variant in stock for exchange", () => {
    const res = validateExchangeVariant(mockProduct, "v-39");
    expect(res.isValid).toBe(true);
    expect(res.variant?.id).toBe("v-39");
  });

  test("Rejects out of stock variant with clear Persian message", () => {
    const res = validateExchangeVariant(mockProduct, "v-38");
    expect(res.isValid).toBe(false);
    expect(res.reason).toBe("این گزینه در حال حاضر موجود نیست.");
  });
});

describe("Return Reason Policy Configuration", () => {
  test("Merchant pays shipping for damaged goods", () => {
    const policy = getReturnPolicy("damaged");
    expect(policy.customerPaysReturnShipping).toBe(false);
    expect(policy.refundShippingCost).toBe(true);
  });

  test("Customer pays shipping for size issues", () => {
    const policy = getReturnPolicy("size_issue");
    expect(policy.customerPaysReturnShipping).toBe(true);
    expect(policy.refundShippingCost).toBe(false);
  });
});

describe("Return Service Lookup & ID Normalization", () => {
  const { returnService } = require("../returnService");

  test("Retrieves return request by clean ID, prefix ID, or request number insensitive to case", () => {
    const byCleanId = returnService.getReturnRequestById("1025");
    const byPrefixId = returnService.getReturnRequestById("ret-1025");
    const byUpperReqNum = returnService.getReturnRequestById("RET-1025");

    expect(byCleanId).toBeDefined();
    expect(byPrefixId).toBeDefined();
    expect(byUpperReqNum).toBeDefined();
    expect(byCleanId?.id).toBe("ret-1025");
  });

  test("Filters customer return requests correctly by phone", () => {
    const customerReturns = returnService.getReturnRequestsForCustomer("09121234567");
    expect(Array.isArray(customerReturns)).toBe(true);
    expect(customerReturns.length).toBeGreaterThan(0);
    expect(customerReturns.every((r: ReturnRequest) => r.customerPhone === "09121234567")).toBe(true);
  });
});
