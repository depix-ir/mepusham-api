import {
  User,
  AuthSession,
  RequestOtpParams,
  VerifyOtpParams,
} from "@/types/auth";
import { normalizeDigits, isValidIranianMobile } from "@/lib/checkout/validation";
import { mockDefaultUser } from "@/data/mockAccountData";

const AUTH_STORAGE_KEY = "mepusham_auth_session_v1";
const ADMIN_AUTH_KEY = "mepusham_admin_session_v1";

export const MOCK_ADMIN_USER: User = {
  id: "admin-1",
  phone: "09120000000",
  firstName: "مدیر",
  lastName: "سیستم",
  createdAt: "۱۴۰۳/۰۱/۰۱",
  role: "super_admin",
  email: "admin@mepusham.ir",
  isActive: true,
};

class MemoryStorageFallback implements Storage {
  private store = new Map<string, string>();
  get length() { return this.store.size; }
  clear() { this.store.clear(); }
  getItem(key: string) { return this.store.get(key) ?? null; }
  key(index: number) { return Array.from(this.store.keys())[index] ?? null; }
  removeItem(key: string) { this.store.delete(key); }
  setItem(key: string, value: string) { this.store.set(key, value); }
}

const fallbackStorage = new MemoryStorageFallback();

class AuthService {
  private getStorage(): Storage {
    if (typeof localStorage !== "undefined") return localStorage;
    if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
    return fallbackStorage;
  }

