import { AdminLoginCredentials, AdminSession, AdminUser } from "@/types/adminAuth";
import { IAdminAuthAdapter, MockAdminAuthAdapter } from "./mockAdapter";

export const ADMIN_SESSION_STORAGE_KEY = "mepusham_admin_session_v1";
export const ADMIN_AUTH_COOKIE_NAME = "mepusham_admin_auth_token";

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

export class AdminAuthRepository {
  private adapter: IAdminAuthAdapter;

  constructor(adapter?: IAdminAuthAdapter) {
    this.adapter = adapter || new MockAdminAuthAdapter();
  }

  private getStorage(): Storage {
    if (typeof localStorage !== "undefined") return localStorage;
    if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
    return fallbackStorage;
  }

  /**
   * Reads session safely from client storage
   */
  getStoredSession(): AdminSession | null {
    const storage = this.getStorage();
    try {
      const stored = storage.getItem(ADMIN_SESSION_STORAGE_KEY);
      if (!stored) return null;
      const session: AdminSession = JSON.parse(stored);
      return session;
    } catch {
      return null;
    }
  }

  /**
   * Saves session safely to client storage and syncs cookie
   */
  saveSession(session: AdminSession): void {
    const storage = this.getStorage();
    try {
      storage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(session));

      if (typeof document !== "undefined") {
        const expires = new Date(session.expiresAt).toUTCString();
        document.cookie = `${ADMIN_AUTH_COOKIE_NAME}=${session.token}; path=/; expires=${expires}; SameSite=Lax`;
      }
    } catch (e) {
      console.error("Failed to save admin session:", e);
    }
  }

  /**
   * Clears ONLY admin session data from storage & cookie without touching customer data
   */
  clearSession(): void {
    const storage = this.getStorage();
    try {
      storage.removeItem(ADMIN_SESSION_STORAGE_KEY);
      if (typeof document !== "undefined") {
        document.cookie = `${ADMIN_AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      }
    } catch (e) {
      console.error("Failed to clear admin session:", e);
    }
  }

  async login(credentials: AdminLoginCredentials): Promise<AdminSession> {
    const session = await this.adapter.authenticate(credentials);
    this.saveSession(session);
    return session;
  }

  async validateSession(session: AdminSession): Promise<boolean> {
    const isValid = await this.adapter.validateSession(session);
    if (!isValid) {
      this.clearSession();
    }
    return isValid;
  }

  async getAdminUser(id: string): Promise<AdminUser | null> {
    return this.adapter.getAdminUserById(id);
  }

  async listAdminUsers(): Promise<AdminUser[]> {
    return this.adapter.listAdminUsers();
  }

  async createAdminUser(
    data: Omit<AdminUser, "id" | "createdAt" | "updatedAt"> & { password?: string }
  ): Promise<AdminUser> {
    return this.adapter.createAdminUser(data);
  }

  async updateAdminUser(
    id: string,
    updates: Partial<Omit<AdminUser, "id" | "createdAt" | "updatedAt">>
  ): Promise<AdminUser> {
    return this.adapter.updateAdminUser(id, updates);
  }
}

export const adminAuthRepository = new AdminAuthRepository();
