import { describe, test, expect, beforeEach, afterEach, mock } from "bun:test";
import { authService } from "@/lib/auth/authService";
import { ApiError } from "@/lib/api/client";

describe("OTP Phone Authentication Real API Integration Tests", () => {
  const originalFetch = global.fetch;

  beforeEach(async () => {
    await authService.logoutAdmin();
    await authService.logout();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test("1. Successfully sends OTP code via /auth/phone/send-otp", async () => {
    let capturedUrl = "";
    let capturedBody = "";

    global.fetch = mock(async (url: string | URL | Request, init?: RequestInit) => {
      capturedUrl = String(url);
      capturedBody = String(init?.body || "");
      return new Response(
        JSON.stringify({
          success: true,
          message: "کد تأیید به شماره شما ارسال شد.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }) as unknown as typeof fetch;

    const res = await authService.requestOtp({
      phone: "09123456789",
      mode: "login",
    });

    expect(capturedUrl).toBe("http://localhost:9000/auth/phone/send-otp");
    expect(capturedBody).toBe(JSON.stringify({ phone: "09123456789" }));
    expect(res.success).toBe(true);
    expect(res.message).toBe("کد تأیید به شماره شما ارسال شد.");
  });

  test("2. Rejects invalid mobile number before making API request", async () => {
    expect(
      authService.requestOtp({
        phone: "12345",
        mode: "login",
      })
    ).rejects.toThrow("شماره موبایل معتبر نیست");
  });

  test("3. Throws ApiError when /auth/phone/send-otp fails on server", async () => {
    global.fetch = mock(async () => {
      return new Response(
        JSON.stringify({
          message: "تعداد درخواست‌های بیش از حد مجاز",
          type: "rate_limit_error",
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }) as unknown as typeof fetch;

    expect(
      authService.requestOtp({
        phone: "09123456789",
        mode: "login",
      })
    ).rejects.toThrow("تعداد درخواست‌های بیش از حد مجاز");
  });

  test("4. Successfully verifies OTP code and creates customer session using server token", async () => {
    let capturedUrl = "";
    let capturedBody = "";

    global.fetch = mock(async (url: string | URL | Request, init?: RequestInit) => {
      capturedUrl = String(url);
      capturedBody = String(init?.body || "");
      return new Response(
        JSON.stringify({
          token: "server-real-jwt-token-999",
          customer: {
            id: "cust-101",
            phone: "09123456789",
            first_name: "مریم",
            last_name: "احمدی",
            created_at: "2026-01-01T00:00:00Z",
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }) as unknown as typeof fetch;

    const user = await authService.verifyOtp({
      phone: "09123456789",
      code: "123456",
      mode: "login",
    });

    expect(capturedUrl).toBe("http://localhost:9000/auth/phone/verify");
    expect(capturedBody).toBe(JSON.stringify({ phone: "09123456789", code: "123456" }));
    expect(user.id).toBe("cust-101");
    expect(user.phone).toBe("09123456789");
    expect(user.firstName).toBe("مریم");
    expect(user.lastName).toBe("احمدی");

    const loggedInUser = authService.getCurrentUser();
    expect(loggedInUser).toEqual(user);
  });

  test("5. Throws ApiError on invalid OTP verification code (400 Bad Request)", async () => {
    global.fetch = mock(async () => {
      return new Response(
        JSON.stringify({
          message: "کد واردشده اشتباه یا منقضی شده است.",
          type: "invalid_otp",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }) as unknown as typeof fetch;

    expect(
      authService.verifyOtp({
        phone: "09123456789",
        code: "999999",
        mode: "login",
      })
    ).rejects.toThrow("کد واردشده اشتباه یا منقضی شده است.");
  });

  test("6. Ensures mock default user data is NOT used when backend responds", async () => {
    global.fetch = mock(async () => {
      return new Response(
        JSON.stringify({
          token: "jwt-token-real",
          customer: {
            id: "real-customer-id",
            phone: "09129998877",
            first_name: "سارا",
            last_name: "کمالی",
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }) as unknown as typeof fetch;

    const user = await authService.verifyOtp({
      phone: "09129998877",
      code: "123456",
      mode: "login",
    });

    expect(user.id).toBe("real-customer-id");
    expect(user.firstName).toBe("سارا");
    expect(user.lastName).toBe("کمالی");
    expect(user.id).not.toContain("mock");
  });
});
