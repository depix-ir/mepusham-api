import { describe, test, expect, beforeEach, afterEach, mock } from "bun:test";
import { notificationsApiService } from "@/lib/services/notifications";
import { supportApiService } from "@/lib/services/support";
import { mediaApiService } from "@/lib/services/media";
import { sizeGuideApiService } from "@/lib/services/sizeGuide";
import { inventoryApiService } from "@/lib/services/inventory";
import { storeSettingsApiService } from "@/lib/services/storeSettings";
import { reportsApiService } from "@/lib/services/reports";
import { OPENAPI_CONTRACT_GAPS } from "@/lib/api/contractGaps";

describe("Phase 6 Supplementary Features API Integration Tests", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:9000";
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("1. Customer Notifications API (/store/notifications)", () => {
    test("listNotifications calls GET /store/notifications", async () => {
      let requestedUrl = "";
      global.fetch = mock(async (url: string | URL | Request) => {
        requestedUrl = String(url);
        return new Response(
          JSON.stringify({
            notifications: [
              {
                id: "notif-1",
                receiver_id: "cust-1",
                channel: "in_app",
                template: "order_shipped",
                data: { title: "سفارش ارسال شد" },
                created_at: new Date().toISOString(),
              },
            ],
            count: 1,
            offset: 0,
            limit: 20,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }) as unknown as typeof fetch;

      const res = await notificationsApiService.listNotifications({ limit: 10 });
      expect(requestedUrl).toBe("http://localhost:9000/store/notifications?limit=10");
      expect(res.notifications).toHaveLength(1);
      expect(res.notifications[0].id).toBe("notif-1");
    });

    test("getUnreadCount calls GET /store/notifications/unread-count", async () => {
      let requestedUrl = "";
      global.fetch = mock(async (url: string | URL | Request) => {
        requestedUrl = String(url);
        return new Response(JSON.stringify({ count: 3 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }) as unknown as typeof fetch;

      const res = await notificationsApiService.getUnreadCount();
      expect(requestedUrl).toBe("http://localhost:9000/store/notifications/unread-count");
      expect(res.count).toBe(3);
    });

    test("markAllAsRead calls POST /store/notifications/read-all", async () => {
      let methodUsed = "";
      global.fetch = mock(async (_url: string | URL | Request, init?: RequestInit) => {
        methodUsed = init?.method || "GET";
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }) as unknown as typeof fetch;

      const res = await notificationsApiService.markAllAsRead();
      expect(methodUsed).toBe("POST");
      expect(res.success).toBe(true);
    });

    test("markSingleAsRead calls POST /store/notifications/:id/read", async () => {
      let requestedUrl = "";
      global.fetch = mock(async (url: string | URL | Request) => {
        requestedUrl = String(url);
        return new Response(
          JSON.stringify({
            notification: {
              id: "notif-1",
              receiver_id: "cust-1",
              channel: "in_app",
              template: "order_shipped",
              data: {},
              read_at: new Date().toISOString(),
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }) as unknown as typeof fetch;

      const res = await notificationsApiService.markSingleAsRead("notif-1");
      expect(requestedUrl).toBe("http://localhost:9000/store/notifications/notif-1/read");
      expect(res.notification.read_at).toBeDefined();
    });
  });

  describe("2. Support Tickets API (/store/tickets, /admin/tickets)", () => {
    test("listStoreTickets calls GET /store/tickets", async () => {
      let requestedUrl = "";
      global.fetch = mock(async (url: string | URL | Request) => {
        requestedUrl = String(url);
        return new Response(
          JSON.stringify({
            tickets: [
              {
                id: "tkt-1",
                ticket_number: "TKT-2026-000001",
                customer_id: "cust-1",
                category_id: "shipping",
                subject: "تاخیر در ارسال",
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

    test("createStoreTicket calls POST /store/tickets", async () => {
      let capturedBody: unknown;
      global.fetch = mock(async (_url: string | URL | Request, init?: RequestInit) => {
        capturedBody = JSON.parse(String(init?.body || "{}"));
        return new Response(
          JSON.stringify({
            ticket: {
              id: "tkt-2",
              ticket_number: "TKT-2026-000002",
              customer_id: "cust-1",
              category_id: "product",
              subject: "سوال فنی",
              status: "open",
              priority: "high",
            },
          }),
          { status: 201, headers: { "Content-Type": "application/json" } }
        );
      }) as unknown as typeof fetch;

      const payload = {
        category_id: "product",
        subject: "سوال فنی",
        message: "توضیحات تست",
        priority: "high" as const,
      };

      const res = await supportApiService.createStoreTicket(payload);
      expect(capturedBody).toEqual(payload);
      expect(res.ticket.id).toBe("tkt-2");
    });

    test("listAdminTickets calls GET /admin/tickets", async () => {
      let requestedUrl = "";
      global.fetch = mock(async (url: string | URL | Request) => {
        requestedUrl = String(url);
        return new Response(JSON.stringify({ tickets: [], count: 0 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }) as unknown as typeof fetch;

      const res = await supportApiService.listAdminTickets({ status: "open" });
      expect(requestedUrl).toBe("http://localhost:9000/admin/tickets?status=open");
      expect(res.tickets).toEqual([]);
    });
  });

  describe("3. Media Upload API (/admin/media/*, /store/reviews/media)", () => {
    test("uploadAdminMedia sends FormData to POST /admin/media/upload", async () => {
      let requestedUrl = "";
      global.fetch = mock(async (url: string | URL | Request) => {
        requestedUrl = String(url);
        return new Response(
          JSON.stringify({
            media: {
              id: "med-1",
              original_filename: "product.jpg",
              file_key: "keys/product.jpg",
              url: "http://localhost:9000/media/product.jpg",
            },
          }),
          { status: 201, headers: { "Content-Type": "application/json" } }
        );
      }) as unknown as typeof fetch;

      const fd = new FormData();
      const res = await mediaApiService.uploadAdminMedia(fd);
      expect(requestedUrl).toBe("http://localhost:9000/admin/media/upload");
      expect(res.media.url).toBe("http://localhost:9000/media/product.jpg");
    });

    test("uploadStoreReviewMedia sends FormData to POST /store/reviews/media", async () => {
      let requestedUrl = "";
      global.fetch = mock(async (url: string | URL | Request) => {
        requestedUrl = String(url);
        return new Response(
          JSON.stringify({
            url: "http://localhost:9000/reviews/user-photo.jpg",
          }),
          { status: 201, headers: { "Content-Type": "application/json" } }
        );
      }) as unknown as typeof fetch;

      const fd = new FormData();
      const res = await mediaApiService.uploadStoreReviewMedia(fd);
      expect(requestedUrl).toBe("http://localhost:9000/store/reviews/media");
      expect(res.url).toBe("http://localhost:9000/reviews/user-photo.jpg");
    });
  });

  describe("4. Size Guides API (/admin/size-guides/templates, /store/products/:id/size-guide)", () => {
    test("listTemplates calls GET /admin/size-guides/templates", async () => {
      let requestedUrl = "";
      global.fetch = mock(async (url: string | URL | Request) => {
        requestedUrl = String(url);
        return new Response(
          JSON.stringify({
            templates: [
              {
                id: "tpl-1",
                title: "راهنمای سایز پوشاک زنانه",
                columns: ["سایز", "دور سینه"],
                rows: [{ "0": "S", "1": "85" }],
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }) as unknown as typeof fetch;

      const res = await sizeGuideApiService.listTemplates();
      expect(requestedUrl).toBe("http://localhost:9000/admin/size-guides/templates");
      expect(res.templates).toHaveLength(1);
    });

    test("getStoreProductSizeGuide calls GET /store/products/:id/size-guide", async () => {
      let requestedUrl = "";
      global.fetch = mock(async (url: string | URL | Request) => {
        requestedUrl = String(url);
        return new Response(
          JSON.stringify({
            size_guide: {
              id: "tpl-1",
              title: "راهنمای سایز",
              columns: ["سایز"],
              rows: [],
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }) as unknown as typeof fetch;

      const res = await sizeGuideApiService.getStoreProductSizeGuide("prod-100");
      expect(requestedUrl).toBe("http://localhost:9000/store/products/prod-100/size-guide");
      expect(res.size_guide.title).toBe("راهنمای سایز");
    });
  });

  describe("5. Inventory API (/admin/inventory/*)", () => {
    test("getGlobalInventoryHistory calls GET /admin/inventory/history", async () => {
      let requestedUrl = "";
      global.fetch = mock(async (url: string | URL | Request) => {
        requestedUrl = String(url);
        return new Response(
          JSON.stringify({
            transactions: [
              {
                id: "tx-1",
                inventory_item_id: "item-1",
                location_id: "loc-1",
                quantity_change: 5,
                type: "adjustment",
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
      expect(requestedUrl).toBe("http://localhost:9000/admin/inventory/history");
      expect(res.transactions).toHaveLength(1);
    });

    test("getLowStockAlerts calls GET /admin/inventory/low-stock", async () => {
      let requestedUrl = "";
      global.fetch = mock(async (url: string | URL | Request) => {
        requestedUrl = String(url);
        return new Response(JSON.stringify({ items: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }) as unknown as typeof fetch;

      const res = await inventoryApiService.getLowStockAlerts({ threshold: 5 });
      expect(requestedUrl).toBe("http://localhost:9000/admin/inventory/low-stock?threshold=5");
      expect(res.items).toEqual([]);
    });
  });

  describe("6. Store Settings & Addresses API (/admin/settings/*)", () => {
    test("getStoreSettings calls GET /admin/settings", async () => {
      let requestedUrl = "";
      global.fetch = mock(async (url: string | URL | Request) => {
        requestedUrl = String(url);
        return new Response(
          JSON.stringify({
            id: "set-1",
            storeName: "مپوشم",
            contactPhone: "02188888888",
            supportEmail: "info@mepusham.ir",
            address: "تهران، خیابان ولیعصر",
            taxRate: 10,
            enableSmsNotifications: true,
            enableEmailNotifications: true,
            returnWindowDays: 2,
            autoApproveReturns: false,
            addresses: [],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }) as unknown as typeof fetch;

      const res = await storeSettingsApiService.getStoreSettings();
      expect(requestedUrl).toBe("http://localhost:9000/admin/settings");
      expect(res.storeName).toBe("مپوشم");
    });
  });

  describe("7. Admin Margin Reports API (/admin/reports/margin)", () => {
    test("getMarginReport calls GET /admin/reports/margin", async () => {
      let requestedUrl = "";
      global.fetch = mock(async (url: string | URL | Request) => {
        requestedUrl = String(url);
        return new Response(
          JSON.stringify({
            summary: {
              gross_sales: 10000000,
              net_sales: 9000000,
              cogs: 5000000,
              gross_profit: 4000000,
              gross_margin_percentage: 44.44,
            },
            breakdown: [],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }) as unknown as typeof fetch;

      const res = await reportsApiService.getMarginReport({ group_by: "day" });
      expect(requestedUrl).toBe("http://localhost:9000/admin/reports/margin?group_by=day");
      expect(res.summary.gross_profit).toBe(4000000);
    });
  });

  describe("8. Contract Gaps Alignment", () => {
    test("Verifies contract gaps are properly registered without fake endpoints", () => {
      const ticketGap = OPENAPI_CONTRACT_GAPS.find((g) => g.domain === "Support Tickets");
      expect(ticketGap).toBeDefined();

      const reviewGap = OPENAPI_CONTRACT_GAPS.find((g) => g.domain === "Product Reviews");
      expect(reviewGap).toBeDefined();

      const reportGap = OPENAPI_CONTRACT_GAPS.find((g) => g.domain === "Admin Reports");
      expect(reportGap).toBeDefined();

      const wishlistGap = OPENAPI_CONTRACT_GAPS.find((g) => g.domain === "Customer Wishlist");
      expect(wishlistGap).toBeDefined();
    });
  });
});
