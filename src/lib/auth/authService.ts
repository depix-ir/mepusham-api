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

class AuthService {
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

    // Simulate API network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

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

    // For mock implementation: accept any 6 digits (or fail if code is 000000)
    if (normalizedCode === "000000") {
      throw new Error("کد واردشده صحیح نیست. لطفاً دوباره تلاش کنید.");
    }

    await new Promise((resolve) => setTimeout(resolve, 700));

    let userFirstName = params.firstName?.trim() || mockDefaultUser.firstName;
    let userLastName = params.lastName?.trim() || mockDefaultUser.lastName;

    // Check if there is an existing session or stored user
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

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      } catch (err) {
        console.error("Failed to save auth session to localStorage:", err);
      }
    }

    return user;
  }

  /**
   * Retrieve current authenticated user from localStorage safely.
   */
  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
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
   * Update user profile (firstName, lastName).
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

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        try {
          const session: AuthSession = JSON.parse(stored);
          session.user = updatedUser;
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
        } catch (e) {
          console.error("Failed to update user profile in localStorage", e);
        }
      }
    }

    return updatedUser;
  }

  /**
   * Clear session.
   */
  async logout(): Promise<void> {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch (err) {
        console.error("Failed to clear auth session:", err);
      }
    }
  }

  /* ================= ADMIN AUTHENTICATION & AUTHORIZATION ================= */

  /**
   * Authenticate admin with credentials or dev bypass.
   */
  async loginAdmin(username: string, password: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Admin authentication check (mock implementation for API-readiness)
    if (
      (username === "admin" || username === "admin@mepusham.ir" || username === "09120000000") &&
      password === "admin123"
    ) {
      const session: AuthSession = {
        user: MOCK_ADMIN_USER,
        token: `admin-jwt-token-${Date.now()}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
      if (typeof window !== "undefined") {
        localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(session));
      }
      return MOCK_ADMIN_USER;
    }

    throw new Error("نام کاربری یا رمز عبور اشتباه است.");
  }

  /**
   * Retrieve current admin session safely.
   */
  getCurrentAdmin(): User | null {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(ADMIN_AUTH_KEY);
        if (stored) {
          const session: AuthSession = JSON.parse(stored);
          if (session && session.user && (session.user.role === "admin" || session.user.role === "super_admin")) {
            return session.user;
          }
        }
      } catch {
        // Fallback or ignore
      }
    }
    // Return mock admin by default in client-side dev mode if no admin session stored
    return MOCK_ADMIN_USER;
  }

  /**
   * Admin logout.
   */
  async logoutAdmin(): Promise<void> {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(ADMIN_AUTH_KEY);
      } catch (err) {
        console.error("Failed to clear admin session:", err);
      }
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

    const resourceNorm = resourceUserIdOrPhone.replace(/[\s-]/g, "");
    const userPhoneNorm = currentUser.phone.replace(/[\s-]/g, "");
    const userIdNorm = currentUser.id;

    return resourceNorm === userPhoneNorm || resourceNorm === userIdNorm;
  }
}

export const authService = new AuthService();
