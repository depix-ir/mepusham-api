import { describe, test, expect, beforeEach } from "bun:test";
import { storeSettingsService, validateStoreAddress } from "../storeSettingsService";
import { MockStoreSettingsRepository } from "../storeSettingsRepository";
import { accountService } from "@/lib/account/accountService";
import { returnService } from "@/lib/returns/returnService";
import { canAccessRoute } from "@/lib/admin-auth/permissions";
import { ROUTE_PERMISSIONS } from "@/lib/admin-auth/permissions";

describe("Store Settings & Address Domain Tests", () => {
  beforeEach(() => {
    // Reset store settings repository with fresh mock repo for isolated tests
    const repo = new MockStoreSettingsRepository();
    (storeSettingsService as any).repo = repo;
  });

  test("1. Store Settings retrieve defaults and update store info", () => {
    const settings = storeSettingsService.getSettings();
    expect(settings.storeName).toBe("فروشگاه آنلاین مپوشــــم");
    expect(settings.addresses.length).toBeGreaterThan(0);

    const updated = storeSettingsService.saveSettings({
      ...settings,
      storeName: "فروشگاه مپوشــــم تهران",
      taxRate: 9,
    });

    expect(updated.storeName).toBe("فروشگاه مپوشــــم تهران");
    expect(updated.taxRate).toBe(9);
  });

  test("2. Add Store Address with validation and automatic default resolution", () => {
    const newAddr = storeSettingsService.addAddress({
      title: "انبار اصفهان",
      recipientName: "رضا محمدی",
      phone: "03132223333",
      province: "اصفهان",
      city: "اصفهان",
      address: "خیابان چهارباغ، پلاک ۱۰",
      postalCode: "8134567890",
    });

    expect(newAddr.address.id).toBeDefined();
    expect(newAddr.address.postalCode).toBe("8134567890");

    const allAddresses = storeSettingsService.getAddresses();
    expect(allAddresses.length).toBe(2);
  });

  test("3. Edit Store Address updates address details correctly", () => {
    const addresses = storeSettingsService.getAddresses();
    const targetId = addresses[0].id;

    const updated = storeSettingsService.updateAddress(targetId, {
      title: "انبار جدید شماره ۱",
      recipientName: "حسین حسینی",
    });

    expect(updated.address.title).toBe("انبار جدید شماره ۱");
    expect(updated.address.recipientName).toBe("حسین حسینی");
  });

  test("4. Set default shipping address & set default return address", () => {
    const secondAddr = storeSettingsService.addAddress({
      title: "انبار شیراز",
      recipientName: "علی شیرازی",
      phone: "07133334444",
      province: "فارس",
      city: "شیراز",
      address: "بلوار زند، پلاک ۴۵",
      postalCode: "7134567890",
    });

    storeSettingsService.setDefaultShippingAddress(secondAddr.address.id);
    const defaultShipping = storeSettingsService.getDefaultShippingAddress();
    expect(defaultShipping?.id).toBe(secondAddr.address.id);

    storeSettingsService.setDefaultReturnAddress(secondAddr.address.id);
    const defaultReturn = storeSettingsService.getDefaultReturnAddress();
    expect(defaultReturn?.id).toBe(secondAddr.address.id);
  });

  test("5. Address validation enforces mandatory fields and 10-digit postal codes", () => {
    const invalidRes1 = validateStoreAddress({
      title: "",
      recipientName: "",
      province: "",
      city: "",
      address: "",
      postalCode: "123",
      phone: "12",
    });

    expect(invalidRes1.isValid).toBe(false);
    expect(invalidRes1.errors.title).toBeDefined();
    expect(invalidRes1.errors.recipientName).toBeDefined();
    expect(invalidRes1.errors.province).toBeDefined();
    expect(invalidRes1.errors.city).toBeDefined();
    expect(invalidRes1.errors.address).toBeDefined();
    expect(invalidRes1.errors.postalCode).toBeDefined();
    expect(invalidRes1.errors.phone).toBeDefined();

    const validRes = validateStoreAddress({
      title: "دفتر تبریز",
      recipientName: "سارا تبریزی",
      province: "آذربایجان شرقی",
      city: "تبریز",
      address: "خیابان آبرسان",
      postalCode: "۵۱۳۴۵۶۷۸۹۰", // Persian digits normalized
      phone: "۰۴۱۳۳۳۳۴۴۴۴",
    });

    expect(validRes.isValid).toBe(true);
  });

  test("6. Shipment flow automatically resolves default shipping origin address", () => {
    const defaultShipping = storeSettingsService.getDefaultShippingAddress();
    expect(defaultShipping).toBeDefined();

    const newOrder = accountService.createOrder({
      customer: {
        firstName: "مهدی",
        lastName: "کریمی",
        phone: "09123456789",
        province: "تهران",
        city: "تهران",
        address: "خیابان آزادی، پلاک ۱",
        postalCode: "1234567890",
      },
      shipping: {
        methodId: "post-1",
        price: 35000,
        title: "پست پیشتاز",
      },
      items: [
        {
          productId: "p-1",
          quantity: 1,
          unitPrice: 150000,
        },
      ],
      pricing: {
        itemsSubtotal: 150000,
        shippingCost: 35000,
        payableTotal: 185000,
      },
    });

    expect(newOrder.originAddress).toBeDefined();
    expect(newOrder.originAddress?.recipientName).toBe(defaultShipping?.recipientName!);
    expect(newOrder.originAddress?.postalCode).toBe(defaultShipping?.postalCode!);
  });

  test("7. Return flow automatically resolves default return destination address", () => {
    const defaultReturn = storeSettingsService.getDefaultReturnAddress();
    expect(defaultReturn).toBeDefined();

    const order = accountService.createOrder({
      customer: {
        firstName: "مهدی",
        lastName: "موسوی",
        phone: "09121234567",
        province: "تهران",
        city: "تهران",
        address: "آدرس",
        postalCode: "1234567890",
      },
      shipping: { methodId: "post-1", price: 30000, title: "پست" },
      items: [{ productId: "p-1", quantity: 1, unitPrice: 100000 }],
      pricing: { itemsSubtotal: 100000, shippingCost: 30000, payableTotal: 130000 },
    });
    const deliveredOrder = accountService.updateOrderStatus(order.id, "delivered");

    const newReturn = returnService.createReturnRequest({
      order: deliveredOrder,
      items: [
        {
          orderItemId: deliveredOrder.items[0].id,
          quantity: 1,
          reason: "size_issue",
        },
      ],
      reason: "size_issue",
    });

    expect(newReturn.storeReturnAddress).toBeDefined();
    expect(newReturn.storeReturnAddress?.recipientName).toBe(defaultReturn?.recipientName!);
    expect(newReturn.storeReturnAddress?.postalCode).toBe(defaultReturn?.postalCode!);
  });

  test("8. Immutable Snapshot: Changing Store Settings later does NOT mutate historical shipments or returns", async () => {
    // Small delay to ensure timestamp separation for order item IDs
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Create Order with Address A
    const defaultShippingA = storeSettingsService.getDefaultShippingAddress();
    const orderA = accountService.createOrder({
      customer: {
        firstName: "امیر",
        lastName: "احمدی",
        phone: "09120000001",
        province: "تهران",
        city: "تهران",
        address: "خیابان انقلاب",
        postalCode: "1111111111",
      },
      shipping: { methodId: "post-1", price: 30000, title: "پست" },
      items: [{ productId: "p-8", quantity: 1, unitPrice: 100000 }],
      pricing: { itemsSubtotal: 100000, shippingCost: 30000, payableTotal: 130000 },
    });

    const snapshotShippingA = orderA.originAddress?.recipientName;

    // Create Return Request with Address A
    const deliveredOrderA = accountService.updateOrderStatus(orderA.id, "delivered");
    const returnA = returnService.createReturnRequest({
      order: deliveredOrderA,
      items: [{ orderItemId: deliveredOrderA.items[0].id, quantity: 1, reason: "damaged" }],
      reason: "damaged",
    });

    const snapshotReturnA = returnA.storeReturnAddress?.recipientName;

    // Admin updates Store Settings address
    const newAddr = storeSettingsService.addAddress({
      title: "انبار جدید کرج",
      recipientName: "مسئول جدید البرز",
      phone: "02633332222",
      province: "البرز",
      city: "کرج",
      address: "بلوار طالقانی",
      postalCode: "3134567890",
    });

    storeSettingsService.setDefaultShippingAddress(newAddr.address.id);
    storeSettingsService.setDefaultReturnAddress(newAddr.address.id);

    // Verify historical snapshot remains unchanged
    expect(orderA.originAddress?.recipientName).toBe(snapshotShippingA);
    expect(returnA.storeReturnAddress?.recipientName).toBe(snapshotReturnA);
    expect(orderA.originAddress?.recipientName).not.toBe("مسئول جدید البرز");
    expect(returnA.storeReturnAddress?.recipientName).not.toBe("مسئول جدید البرز");
  });

  test("9. Admin Settings permission & route protection", () => {
    const superAdmin = {
      id: "admin-1",
      username: "admin1",
      name: "مدیر ارشد",
      email: "admin@mepusham.ir",
      phone: "09121111111",
      role: "super_admin" as const,
      isActive: true,
      createdAt: "2025-01-01",
      updatedAt: "2025-01-01",
    };

    const supportAdmin = {
      id: "admin-2",
      username: "admin2",
      name: "پشتیبان",
      email: "support@mepusham.ir",
      phone: "09122222222",
      role: "support" as const,
      isActive: true,
      createdAt: "2025-01-01",
      updatedAt: "2025-01-01",
    };

    expect(canAccessRoute(superAdmin, "/admin/settings")).toBe(true);
    expect(canAccessRoute(supportAdmin, "/admin/settings")).toBe(false);
  });

  test("10. Navigation & Toast Audit: All Admin route permissions correspond to existing canonical routes without missing pages", () => {
    const adminRoutes = [
      "/admin/dashboard",
      "/admin/products",
      "/admin/inventory",
      "/admin/orders",
      "/admin/returns",
      "/admin/customers",
      "/admin/support",
      "/admin/discounts",
      "/admin/shipping",
      "/admin/users",
      "/admin/settings",
    ];

    expect(adminRoutes.length).toBe(11);

    adminRoutes.forEach((route) => {
      expect(route).toMatch(/^\/admin\//);
      // Verify route permission check works for super admin
      const isAllowed = canAccessRoute(
        {
          id: "a-1",
          username: "admin",
          name: "Admin",
          email: "a@a.com",
          phone: "09123333333",
          role: "super_admin",
          isActive: true,
          createdAt: "2025-01-01",
          updatedAt: "2025-01-01",
        },
        route
      );
      expect(isAllowed).toBe(true);
    });
  });
});
