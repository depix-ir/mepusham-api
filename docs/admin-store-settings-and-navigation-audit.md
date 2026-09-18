# Admin Store Settings & Navigation Audit Report

## 1. Executive Summary
This document provides a comprehensive report on the implementation of Store-level Shipping Origin / Return Destination Address Management in Admin Settings (`/admin/settings`), along with a full Admin Navigation & Toast System Audit for the Persian RTL e-commerce platform.

---

## 2. Existing Architecture Before Changes
* **Settings:** `/admin/settings` previously contained inline mock state reading/writing directly to legacy `mepusham_settings_v1`.
* **Addresses:** Store addresses were not centralized in a single domain model, causing repeated typing or missing origin/destination information for shipments and returns.
* **Navigation & Toasts:** Navigation items in `ADMIN_NAV_ITEMS` (`src/components/admin/AdminSidebar.tsx`) triggered a false toast (`بخش «سفارش‌ها» به زودی اضافه خواهد شد.`) when clicking on `/admin/orders` because `handleNavItemClick` in `src/app/admin/layout.tsx` was missing `/admin/orders` in its allowed prefix check.

---

## 3. Store Settings Architecture & Single Source of Truth
* **Single Source of Truth:** `StoreSettings` and `StoreAddress` are managed via `storeSettingsService` (`src/lib/store-settings/storeSettingsService.ts`) and `MockStoreSettingsRepository` (`src/lib/store-settings/storeSettingsRepository.ts`).
* **Storage Key:** Persistence uses `mepusham_store_settings_v1` with automatic migration/sync fallback for legacy `mepusham_settings_v1`.
* **SSR Hydration Safety:** localStorage reads are strictly performed client-side after mount to guarantee zero SSR hydration mismatch.

---

