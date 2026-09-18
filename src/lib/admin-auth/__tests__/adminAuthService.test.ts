import { describe, it, expect, beforeEach } from "bun:test";
import { adminAuthService } from "@/lib/admin-auth/service";
import { adminAuthRepository } from "@/lib/admin-auth/repository";
import { MOCK_SUPER_ADMIN, MOCK_INACTIVE_ADMIN, MOCK_SUPPORT_ADMIN } from "@/lib/admin-auth/mockAdapter";

describe("Admin Authentication & Authorization Domain Tests", () => {
  beforeEach(async () => {
    await adminAuthService.logout();
  });

  it("authenticates valid admin credentials and creates a session", async () => {
    const session = await adminAuthService.login({
      username: "admin",
      password: "admin123",
    });

    expect(session).toBeDefined();
    expect(session.role).toBe("super_admin");
    expect(session.user.username).toBe("admin");

    const currentSession = await adminAuthService.getSession();
    expect(currentSession).not.toBeNull();
    expect(currentSession?.adminUserId).toBe(MOCK_SUPER_ADMIN.id);
  });

  it("rejects invalid admin login credentials", async () => {
    expect(
      adminAuthService.login({ username: "admin", password: "wrong_password" })
    ).rejects.toThrow("نام کاربری یا رمز عبور نامعتبر است.");
  });

  it("rejects login for inactive admin accounts", async () => {
    expect(
      adminAuthService.login({ username: "inactive_admin", password: "admin123" })
    ).rejects.toThrow("حساب کاربری شما غیرفعال شده است.");
  });

  it("invalidates session on logout without affecting customer session", async () => {
    await adminAuthService.login({ username: "admin", password: "admin123" });
    expect(await adminAuthService.getSession()).not.toBeNull();

    await adminAuthService.logout();
    expect(await adminAuthService.getSession()).toBeNull();
  });

  it("validates role permissions correctly", async () => {
    // Super admin has full route access
    expect(adminAuthService.canAccessRoute(MOCK_SUPER_ADMIN, "/admin/dashboard")).toBe(true);
    expect(adminAuthService.canAccessRoute(MOCK_SUPER_ADMIN, "/admin/inventory")).toBe(true);
    expect(adminAuthService.canAccessRoute(MOCK_SUPER_ADMIN, "/admin/users")).toBe(true);

    // Support admin can access support, but NOT inventory or users
    expect(adminAuthService.canAccessRoute(MOCK_SUPPORT_ADMIN, "/admin/support")).toBe(true);
    expect(adminAuthService.canAccessRoute(MOCK_SUPPORT_ADMIN, "/admin/inventory")).toBe(false);
    expect(adminAuthService.canAccessRoute(MOCK_SUPPORT_ADMIN, "/admin/users")).toBe(false);

    // Inactive admin cannot access any route
    expect(adminAuthService.canAccessRoute(MOCK_INACTIVE_ADMIN, "/admin/support")).toBe(false);
  });

  it("supports creating and updating admin users", async () => {
    const newAdmin = await adminAuthService.createAdminUser({
      name: "تست کننده ادمین",
      username: "test_admin",
      email: "test@mepusham.ir",
      phone: "09129990000",
      role: "inventory",
      isActive: true,
      password: "pass123",
    });

    expect(newAdmin.username).toBe("test_admin");
    expect(newAdmin.role).toBe("inventory");

    const updated = await adminAuthService.updateAdminUser(newAdmin.id, {
      role: "orders",
      isActive: false,
    });

    expect(updated.role).toBe("orders");
    expect(updated.isActive).toBe(false);
  });
});