  /**
   * Request OTP for login or registration.
   */
  async requestOtp(params: RequestOtpParams): Promise<{
    success: boolean;
    message: string;
    cooldownSeconds?: number;
  }> {
    const normalizedPhone = normalizeDigits(params.phone).replace(/[\s-]/g, "");

    if (!normalizedPhone) {
      throw new Error("شماره موبایل را وارد کنید");
    }

    if (!isValidIranianMobile(normalizedPhone)) {
      throw new Error("شماره موبایل معتبر نیست (مثال: ۰۹۱۲۳۴۵۶۷۸۹)");
    }

    if (params.mode === "register") {
      if (!params.firstName?.trim()) {
        throw new Error("نام را وارد کنید");
      }
      if (!params.lastName?.trim()) {
        throw new Error("نام خانوادگی را وارد کنید");
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      success: true,
      message: "کد تأیید ۶ رقمی به شماره شما پیامک شد.",
      cooldownSeconds: 45,
    };
  }

  /**
   * Verify OTP code and restore or create session.
   */
  async verifyOtp(params: VerifyOtpParams): Promise<User> {
    const normalizedPhone = normalizeDigits(params.phone).replace(/[\s-]/g, "");
    const normalizedCode = normalizeDigits(params.code).replace(/\s/g, "");

    if (!normalizedCode || normalizedCode.length !== 6) {
      throw new Error("کد تأیید باید ۶ رقم باشد.");
    }

    if (normalizedCode === "000000") {
      throw new Error("کد واردشده صحیح نیست. لطفاً دوباره تلاش کنید.");
    }

    await new Promise((resolve) => setTimeout(resolve, 300));

    let userFirstName = params.firstName?.trim() || mockDefaultUser.firstName;
    let userLastName = params.lastName?.trim() || mockDefaultUser.lastName;

    const existing = this.getCurrentUser();
    if (existing && existing.phone === normalizedPhone) {
      userFirstName = existing.firstName || userFirstName;
      userLastName = existing.lastName || userLastName;
    }

    const user: User = {
      id: existing?.id || `user-${Date.now()}`,
      phone: normalizedPhone,
      firstName: userFirstName,
      lastName: userLastName,
      createdAt: existing?.createdAt || "۱۴۰۳/۰۵/۱۰",
      role: existing?.role || "customer",
      isActive: true,
    };

    const session: AuthSession = {
      user,
      token: `mock-jwt-token-${Date.now()}`,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const storage = this.getStorage();
    try {
      storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    } catch (err) {
      console.error("Failed to save auth session to storage:", err);
    }

    return user;
  }

  /**
   * Retrieve current authenticated customer user safely.
   */
  getCurrentUser(): User | null {
    const storage = this.getStorage();
    try {
      const stored = storage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;
      const session: AuthSession = JSON.parse(stored);
      if (session && session.user && session.user.phone) {
        return session.user;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Update user profile.
   */
  async updateProfile(updates: { firstName: string; lastName: string }): Promise<User> {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error("کاربر یافت نشد.");
    }

    const updatedUser: User = {
      ...user,
      firstName: updates.firstName.trim() || user.firstName,
      lastName: updates.lastName.trim() || user.lastName,
    };

    const storage = this.getStorage();
    const stored = storage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const session: AuthSession = JSON.parse(stored);
        session.user = updatedUser;
        storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      } catch (e) {
        console.error("Failed to update user profile in storage", e);
      }
    }

    return updatedUser;
  }

  /**
   * Clear customer session.
   */
  async logout(): Promise<void> {
    const storage = this.getStorage();
    try {
      storage.removeItem(AUTH_STORAGE_KEY);
    } catch (err) {
      console.error("Failed to clear auth session:", err);
    }
  }

  /* ================= ADMIN AUTHENTICATION & AUTHORIZATION ================= */

  /**
   * Authenticate admin with credentials or dev bypass.
   */
  async loginAdmin(username: string, password: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (
      (username === "admin" || username === "admin@mepusham.ir" || username === "09120000000") &&
      password === "admin123"
    ) {
      const session: AuthSession = {
        user: MOCK_ADMIN_USER,
        token: `admin-jwt-token-${Date.now()}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
      const storage = this.getStorage();
      storage.setItem(ADMIN_AUTH_KEY, JSON.stringify(session));
      return MOCK_ADMIN_USER;
    }

    throw new Error("نام کاربری یا رمز عبور اشتباه است.");
  }

  /**
   * Retrieve current admin session safely.
   */
  getCurrentAdmin(): User | null {
    const storage = this.getStorage();
    try {
      const stored = storage.getItem(ADMIN_AUTH_KEY);
      if (!stored) return null;
      const session = JSON.parse(stored);
      if (session && session.user && (session.user.role || session.role)) {
        return session.user;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Admin logout.
   */
  async logoutAdmin(): Promise<void> {
    const storage = this.getStorage();
    try {
      storage.removeItem(ADMIN_AUTH_KEY);
    } catch (err) {
      console.error("Failed to clear admin session:", err);
    }
  }

  /**
   * Validate Customer Ownership Security Guard.
   * Ensures customers can only access resources (orders, returns, tickets) owned by them.
   */
  validateOwnership(resourceUserIdOrPhone: string | undefined): boolean {
    const currentUser = this.getCurrentUser();
    const currentAdmin = this.getCurrentAdmin();

    // Admin has access to all customer resources
    if (currentAdmin) return true;

    if (!currentUser) return false;

    if (!resourceUserIdOrPhone) return true;

    const resourceNorm = resourceUserIdOrPhone.trim().toLowerCase();
    const resourceNormDigits = resourceNorm.replace(/[\s-]/g, "");

    const userPhoneNorm = currentUser.phone ? currentUser.phone.trim().toLowerCase() : "";
    const userPhoneNormDigits = userPhoneNorm.replace(/[\s-]/g, "");

    const userIdNorm = currentUser.id ? currentUser.id.trim().toLowerCase() : "";
    const userIdNormDigits = userIdNorm.replace(/[\s-]/g, "");

    return (
      resourceNorm === userIdNorm ||
      resourceNormDigits === userIdNormDigits ||
      resourceNorm === userPhoneNorm ||
      resourceNormDigits === userPhoneNormDigits
    );
  }
}

export const authService = new AuthService();
