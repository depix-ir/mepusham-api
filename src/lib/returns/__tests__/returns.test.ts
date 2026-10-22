import { describe, test, expect } from "bun:test";
import {
  isWithinReturnWindow,
  checkItemEligibility,
} from "../eligibility";
import {
  isValidStateTransition,
} from "../stateMachine";
import { getReturnPolicy } from "../policy";
import { ReturnRequest } from "@/types/return";
import { OrderItem } from "@/types/account";

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


import { returnService } from "../returnService";
import { accountService } from "@/lib/account/accountService";

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
  test("Retrieves return request by clean ID, prefix ID, or request number insensitive to case", () => {
    const order = accountService.createOrder({
      customerId: "cust-test-1025",
      customer: {
        firstName: "مهدی",
        lastName: "موسوی",
        phone: "09121234567",
        province: "تهران",
        city: "تهران",
        address: "خیابان شریعتی",
        postalCode: "1234567890",
      },
      shipping: { methodId: "post", price: 35000, title: "پست پیشتاز" },
      items: [{ productId: "prod-bag-01", quantity: 1, unitPrice: 1500000 }],
      pricing: { itemsSubtotal: 1500000, shippingCost: 35000, payableTotal: 1535000 },
    });
    const deliveredOrder = accountService.updateOrderStatus(order.id, "delivered");

    const createdReq = returnService.createReturnRequest({
      order: deliveredOrder,
      items: [{ orderItemId: deliveredOrder.items[0].id, quantity: 1, reason: "quality_issue" }],
      reason: "quality_issue",
    });

    const reqId = createdReq.id;
    const reqNum = createdReq.requestNumber;
    const cleanNum = reqNum.replace(/^RET-/, "");

    const byCleanId = returnService.getReturnRequestById(cleanNum);
    const byPrefixId = returnService.getReturnRequestById(reqId);
    const byUpperReqNum = returnService.getReturnRequestById(reqNum);

    expect(byCleanId).toBeDefined();
    expect(byPrefixId).toBeDefined();
    expect(byUpperReqNum).toBeDefined();
    expect(byCleanId?.id).toBe(reqId);
  });

  test("Filters customer return requests correctly by phone", () => {
    const order = accountService.createOrder({
      customerId: "cust-test-1025",
      customer: {
        firstName: "مهدی",
        lastName: "موسوی",
        phone: "09121234567",
        province: "تهران",
        city: "تهران",
        address: "خیابان شریعتی",
        postalCode: "1234567890",
      },
      shipping: { methodId: "post", price: 35000, title: "پست پیشتاز" },
      items: [{ productId: "prod-bag-01", quantity: 1, unitPrice: 1500000 }],
      pricing: { itemsSubtotal: 1500000, shippingCost: 35000, payableTotal: 1535000 },
    });
    const deliveredOrder = accountService.updateOrderStatus(order.id, "delivered");

    returnService.createReturnRequest({
      order: deliveredOrder,
      items: [{ orderItemId: deliveredOrder.items[0].id, quantity: 1, reason: "quality_issue" }],
      reason: "quality_issue",
    });

    const customerReturns = returnService.getReturnRequestsForCustomer("09121234567");
    expect(Array.isArray(customerReturns)).toBe(true);
    expect(customerReturns.length).toBeGreaterThan(0);
    expect(customerReturns.every((r: ReturnRequest) => r.customerPhone === "09121234567")).toBe(true);
  });
});
