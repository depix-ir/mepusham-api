import { AdminLoginCredentials, AdminPermission, AdminSession, AdminUser } from "@/types/adminAuth";
import { adminAuthRepository, AdminAuthRepository } from "./repository";
import { canAccessRoute, hasAdminPermission } from "./permissions";

export class AdminAuthService {
  private repository: AdminAuthRepository;

  constructor(repository?: AdminAuthRepository) {
    this.repository = repository || adminAuthRepository;
  }

  /**
   * Authenticate admin user, validate, store session and set server cookie
   */
  async login(credentials: AdminLoginCredentials): Promise<AdminSession> {
    if (!credentials.username || !credentials.username.trim()) {
      throw new Error("لطفاً نام کاربری یا شماره موبایل را وارد کنید.");
    }
    if (!credentials.password || !credentials.password.trim()) {
      throw new Error("لطفاً رمز عبور را وارد کنید.");
    }

    const session = await this.repository.login(credentials);
    return session;
  }

  /**
   * Invalidate and clear admin session
   */
  async logout(): Promise<void> {
    this.repository.clearSession();
  }

  /**
   * Retrieve and validate current active admin session
   */
  async getSession(): Promise<AdminSession | null> {
    const session = this.repository.getStoredSession();
    if (!session) return null;

    const isValid = await this.repository.validateSession(session);
    if (!isValid) return null;

    // Refresh user object from source of truth in case role or active status changed
    const freshUser = await this.repository.getAdminUser(session.adminUserId);
    if (!freshUser || !freshUser.isActive) {
      this.repository.clearSession();
      return null;
    }

    session.user = freshUser;
    session.role = freshUser.role;
    return session;
  }

  /**
   * Synchronous accessor for initial client render / state hydration (does not trigger network)
   */
  getStoredSessionSync(): AdminSession | null {
    return this.repository.getStoredSession();
  }

  /**
   * Permissions check helper
   */
  hasPermission(admin: AdminUser | null, permission: AdminPermission): boolean {
    return hasAdminPermission(admin, permission);
  }

  /**
   * Route access check helper
   */
  canAccessRoute(admin: AdminUser | null, pathname: string): boolean {
    return canAccessRoute(admin, pathname);
  }

  async listAdminUsers(): Promise<AdminUser[]> {
    return this.repository.listAdminUsers();
  }

  async createAdminUser(
    data: Omit<AdminUser, "id" | "createdAt" | "updatedAt"> & { password?: string }
  ): Promise<AdminUser> {
    return this.repository.createAdminUser(data);
  }

  async updateAdminUser(
    id: string,
    updates: Partial<Omit<AdminUser, "id" | "createdAt" | "updatedAt">>
  ): Promise<AdminUser> {
    return this.repository.updateAdminUser(id, updates);
  }
}

export const adminAuthService = new AdminAuthService();
