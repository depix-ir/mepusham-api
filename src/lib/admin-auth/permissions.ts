import { AdminPermission, AdminRole, AdminUser } from "@/types/adminAuth";

/**
 * Role-to-Permissions map.
 * Defines fine-grained capabilities for each AdminRole.
 */
export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  super_admin: [
    "dashboard.view",
    "products.view",
    "products.create",
    "products.update",
    "products.delete",
    "inventory.view",
    "inventory.update",
    "orders.view",
    "orders.update",
    "returns.view",
    "returns.update",
    "discounts.view",
    "discounts.manage",
    "support.view",
    "support.manage",
    "customers.view",
    "customers.manage",
    "users.view",
    "users.manage",
    "settings.view",
    "settings.manage",
    "shipping.view",
    "shipping.manage",
  ],
  admin: [
    "dashboard.view",
    "products.view",
    "products.create",
    "products.update",
    "products.delete",
    "inventory.view",
    "inventory.update",
    "orders.view",
    "orders.update",
    "returns.view",
    "returns.update",
    "discounts.view",
    "discounts.manage",
    "support.view",
    "support.manage",
    "customers.view",
    "customers.manage",
    "settings.view",
    "shipping.view",
    "shipping.manage",
  ],
  orders: [
    "dashboard.view",
    "orders.view",
    "orders.update",
    "returns.view",
    "returns.update",
    "customers.view",
    "shipping.view",
  ],
  inventory: [
    "dashboard.view",
    "products.view",
    "products.create",
    "products.update",
    "inventory.view",
    "inventory.update",
  ],
  support: [
    "dashboard.view",
    "support.view",
    "support.manage",
    "customers.view",
    "orders.view",
    "returns.view",
  ],
};

/**
 * Mapping between URL path prefixes and required permissions.
 */
export const ROUTE_PERMISSIONS: Array<{ prefix: string; permission: AdminPermission }> = [
  { prefix: "/admin/products", permission: "products.view" },
  { prefix: "/admin/inventory", permission: "inventory.view" },
  { prefix: "/admin/orders", permission: "orders.view" },
  { prefix: "/admin/returns", permission: "returns.view" },
  { prefix: "/admin/discounts", permission: "discounts.view" },
  { prefix: "/admin/shipping", permission: "shipping.view" },
  { prefix: "/admin/support", permission: "support.view" },
  { prefix: "/admin/customers", permission: "customers.view" },
  { prefix: "/admin/users", permission: "users.view" },
  { prefix: "/admin/settings", permission: "settings.view" },
  { prefix: "/admin/dashboard", permission: "dashboard.view" },
  { prefix: "/admin", permission: "dashboard.view" },
];

/**
 * Helper to check if an Admin User has a specific permission.
 */
export function hasAdminPermission(
  admin: AdminUser | null,
  permission: AdminPermission
): boolean {
  if (!admin || !admin.isActive) return false;
  const permissions = ROLE_PERMISSIONS[admin.role] || [];
  return permissions.includes(permission);
}

/**
 * Helper to check if an Admin User can access a specific route pathname.
 */
export function canAccessRoute(admin: AdminUser | null, pathname: string): boolean {
  if (!admin || !admin.isActive) return false;

  // Login page is accessible without admin permissions check
  if (pathname === "/admin/login") return true;

  const matched = ROUTE_PERMISSIONS.find(
    (item) => pathname === item.prefix || pathname.startsWith(item.prefix + "/")
  );

  if (!matched) return true; // Default fallback if route not explicitly configured

  return hasAdminPermission(admin, matched.permission);
}
