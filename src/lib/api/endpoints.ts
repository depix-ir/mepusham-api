/**
 * Centralized API Endpoint Registry
 *
 * All route paths are extracted strictly from the Medusa v2 OpenAPI Specification (openAPI.yml).
 * Dynamic route helpers use `encodeURIComponent` to ensure route parameter safety.
 */

export const API_ENDPOINTS = {
  // Store Brands (Public)
  storeBrands: "/store/brands",
  storeBrand: (id: string) => `/store/brands/${encodeURIComponent(id)}`,

  // Admin Brands
  adminBrands: "/admin/brands",
  adminBrand: (id: string) => `/admin/brands/${encodeURIComponent(id)}`,

  // Store Categories (Public)
  storeCategories: "/store/categories",
  storeCategory: (id: string) => `/store/categories/${encodeURIComponent(id)}`,

  // Admin Categories
  adminCategories: "/admin/categories",
  adminCategory: (id: string) => `/admin/categories/${encodeURIComponent(id)}`,

  // Admin Media
  adminMediaUpload: "/admin/media/upload",
  adminMediaList: "/admin/media",
  adminMediaItem: (id: string) => `/admin/media/${encodeURIComponent(id)}`,

  // Store Reviews
  storeReviewMediaUpload: "/store/reviews/media",

  // Admin Store Settings & Addresses
  adminSettings: "/admin/settings",
  adminSettingsAddresses: "/admin/settings/addresses",
  adminSettingsAddress: (id: string) => `/admin/settings/addresses/${encodeURIComponent(id)}`,
  adminSettingsDefaultShippingAddress: "/admin/settings/default-shipping-address",
  adminSettingsDefaultReturnAddress: "/admin/settings/default-return-address",

  // Store Notifications
  storeNotifications: "/store/notifications",
  storeNotificationsUnreadCount: "/store/notifications/unread-count",
  storeNotificationsReadAll: "/store/notifications/read-all",
  storeNotificationRead: (id: string) => `/store/notifications/${encodeURIComponent(id)}/read`,

  // Admin Inventory
  adminInventoryHistory: "/admin/inventory/history",
  adminInventoryLowStock: "/admin/inventory/low-stock",

  // Support Tickets
  storeTickets: "/store/tickets",
  adminTickets: "/admin/tickets",

  // Size Guides
  adminSizeGuideTemplates: "/admin/size-guides/templates",
  storeProductSizeGuide: (productId: string) =>
    `/store/products/${encodeURIComponent(productId)}/size-guide`,

  // Admin Reports
  adminReportsMargin: "/admin/reports/margin",

  // Authentication
  authPhoneSendOtp: "/auth/phone/send-otp",
  authPhoneVerify: "/auth/phone/verify",
} as const;
