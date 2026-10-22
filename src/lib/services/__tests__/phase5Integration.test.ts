import { describe, test, expect, beforeEach, afterEach, mock } from "bun:test";
import { supportApiService } from "@/lib/services/support";
import { notificationsApiService } from "@/lib/services/notifications";
import { storeSettingsApiService } from "@/lib/services/storeSettings";
import { inventoryApiService } from "@/lib/services/inventory";
import { mediaApiService } from "@/lib/services/media";
import { brandsApiService } from "@/lib/services/brands";
import { categoriesApiService } from "@/lib/services/categories";
import { storeSettingsService } from "@/lib/store-settings/storeSettingsService";
import { OPENAPI_CONTRACT_GAPS } from "@/lib/api/contractGaps";

if (typeof globalThis.localStorage === "undefined") {
  const memoryStore = new Map<string, string>();
  const mockLocalStorage: Storage = {
    getItem: (key: string) => memoryStore.get(key) ?? null,
    setItem: (key: string, val: string) => memoryStore.set(key, val),
    removeItem: (key: string) => memoryStore.delete(key),
    clear: () => memoryStore.clear(),
    key: (i: number) => Array.from(memoryStore.keys())[i] ?? null,
    get length() {
      return memoryStore.size;
    },
  };
  globalThis.localStorage = mockLocalStorage;
}

