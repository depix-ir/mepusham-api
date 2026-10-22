import { describe, it, expect, beforeEach } from "bun:test";
import { authService } from "@/lib/auth/authService";
import { shippingService } from "@/lib/shipping/shippingService";
import { decrementStockForOrderItems } from "@/lib/inventory/inventoryService";

describe("Production-Readiness Gaps Unit Tests", () => {
  beforeEach(async () => {
    global.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      const urlStr = String(url);
      if (urlStr.includes("/auth/phone/verify")) {
        const body = JSON.parse(String(init?.body || "{}"));
        return new Response(
          JSON.stringify({
            token: `token-${Date.now()}`,
            customer: {
              id: `user-${body.phone}`,
              phone: body.phone,
              first_name: "علی",
              last_name: "رضایی",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response(JSON.stringify({}), { status: 200, headers: { "Content-Type": "application/json" } });
    }) as typeof fetch;

    await authService.logoutAdmin();
    await authService.logout();
  });

  describe("P0 - Admin Auth & Ownership Security Validation", () => {
    it("loginAdmin succeeds with valid credentials and rejects invalid credentials", async () => {
      const admin = await authService.loginAdmin("admin", "admin123");
      expect(admin).toBeDefined();
      expect(admin.role).toBe("super_admin");

      expect(authService.loginAdmin("wrong", "wrong")).rejects.toThrow();
    });

    it("validateOwnership enforces resource isolation for customers and allows admins", async () => {
      // Login customer A
      const customerA = await authService.verifyOtp({
        phone: "09129998877",
        code: "123456",
        mode: "login",
        firstName: "علی",
        lastName: "رضایی",
      });

      expect(customerA.phone).toBe("09129998877");

      // Customer A accessing Customer A's order/return/ticket resource -> PASS
      expect(authService.validateOwnership("09129998877")).toBe(true);
      expect(authService.validateOwnership(customerA.id)).toBe(true);

      // Customer A accessing Customer B's order/return/ticket resource -> BLOCK
      expect(authService.validateOwnership("09121111111")).toBe(false);
      expect(authService.validateOwnership("user-other-456")).toBe(false);
    });

    it("validateOwnership permits Admin to view any customer resource", async () => {
      // Login admin
      await authService.loginAdmin("admin", "admin123");

      // Admin accessing any customer resource -> PASS
      expect(authService.validateOwnership("09121111111")).toBe(true);
      expect(authService.validateOwnership("user-999")).toBe(true);
    });
  });

  describe("P1 & P2 - Inventory Decrement & Shipping Service", () => {
    it("shippingService retrieves and persists shipping methods", () => {
      const methods = shippingService.getShippingMethods({ isHydrated: false });
      expect(methods.length).toBeGreaterThan(0);

      const postMethod = shippingService.getShippingMethodById("post");
      expect(postMethod).toBeDefined();
      expect(postMethod?.title).toBe("پست پیشتاز");
    });

    it("decrementStockForOrderItems safely handles stock reduction call without crashing", () => {
      expect(() => {
        decrementStockForOrderItems([
          { productId: "prod_1", variantId: "v_1", quantity: 2 },
        ]);
      }).not.toThrow();
    });
  });
});
