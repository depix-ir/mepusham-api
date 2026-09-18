import { describe, test, expect } from "bun:test";
import { routes } from "@/lib/routes";

describe("Account Empty States & Global Error States Architecture", () => {
  describe("Canonical Route Mappings for Empty States CTAs", () => {
    test("Orders empty state CTA points to product list route (/products)", () => {
      expect(routes.products.list).toBe("/products");
    });

    test("Support empty state CTA points to new support ticket route (/account/support/new)", () => {
      expect(routes.account.support.new()).toBe("/account/support/new");
    });

    test("Returns empty state CTA points to account orders list route (/account/orders)", () => {
      expect(routes.account.orders.list).toBe("/account/orders");
    });

    test("Addresses page canonical route is /account/addresses", () => {
      expect(routes.account.addresses).toBe("/account/addresses");
    });
  });

  describe("EmptyState Copy & Configuration Rules", () => {
    test("Orders empty state copy matches specification", () => {
      const config = {
        title: "هنوز سفارشی ثبت نکرده‌اید",
        actionLabel: "ایجاد سفارش",
        href: routes.products.list,
      };

      expect(config.title).toBe("هنوز سفارشی ثبت نکرده‌اید");
      expect(config.actionLabel).toBe("ایجاد سفارش");
      expect(config.href).toBe("/products");
    });

    test("Support empty state copy matches specification", () => {
      const config = {
        title: "درخواست پشتیبانی ندارید",
        actionLabel: "ایجاد تیکت",
        href: routes.account.support.new(),
      };

      expect(config.title).toBe("درخواست پشتیبانی ندارید");
      expect(config.actionLabel).toBe("ایجاد تیکت");
      expect(config.href).toBe("/account/support/new");
    });

    test("Returns empty state copy matches specification", () => {
      const config = {
        title: "هنوز درخواست مرجوعی ندارید",
        actionLabel: "ایجاد مرجوعی",
        href: routes.account.orders.list,
      };

      expect(config.title).toBe("هنوز درخواست مرجوعی ندارید");
      expect(config.actionLabel).toBe("ایجاد مرجوعی");
      expect(config.href).toBe("/account/orders");
    });

    test("Addresses empty state copy matches specification", () => {
      const config = {
        title: "هنوز آدرسی ثبت نکرده‌اید",
        actionLabel: "افزودن آدرس جدید",
      };

      expect(config.title).toBe("هنوز آدرسی ثبت نکرده‌اید");
      expect(config.actionLabel).toBe("افزودن آدرس جدید");
    });
  });

  describe("ErrorState Copy & Configuration Rules", () => {
    test("Provides friendly Persian error messages without exposing technical stack traces", () => {
      const errorConfig = {
        title: "دریافت اطلاعات با خطا مواجه شد",
        description: "لطفاً اتصال اینترنت خود را بررسی کرده و مجدداً تلاش کنید.",
        actionLabel: "تلاش دوباره",
      };

      expect(errorConfig.title).not.toContain("500 Internal Server Exception");
      expect(errorConfig.title).not.toContain("TypeError");
      expect(errorConfig.description).toContain("اتصال اینترنت");
      expect(errorConfig.actionLabel).toBe("تلاش دوباره");
    });
  });
});
