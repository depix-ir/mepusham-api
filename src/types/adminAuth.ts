export type AdminRole =
  | "super_admin"
  | "admin"
  | "orders"
  | "inventory"
  | "support";

export type AdminPermission =
  | "dashboard.view"
  | "products.view"
  | "products.create"
  | "products.update"
  | "products.delete"
  | "inventory.view"
  | "inventory.update"
  | "orders.view"
  | "orders.update"
  | "returns.view"
  | "returns.update"
  | "discounts.view"
  | "discounts.manage"
  | "support.view"
  | "support.manage"
  | "customers.view"
  | "customers.manage"
  | "users.view"
  | "users.manage"
  | "settings.view"
  | "settings.manage"
  | "shipping.view"
  | "shipping.manage";

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSession {
  adminUserId: string;
  role: AdminRole;
  user: AdminUser;
  token: string;
  issuedAt: string;
  expiresAt: string;
}

export interface AdminLoginCredentials {
  username: string; // username or phone or email
  password?: string;
}
