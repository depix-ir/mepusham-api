import { describe, it, expect, beforeEach } from "bun:test";
import { authService } from "@/lib/auth/authService";
import { accountService } from "@/lib/account/accountService";
import { returnService } from "@/lib/returns/returnService";
import { supportService } from "@/lib/support/supportService";

describe("AUD-001 Customer Resource Ownership & IDOR Protection Tests", () => {
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
              first_name: "کاربر",
              last_name: "تست",
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

    const order = accountService.createOrder({
      customerId: user.id,
      customer: {
        firstName: "علی",
        lastName: "رضایی",
        phone: user.phone,
        province: "تهران",
        city: "تهران",
        address: "خیابان آزادی",
        postalCode: "1234567890",
      },
      shipping: { methodId: "post", price: 35000, title: "پست پیشتاز" },
      items: [{ productId: "prod-bag-01", quantity: 1, unitPrice: 1500000 }],
      pricing: { itemsSubtotal: 1500000, shippingCost: 35000, payableTotal: 1535000 },
    });
    const deliveredOrder = accountService.updateOrderStatus(order.id, "delivered");

    const createdReq = returnService.createReturnRequest({
      order: deliveredOrder,
      items: [{ orderItemId: deliveredOrder.items[0].id, quantity: 1, reason: "defect" }],
      reason: "defect",
    });

    const req = returnService.getReturnRequestByIdForCustomer(createdReq.id);
    expect(req).toBeDefined();
    expect(req?.customerPhone).toBe(user.phone);
  });

  it("4. Customer A accesses Customer B return -> DENY", async () => {
    // User A creates return
    const userA = await authService.verifyOtp({
      phone: "09121112233",
      code: "123456",
      mode: "login",
    });
    const orderA = accountService.createOrder({
      customerId: userA.id,
      customer: {
        firstName: "علی",
        lastName: "رضایی",
        phone: userA.phone,
        province: "تهران",
        city: "تهران",
        address: "خیابان آزادی",
        postalCode: "1234567890",
      },
      shipping: { methodId: "post", price: 35000, title: "پست پیشتاز" },
      items: [{ productId: "prod-bag-01", quantity: 1, unitPrice: 1500000 }],
      pricing: { itemsSubtotal: 1500000, shippingCost: 35000, payableTotal: 1535000 },
    });
    const deliveredOrderA = accountService.updateOrderStatus(orderA.id, "delivered");
    const returnA = returnService.createReturnRequest({
      order: deliveredOrderA,
      items: [{ orderItemId: deliveredOrderA.items[0].id, quantity: 1, reason: "defect" }],
      reason: "defect",
    });

    // User B attempts access
    await authService.verifyOtp({
      phone: "09129999999",
      code: "123456",
      mode: "login",
    });

    const req = returnService.getReturnRequestByIdForCustomer(returnA.id);
    expect(req).toBeUndefined();
  });

  it("5. Customer A accesses own support ticket -> PASS", async () => {
    const user = await authService.verifyOtp({
      phone: "09123456789",
      code: "123456",
      mode: "login",
    });

    const createdTicket = supportService.createTicket({
      customerId: user.id,
      customerName: `${user.firstName} ${user.lastName}`,
      customerPhone: user.phone,
      subject: "تست تیکت",
      category: "other",
      message: "پیام تست",
    });

    const ticket = supportService.getTicketByIdForCustomer(createdTicket.id);
    expect(ticket).toBeDefined();
    expect(ticket?.customerPhone).toBe(user.phone);
  });

  it("6. Customer A accesses Customer B ticket -> DENY", async () => {
    const userA = await authService.verifyOtp({
      phone: "09123456789",
      code: "123456",
      mode: "login",
    });
    const ticketA = supportService.createTicket({
      customerId: userA.id,
      customerPhone: userA.phone,
      subject: "تیکت کاربر A",
      category: "other",
      message: "پیام A",
    });

    await authService.verifyOtp({
      phone: "09128888888",
      code: "123456",
      mode: "login",
    });

    const ticket = supportService.getTicketByIdForCustomer(ticketA.id);
    expect(ticket).toBeUndefined();
  });

  it("7. Logged-out user -> DENY", async () => {
    await authService.logout();

    expect(accountService.getOrderByIdForCustomer("order-12458")).toBeUndefined();
    expect(returnService.getReturnRequestByIdForCustomer("ret-1024")).toBeUndefined();
    expect(supportService.getTicketByIdForCustomer("ticket-1001")).toBeUndefined();
  });

  it("8. Admin -> Allowed according to Admin permissions", async () => {
    // Create customer resource
    const customerOrder = accountService.createOrder({
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
    const deliveredCustomerOrder = accountService.updateOrderStatus(customerOrder.id, "delivered");
    const customerReturn = returnService.createReturnRequest({
      order: deliveredCustomerOrder,
      items: [{ orderItemId: deliveredCustomerOrder.items[0].id, quantity: 1, reason: "defect" }],
      reason: "defect",
    });
    const customerTicket = supportService.createTicket({
      customerId: "c_admin_test",
      customerPhone: "09127776655",
      subject: "تست ادمین",
      category: "other",
      message: "سلام",
    });

    await authService.loginAdmin("admin", "admin123");

    expect(accountService.getOrderByIdForCustomer(customerOrder.id)).toBeDefined();
    expect(returnService.getReturnRequestByIdForCustomer(customerReturn.id)).toBeDefined();
    expect(supportService.getTicketByIdForCustomer(customerTicket.id)).toBeDefined();
  });
});