describe("Phase 5 - Customer Account & Admin Panel Backend API Integration Tests", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:9000";
    if (typeof localStorage !== "undefined") {
      localStorage.clear();
    }
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  /* -------------------------------------------------------------------------- */
  /* 1. Customer Support Tickets API                                             */
  /* -------------------------------------------------------------------------- */
  describe("1. Customer Support Tickets API (/store/tickets & /admin/tickets)", () => {
    test("listStoreTickets fetches tickets for authenticated customer", async () => {
      let requestedUrl = "";
      global.fetch = mock(async (url: string | URL | Request) => {
        requestedUrl = String(url);
        return new Response(
          JSON.stringify({
            tickets: [
              {
                id: "tkt-1",
                ticket_number: "TKT-2026-000001",
                customer_id: "c-1",
                category_id: "order",
                subject: "مشکل در ثبت سفارش",
                status: "open",
                priority: "normal",
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }) as unknown as typeof fetch;

      const res = await supportApiService.listStoreTickets();
      expect(requestedUrl).toBe("http://localhost:9000/store/tickets");
      expect(res.tickets).toHaveLength(1);
      expect(res.tickets[0].ticket_number).toBe("TKT-2026-000001");
    });

    test("createStoreTicket sends POST request to /store/tickets", async () => {
      let capturedBody: unknown;
      global.fetch = mock(async (_url: string | URL | Request, init?: RequestInit) => {
        capturedBody = JSON.parse(String(init?.body || "{}"));
        return new Response(
          JSON.stringify({
            ticket: {
              id: "tkt-2",
              ticket_number: "TKT-2026-000002",
              customer_id: "c-1",
              category_id: "delivery",
              subject: "تأخیر در ارسال مرسوله",
              status: "open",
              priority: "high",
            },
          }),
          { status: 201, headers: { "Content-Type": "application/json" } }
        );
      }) as unknown as typeof fetch;

      const payload = {
        category_id: "delivery",
        subject: "تأخیر در ارسال مرسوله",
        message: "سلام، کد رهگیری ارسال نشده است.",
        priority: "high" as const,
      };

      const res = await supportApiService.createStoreTicket(payload);
      expect(capturedBody).toEqual(payload);
      expect(res.ticket.ticket_number).toBe("TKT-2026-000002");
    });

    test("listAdminTickets fetches admin tickets with status and priority params", async () => {
      let requestedUrl = "";
      global.fetch = mock(async (url: string | URL | Request) => {
        requestedUrl = String(url);
        return new Response(
          JSON.stringify({ tickets: [], count: 0 }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }) as unknown as typeof fetch;

      await supportApiService.listAdminTickets({ status: "open", priority: "urgent" });
      expect(requestedUrl).toBe("http://localhost:9000/admin/tickets?status=open&priority=urgent");
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 2. Customer Notifications API                                              */
  /* -------------------------------------------------------------------------- */
  describe("2. Customer Notifications API (/store/notifications)", () => {
    test("listNotifications and getUnreadCount call backend endpoints", async () => {
      global.fetch = mock(async (url: string | URL | Request) => {
        const urlStr = String(url);
        if (urlStr.includes("/unread-count")) {
          return new Response(JSON.stringify({ count: 3 }), { status: 200, headers: { "Content-Type": "application/json" } });
        }
        return new Response(
          JSON.stringify({ notifications: [], count: 0, offset: 0, limit: 20 }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }) as unknown as typeof fetch;

      const unreadRes = await notificationsApiService.getUnreadCount();
      expect(unreadRes.count).toBe(3);

      const listRes = await notificationsApiService.listNotifications();
      expect(listRes.notifications).toEqual([]);
    });

    test("markAllAsRead and markSingleAsRead send POST calls", async () => {
      let methodUsed = "";
      global.fetch = mock(async (_url: string | URL | Request, init?: RequestInit) => {
        methodUsed = init?.method || "GET";
        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
      }) as unknown as typeof fetch;

      const res = await notificationsApiService.markAllAsRead();
      expect(methodUsed).toBe("POST");
      expect(res.success).toBe(true);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 3. Admin Store Settings & Addresses API                                    */
  /* -------------------------------------------------------------------------- */
  describe("3. Admin Store Settings & Store Addresses API (/admin/settings)", () => {
    test("getStoreSettings and updateStoreSettings function correctly", async () => {
      const mockSettings = {
        id: "settings-1",
        storeName: "مپوشم",
        contactPhone: "02188889999",
        supportEmail: "info@mepusham.ir",
        address: "تهران",
        taxRate: 10,
        enableSmsNotifications: true,
        enableEmailNotifications: true,
        returnWindowDays: 2,
        autoApproveReturns: false,
        addresses: [],
      };

      global.fetch = mock(async (_url: string | URL | Request, init?: RequestInit) => {
        if (init?.method === "PATCH") {
          return new Response(JSON.stringify({ ...mockSettings, storeName: "مپوشم آنلاین" }), { status: 200, headers: { "Content-Type": "application/json" } });
        }
        return new Response(JSON.stringify(mockSettings), { status: 200, headers: { "Content-Type": "application/json" } });
      }) as unknown as typeof fetch;

      const settings = await storeSettingsApiService.getStoreSettings();
      expect(settings.storeName).toBe("مپوشم");

      const updated = await storeSettingsApiService.updateStoreSettings({ storeName: "مپوشم آنلاین" });
      expect(updated.storeName).toBe("مپوشم آنلاین");
    });

    test("storeSettingsService integration with API methods", async () => {
      global.fetch = mock(async () => {
        return new Response(
          JSON.stringify({
            id: "settings-1",
            storeName: "فروشگاه مپوشم",
            contactPhone: "02188889999",
            supportEmail: "support@mepusham.ir",
            address: "تهران ونک",
            taxRate: 10,
            enableSmsNotifications: true,
            enableEmailNotifications: true,
            returnWindowDays: 2,
            autoApproveReturns: false,
            addresses: [
              {
                id: "addr-api-1",
                title: "انبار مرکزی",
                recipientName: "رضا امیری",
                phone: "09121112233",
                province: "تهران",
                city: "تهران",
                address: "خیابان ولیعصر",
                postalCode: "1234567890",
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }) as unknown as typeof fetch;

      const result = await storeSettingsService.fetchSettingsFromApi();
      expect(result.storeName).toBe("فروشگاه مپوشم");
      expect(result.addresses).toHaveLength(1);
      expect(result.addresses[0].id).toBe("addr-api-1");
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 4. Admin Inventory History & Low Stock Alerts                              */
  /* -------------------------------------------------------------------------- */
  describe("4. Admin Inventory History & Low Stock API (/admin/inventory/*)", () => {
    test("getGlobalInventoryHistory fetches audit transactions list", async () => {
      global.fetch = mock(async () => {
        return new Response(
          JSON.stringify({
            transactions: [
              {
                id: "inv-tx-1",
                inventory_item_id: "item-101",
                location_id: "loc-tehran",
                quantity_change: -2,
                type: "sale",
                description: "کاهش بابت ثبت سفارش",
              },
            ],
            count: 1,
            offset: 0,
            limit: 20,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }) as unknown as typeof fetch;

      const res = await inventoryApiService.getGlobalInventoryHistory();
      expect(res.transactions).toHaveLength(1);
      expect(res.transactions[0].quantity_change).toBe(-2);
    });

    test("getLowStockAlerts retrieves items below threshold", async () => {
      global.fetch = mock(async () => {
        return new Response(
          JSON.stringify({ items: [{ id: "item-low-1", stock: 2 }] }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }) as unknown as typeof fetch;

      const res = await inventoryApiService.getLowStockAlerts({ threshold: 5 });
      expect(res.items).toHaveLength(1);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 5. Admin Media Library API                                                 */
  /* -------------------------------------------------------------------------- */
  describe("5. Admin Media Library API (/admin/media/*)", () => {
    test("uploadAdminMedia sends FormData to /admin/media/upload", async () => {
      global.fetch = mock(async () => {
        return new Response(
          JSON.stringify({
            media: {
              id: "media-99",
              original_filename: "product.png",
              file_key: "products/product.png",
              url: "http://localhost:9000/media/product.png",
            },
          }),
          { status: 201, headers: { "Content-Type": "application/json" } }
        );
      }) as unknown as typeof fetch;

      const fd = new FormData();
      fd.append("file", new Blob(["test"]), "product.png");

      const res = await mediaApiService.uploadAdminMedia(fd);
      expect(res.media.id).toBe("media-99");
      expect(res.media.url).toBe("http://localhost:9000/media/product.png");
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 6. OpenAPI Contract Gaps Registry Audit                                    */
  /* -------------------------------------------------------------------------- */
  describe("6. OpenAPI Contract Gaps Registry Audit", () => {
    test("OPENAPI_CONTRACT_GAPS registers unsupported UI operations cleanly", () => {
      expect(OPENAPI_CONTRACT_GAPS.length).toBeGreaterThan(0);
      const productGap = OPENAPI_CONTRACT_GAPS.find((g) => g.domain === "Admin Products");
      expect(productGap).toBeDefined();
      expect(productGap?.status).toBe("unsupported_by_contract");

      const orderGap = OPENAPI_CONTRACT_GAPS.find((g) => g.domain === "Admin Orders");
      expect(orderGap).toBeDefined();
      expect(orderGap?.status).toBe("unsupported_by_contract");
    });
  });
});
