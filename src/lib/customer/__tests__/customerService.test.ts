import { describe, expect, test, beforeEach } from "bun:test";
import { customerService } from "@/lib/customer/customerService";

describe("Customer Service Logic", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  });

  test("getCustomers retrieves customers list with summary stats", () => {
    const res = customerService.getCustomers();
    expect(res.total).toBeGreaterThan(0);
    expect(res.items.length).toBeGreaterThan(0);
    expect(res.summaryStats.totalCustomers).toBe(res.total);
    expect(res.summaryStats.activeCustomers).toBeGreaterThanOrEqual(0);
  });

  test("filtering customers by search query (name or phone)", () => {
    const allRes = customerService.getCustomers();
    const firstCustomer = allRes.items[0];

    const searchRes = customerService.getCustomers({ search: firstCustomer.firstName });
    expect(searchRes.items.some((c) => c.id === firstCustomer.id)).toBe(true);
  });

  test("filtering customers by status (active/inactive)", () => {
    const activeRes = customerService.getCustomers({ status: "active" });
    expect(activeRes.items.every((c) => c.status === "active")).toBe(true);
  });

  test("getCustomerById retrieves customer overview with orders, returns, tickets, addresses", () => {
    const allRes = customerService.getCustomers();
    const target = allRes.items[0];

    const overview = customerService.getCustomerById(target.id);
    expect(overview).toBeDefined();
    expect(overview?.customer.id).toBe(target.id);
    expect(Array.isArray(overview?.orders)).toBe(true);
    expect(Array.isArray(overview?.returns)).toBe(true);
    expect(Array.isArray(overview?.tickets)).toBe(true);
    expect(Array.isArray(overview?.addresses)).toBe(true);
  });

  test("toggleCustomerStatus switches customer between active and inactive", () => {
    const allRes = customerService.getCustomers();
    const target = allRes.items[0];

    const initialStatus = target.status;
    const toggledStatus = customerService.toggleCustomerStatus(target.id);
    expect(toggledStatus).not.toBe(initialStatus);

    const overviewAfter = customerService.getCustomerById(target.id);
    expect(overviewAfter?.customer.status).toBe(toggledStatus);
  });

  test("updateCustomerInfo updates customer profile name and phone", () => {
    const allRes = customerService.getCustomers();
    const target = allRes.items[0];

    const updated = customerService.updateCustomerInfo(target.id, {
      firstName: "علی",
      lastName: "رضایی",
    });

    expect(updated.firstName).toBe("علی");
    expect(updated.lastName).toBe("رضایی");
    expect(updated.fullName).toBe("علی رضایی");
  });
});
