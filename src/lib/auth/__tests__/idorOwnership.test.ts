import { describe, it, expect, beforeEach } from "bun:test";
import { authService } from "@/lib/auth/authService";
import { accountService } from "@/lib/account/accountService";
import { returnService } from "@/lib/returns/returnService";
import { supportService } from "@/lib/support/supportService";

describe("AUD-001 Customer Resource Ownership & IDOR Protection Tests", () => {
  beforeEach(async () => {
    await authService.logoutAdmin();
    await authService.logout();
  });

  it("1. Customer A accesses own order -> PASS", async () => {
    const userA = await authService.verifyOtp({
      phone: "09121111111",
      code: "123456",
      mode: "login",
      firstName: "کاربر",
      lastName: "اول",
    });

    const order = accountService.createOrder({
      customerId: userA.id,
      customer: {
        firstName: userA.firstName,
        lastName: userA.lastName,
        phone: userA.phone,
        province: "تهران",
        city: "تهران",
        address: "خیابان ولیعصر",
        postalCode: "1234567890",
      },
      shipping: { methodId: "post", price: 35000, title: "پست پیشتاز" },
      items: [{ productId: "prod-bag-01", quantity: 1, unitPrice: 1500000 }],
      pricing: { itemsSubtotal: 1500000, shippingCost: 35000, payableTotal: 1535000 },
    });

    const fetched = accountService.getOrderByIdForCustomer(order.id);
    expect(fetched).toBeDefined();
    expect(fetched?.id).toBe(order.id);
  });

  it("2. Customer A accesses Customer B order -> DENY (returns undefined)", async () => {
    // Logged in as User B
    await authService.verifyOtp({
      phone: "09122222222",
      code: "123456",
      mode: "login",
      firstName: "کاربر",
      lastName: "دوم",
    });

    // Attempting to fetch order-12458 (which belongs to 09120000000)
    const fetched = accountService.getOrderByIdForCustomer("order-12458");
    expect(fetched).toBeUndefined();
  });

  it("3. Customer A accesses own return -> PASS", async () => {
    const user = await authService.verifyOtp({
      phone: "09121112233",
      code: "123456",
      mode: "login",
    });

    // ret-1024 in mock data belongs to customer 09121112233
    const req = returnService.getReturnRequestByIdForCustomer("ret-1024");
    expect(req).toBeDefined();
    expect(req?.customerPhone).toBe(user.phone);
  });

  it("4. Customer A accesses Customer B return -> DENY", async () => {
    await authService.verifyOtp({
      phone: "09129999999",
      code: "123456",
      mode: "login",
    });

    // ret-1024 belongs to 09121112233
    const req = returnService.getReturnRequestByIdForCustomer("ret-1024");
    expect(req).toBeUndefined();
  });

  it("5. Customer A accesses own support ticket -> PASS", async () => {
    const user = await authService.verifyOtp({
      phone: "09123456789",
      code: "123456",
      mode: "login",
    });

    // ticket-1001 belongs to 09123456789
    const ticket = supportService.getTicketByIdForCustomer("ticket-1001");
    expect(ticket).toBeDefined();
    expect(ticket?.customerPhone).toBe(user.phone);
  });

  it("6. Customer A accesses Customer B ticket -> DENY", async () => {
    await authService.verifyOtp({
      phone: "09128888888",
      code: "123456",
      mode: "login",
    });

    const ticket = supportService.getTicketByIdForCustomer("ticket-1001");
    expect(ticket).toBeUndefined();
  });

  it("7. Logged-out user -> DENY", async () => {
    await authService.logout();

    expect(accountService.getOrderByIdForCustomer("order-12458")).toBeUndefined();
    expect(returnService.getReturnRequestByIdForCustomer("ret-1024")).toBeUndefined();
    expect(supportService.getTicketByIdForCustomer("ticket-1001")).toBeUndefined();
  });

  it("8. Admin -> Allowed according to Admin permissions", async () => {
    await authService.loginAdmin("admin", "admin123");

    // Create order to ensure fresh state
    const order = accountService.createOrder({
      customerId: "c_admin_test",
      customer: {
        firstName: "تست",
        lastName: "ادمین",
        phone: "09127776655",
        province: "تهران",
        city: "تهران",
        address: "آدرس",
        postalCode: "1111111111",
      },
      shipping: { methodId: "post", price: 35000, title: "پست پیشتاز" },
      items: [{ productId: "prod-bag-01", quantity: 1, unitPrice: 1500000 }],
      pricing: { itemsSubtotal: 1500000, shippingCost: 35000, payableTotal: 1535000 },
    });

    expect(accountService.getOrderByIdForCustomer(order.id)).toBeDefined();
    expect(returnService.getReturnRequestByIdForCustomer("ret-1024")).toBeDefined();
    expect(supportService.getTicketByIdForCustomer("ticket-1001")).toBeDefined();
  });
});