## 4. Store Address Data Model
```typescript
export interface StoreAddress {
  id: string;
  title: string;
  recipientName: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  plaque?: string;
  floor?: string;
  postalCode: string; // Clean 10 digits without hyphens
}

export interface StoreSettings {
  storeName: string;
  contactPhone: string;
  supportEmail: string;
  address: string;
  taxRate: number;
  enableSmsNotifications: boolean;
  enableEmailNotifications: boolean;
  autoApproveReturns: boolean;
  returnWindowDays: number;
  addresses: StoreAddress[];
  defaultShippingAddressId?: string;
  defaultReturnAddressId?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 5. Repository / Service / Adapter
* `IStoreSettingsRepository` defines the contract for store settings persistence.
* `MockStoreSettingsRepository` implements `IStoreSettingsRepository` and abstracts local storage.
* `storeSettingsService` provides domain methods: `getSettings`, `saveSettings`, `addAddress`, `updateAddress`, `deleteAddress`, `setDefaultShippingAddress`, `setDefaultReturnAddress`, `getDefaultShippingAddress`, and `getDefaultReturnAddress`.

---

## 6. Address Validation Rules
* **Title, Recipient Name, Province, City, Address:** Mandatory non-empty strings.
* **Phone:** Digits normalized from Persian/Arabic, mandatory length 8-12 digits.
* **Postal Code:** Digits normalized from Persian/Arabic, exactly 10 digits, stripped of non-digit characters.

---

## 7. Shipping & Return Snapshot Integration
* **Orders:** `accountService.createOrder` captures an immutable `originAddress` snapshot from `storeSettingsService.getDefaultShippingAddress()`.
* **Returns:** `returnService.createReturnRequest` and `createExchangeRequest` capture an immutable `storeReturnAddress` snapshot from `storeSettingsService.getDefaultReturnAddress()`.
* **Snapshot Immutability:** Updating Store Settings at a later date does NOT mutate historical order or return snapshots.

---

## 8. Admin UI Enhancements
* **/admin/settings:** Added "آدرس‌های مبدا ارسال و مقصد مرجوعی فروشگاه" section with `StoreAddressModal` for address CRUD, default shipping/return selection badges, and empty/loading states.
* **AdminOrderDetailDrawer:** Displays "مبدا ارسال (فروشگاه)" using order snapshot or default shipping address. If unconfigured, displays an actionable warning banner with link to `/admin/settings`.
* **/admin/returns/[id]:** Displays "آدرس مقصد مرجوعی (انبار فروشگاه)" using return snapshot or default return address. If unconfigured, displays an actionable warning banner with link to `/admin/settings`.

---

## 9. Admin Navigation Audit Matrix

| Feature / Navigation Item | Route | Page Exists | Canonical Route | Navigation Source | Toast Behavior | Status |
|---|---|---|---|---|---|---|
| داشبورد | `/admin/dashboard` | Yes | `/admin/dashboard` | Sidebar, Header, Auth Guard | No false toast | Verified |
| محصولات | `/admin/products` | Yes | `/admin/products` | Sidebar, Dashboard | No false toast | Verified |
| موجودی | `/admin/inventory` | Yes | `/admin/inventory` | Sidebar, Dashboard | No false toast | Verified |
| سفارش‌ها | `/admin/orders` | Yes | `/admin/orders` | Sidebar, Dashboard, Header | Fixed (Removed false "coming soon" toast) | Verified |
| مرجوعی‌ها | `/admin/returns` | Yes | `/admin/returns` | Sidebar, Detail views | No false toast | Verified |
| مشتریان | `/admin/customers` | Yes | `/admin/customers` | Sidebar | No false toast | Verified |
| پشتیبانی | `/admin/support` | Yes | `/admin/support` | Sidebar, Dashboard | Fixed shortcut `/admin/tickets` -> `/admin/support` | Verified |
| تخفیف‌ها | `/admin/discounts` | Yes | `/admin/discounts` | Sidebar | No false toast | Verified |
| روش‌های ارسال | `/admin/shipping` | Yes | `/admin/shipping` | Sidebar | No false toast | Verified |
| کاربران و دسترسی‌ها | `/admin/users` | Yes | `/admin/users` | Sidebar | Added to `routes.admin` | Verified |
| تنظیمات | `/admin/settings` | Yes | `/admin/settings` | Sidebar, Header | Added store address management | Verified |

---

## 10. False Toast Root Causes & Fixes
* **Root Cause:** In `src/app/admin/layout.tsx`, `handleNavItemClick` was checking a hardcoded list of allowed route prefixes. `/admin/orders` was omitted from the condition, causing any click on "سفارش‌ها" to trigger `showToast("بخش «سفارش‌ها» به زودی اضافه خواهد شد.", "info")`.
* **Fix:** Updated `handleNavItemClick` so valid implemented navigation items navigate cleanly without false placeholder toasts.

---

## 11. Modified Files Summary

| File Path | What Changed | Why |
|---|---|---|
| `src/types/storeSettings.ts` | Added `StoreAddress` and `StoreSettings` domain interfaces. | Canonical type definitions for store address management. |
| `src/lib/store-settings/storeSettingsRepository.ts` | Created `IStoreSettingsRepository` and `MockStoreSettingsRepository`. | Repository abstraction for store settings persistence with migration fallback. |
| `src/lib/store-settings/storeSettingsService.ts` | Created `storeSettingsService` with address CRUD and validation. | Single source of truth for store addresses and default resolution. |
| `src/components/admin/settings/StoreAddressModal.tsx` | Created modal for store address add/edit with location picker and validation. | UI component for managing store address entries. |
| `src/app/admin/settings/page.tsx` | Integrated store address management section, default toggles, and service calls. | Admin UI for store origin and return address configuration. |
| `src/types/account.ts` | Added `StoreAddressSnapshot` and `originAddress` field to `Order`. | Support immutable origin address snapshot on orders. |
| `src/types/return.ts` | Added `storeReturnAddress` snapshot field to `ReturnRequest`. | Support immutable return destination snapshot on return requests. |
| `src/lib/account/accountService.ts` | Updated `createOrder` to capture default shipping origin snapshot. | Order snapshot immutability. |
| `src/lib/returns/returnService.ts` | Updated `createReturnRequest` and `createExchangeRequest` to capture return snapshot. | Return request snapshot immutability. |
| `src/components/admin/orders/AdminOrderDetailDrawer.tsx` | Rendered store origin address / actionable warning link to settings. | Admin Order Detail UI integration. |
| `src/app/admin/returns/[id]/page.tsx` | Rendered store return destination address / actionable warning link to settings. | Admin Return Detail UI integration. |
| `src/app/admin/layout.tsx` | Cleaned up `handleNavItemClick` false toast logic. | Fixed root cause of false "coming soon" toast on `/admin/orders`. |
| `src/lib/routes.ts` | Added `users`, `settings`, `login` to `routes.admin`. | Canonical routes map completeness. |
| `src/app/admin/dashboard/page.tsx` | Canonicalized shortcut link from `/admin/tickets` to `/admin/support`. | Fixed stale route reference in dashboard shortcuts. |
| `src/lib/store-settings/__tests__/storeSettings.test.ts` | Created 10 automated unit tests. | Verified CRUD, validation, snapshots, immutability, permissions, and navigation audits. |

---

## 12. Verification & Build Result
* **TypeScript & Build:** Next.js Turbopack build passed cleanly with 0 compilation or type errors.
* **Unit Tests:** 70/70 unit tests passed across 10 test files.
* **Browser Playwright Verification:** End-to-end CUJ verified in Chromium headless with video recording and screenshots.
