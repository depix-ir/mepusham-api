import {
  AdminLoginCredentials,
  AdminSession,
  AdminUser,
} from "@/types/adminAuth";

export const MOCK_SUPER_ADMIN: AdminUser = {
  id: "admin-super-1",
  name: "مدیر ارشد سیستم",
  username: "admin",
  email: "admin@mepusham.ir",
  phone: "09120000000",
  role: "super_admin",
  isActive: true,
  createdAt: "1403/01/01",
  updatedAt: "1403/01/01",
};

export const MOCK_ORDERS_ADMIN: AdminUser = {
  id: "admin-orders-1",
  name: "کارشناس سفارشات",
  username: "orders_admin",
  email: "orders@mepusham.ir",
  phone: "09121111111",
  role: "orders",
  isActive: true,
  createdAt: "1403/02/01",
  updatedAt: "1403/02/01",
};

export const MOCK_INVENTORY_ADMIN: AdminUser = {
  id: "admin-inventory-1",
  name: "مدیر انبار و محصولات",
  username: "inventory_admin",
  email: "inventory@mepusham.ir",
  phone: "09122222222",
  role: "inventory",
  isActive: true,
  createdAt: "1403/02/15",
  updatedAt: "1403/02/15",
};

export const MOCK_SUPPORT_ADMIN: AdminUser = {
  id: "admin-support-1",
  name: "پشتیبان مشتریان",
  username: "support_admin",
  email: "support@mepusham.ir",
  phone: "09123333333",
  role: "support",
  isActive: true,
  createdAt: "1403/03/01",
  updatedAt: "1403/03/01",
};

export const MOCK_INACTIVE_ADMIN: AdminUser = {
  id: "admin-inactive-1",
  name: "مدیر غیرفعال",
  username: "inactive_admin",
  email: "inactive@mepusham.ir",
  phone: "09124444444",
  role: "admin",
  isActive: false,
  createdAt: "1403/03/10",
  updatedAt: "1403/03/10",
};

const MOCK_ADMIN_ACCOUNTS: Array<{ user: AdminUser; passwordHash: string }> = [
  { user: MOCK_SUPER_ADMIN, passwordHash: "admin123" },
  { user: MOCK_ORDERS_ADMIN, passwordHash: "orders123" },
  { user: MOCK_INVENTORY_ADMIN, passwordHash: "inventory123" },
  { user: MOCK_SUPPORT_ADMIN, passwordHash: "support123" },
  { user: MOCK_INACTIVE_ADMIN, passwordHash: "admin123" },
];

const ADMIN_USERS_STORAGE_KEY = "mepusham_admin_users_db_v1";

/**
 * Interface for Admin Auth Adapter (API-Ready)
 */
export interface IAdminAuthAdapter {
  authenticate(credentials: AdminLoginCredentials): Promise<AdminSession>;
  validateSession(session: AdminSession): Promise<boolean>;
  getAdminUserById(id: string): Promise<AdminUser | null>;
  listAdminUsers(): Promise<AdminUser[]>;
  createAdminUser(
    data: Omit<AdminUser, "id" | "createdAt" | "updatedAt"> & { password?: string }
  ): Promise<AdminUser>;
  updateAdminUser(
    id: string,
    updates: Partial<Omit<AdminUser, "id" | "createdAt" | "updatedAt">>
  ): Promise<AdminUser>;
}

export class MockAdminAuthAdapter implements IAdminAuthAdapter {
  private getStoredUsers(): Array<{ user: AdminUser; passwordHash: string }> {
    if (typeof window === "undefined") return MOCK_ADMIN_ACCOUNTS;
    try {
      const stored = localStorage.getItem(ADMIN_USERS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(ADMIN_USERS_STORAGE_KEY, JSON.stringify(MOCK_ADMIN_ACCOUNTS));
        return MOCK_ADMIN_ACCOUNTS;
      }
      return JSON.parse(stored);
    } catch {
      return MOCK_ADMIN_ACCOUNTS;
    }
  }

  private saveStoredUsers(users: Array<{ user: AdminUser; passwordHash: string }>): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(ADMIN_USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error("Failed to save admin users to localStorage:", e);
    }
  }

  async authenticate(credentials: AdminLoginCredentials): Promise<AdminSession> {
    await new Promise((resolve) => setTimeout(resolve, 400)); // Simulate API network latency

    const input = credentials.username.trim().toLowerCase();
    const password = credentials.password || "";

    const users = this.getStoredUsers();
    const found = users.find(
      (item) =>
        item.user.username.toLowerCase() === input ||
        item.user.email.toLowerCase() === input ||
        item.user.phone === input
    );

    if (!found) {
      throw new Error("نام کاربری یا رمز عبور نامعتبر است.");
    }

    if (found.passwordHash !== password) {
      throw new Error("نام کاربری یا رمز عبور نامعتبر است.");
    }

    if (!found.user.isActive) {
      throw new Error("حساب کاربری شما غیرفعال شده است. لطفاً با مدیر ارشد تماس بگیرید.");
    }

    const now = new Date();
    const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours validity

    const session: AdminSession = {
      adminUserId: found.user.id,
      role: found.user.role,
      user: found.user,
      token: `mock-admin-token-${found.user.id}-${Date.now()}`,
      issuedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
    };

    return session;
  }

  async validateSession(session: AdminSession): Promise<boolean> {
    if (!session || !session.expiresAt || !session.adminUserId) return false;

    // Check expiration date
    const exp = new Date(session.expiresAt).getTime();
    if (Date.now() > exp) return false;

    // Check if user is active in DB
    const user = await this.getAdminUserById(session.adminUserId);
    if (!user || !user.isActive) return false;

    return true;
  }

  async getAdminUserById(id: string): Promise<AdminUser | null> {
    const users = this.getStoredUsers();
    const found = users.find((item) => item.user.id === id);
    return found ? found.user : null;
  }

  async listAdminUsers(): Promise<AdminUser[]> {
    const users = this.getStoredUsers();
    return users.map((item) => item.user);
  }

  async createAdminUser(
    data: Omit<AdminUser, "id" | "createdAt" | "updatedAt"> & { password?: string }
  ): Promise<AdminUser> {
    const users = this.getStoredUsers();

    // Check unique username
    if (users.some((u) => u.user.username.toLowerCase() === data.username.toLowerCase())) {
      throw new Error("این نام کاربری قبلاً ثبت شده است.");
    }

    const nowStr = new Date().toLocaleDateString("fa-IR");
    const newUser: AdminUser = {
      id: `admin-user-${Date.now()}`,
      name: data.name,
      username: data.username,
      email: data.email,
      phone: data.phone,
      role: data.role,
      isActive: data.isActive ?? true,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    users.push({
      user: newUser,
      passwordHash: data.password || "admin123",
    });

    this.saveStoredUsers(users);
    return newUser;
  }

  async updateAdminUser(
    id: string,
    updates: Partial<Omit<AdminUser, "id" | "createdAt" | "updatedAt">>
  ): Promise<AdminUser> {
    const users = this.getStoredUsers();
    const index = users.findIndex((u) => u.user.id === id);
    if (index === -1) {
      throw new Error("کاربر یافت نشد.");
    }

    const current = users[index].user;
    const updatedUser: AdminUser = {
      ...current,
      ...updates,
      updatedAt: new Date().toLocaleDateString("fa-IR"),
    };

    users[index].user = updatedUser;
    this.saveStoredUsers(users);
    return updatedUser;
  }
}
