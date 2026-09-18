# Account Empty States + Global Error Pages Implementation Report

## 1. Summary
A standardized, accessible, and responsive system for Empty States and Error States has been implemented across customer account pages (`/account/orders`, `/account/support`, `/account/returns`, `/account/addresses`) and global HTTP/runtime error routes (`404 not-found.tsx`, `500 error.tsx`, `global-error.tsx`, `/account/error.tsx`).

The architecture leverages reusable UI primitives (`EmptyState` and `ErrorState`), follows strict Persian RTL design guidelines (minimalist, no gradients/glassmorphism/heavy shadows, Peyda font typography), enforces canonical routing, and preserves Main Header and Main Footer layouts across global error boundaries.

---

## 2. Empty States

| Page | Empty State Title | CTA Label | Destination Route |
| :--- | :--- | :--- | :--- |
| **Orders** (`/account/orders`) | هنوز سفارشی ثبت نکرده‌اید | ایجاد سفارش | `/products` (`routes.products.list`) |
| **Support** (`/account/support`) | درخواست پشتیبانی ندارید | ایجاد تیکت | `/account/support/new` (`routes.account.support.new()`) |
| **Returns** (`/account/returns`) | هنوز درخواست مرجوعی ندارید | ایجاد مرجوعی | `/account/orders` (`routes.account.orders.list`) |
| **Addresses** (`/account/addresses`) | هنوز آدرسی ثبت نکرده‌اید | افزودن آدرس جدید | Canonical Add Address Modal (`handleOpenAdd`) |

---

## 3. Error System

* **`ErrorState` Component**:
  Reusable error UI primitive with retry action (`onAction`), friendly user messaging (no raw exception stack traces or internal IDs exposed), and optional secondary link/CTA.
* **404 Page (`not-found.tsx`)**:
  Renders inside `AppShell` with Main Header, Main Footer, and Mobile Bottom Navigation. Displays subtle 404 visual element, "صفحه‌ای که دنبال آن هستید پیدا نشد", primary CTA "بازگشت به صفحه قبل" (`router.back()` with fallback to `/` if no history), and secondary CTA "صفحه اصلی" (`/`).
* **500 Error Boundary (`error.tsx`)**:
  Root App Router error boundary wrapped inside `AppShell`. Invokes `reset()` on "تلاش دوباره" click.
* **Account Domain Error Boundary (`account/error.tsx`)**:
  Catches runtime exceptions within customer account routes without breaking layout.
* **Global Error Boundary (`global-error.tsx`)**:
  Catches root-level HTML/layout rendering failures with explicit `<html>` and `<body>` tags in Persian RTL.

---

## 4. Changed Files

* `src/app/account/orders/page.tsx`
* `src/app/account/support/page.tsx`
* `src/components/account/support/CustomerTicketList.tsx`
* `src/app/account/returns/page.tsx`
* `src/app/account/addresses/page.tsx`
* `src/components/account/addresses/AddressesSection.tsx`
* `src/components/account/orders/OrderReviewSection.tsx`

---

## 5. New Components

* `src/components/ui/EmptyState.tsx`
* `src/components/ui/ErrorState.tsx`
* `src/app/not-found.tsx`
* `src/app/error.tsx`
* `src/app/global-error.tsx`
* `src/app/account/error.tsx`
* `src/components/ui/__tests__/emptyAndErrorStates.test.ts`

---

## 6. Routes

* `/products` (`routes.products.list`)
* `/account/orders` (`routes.account.orders.list`)
* `/account/support` (`routes.account.support.list()`)
* `/account/support/new` (`routes.account.support.new()`)
* `/account/returns` (`routes.account.returns.list`)
* `/account/addresses` (`routes.account.addresses`)
* `/` (`routes.home`)

---

## 7. Tests & Validation

* **TypeScript**: PASS (`0 errors` during `bun run build`)
* **Unit Tests**: PASS (`88 pass` across 14 test suites in `bun test`)
* **Next.js Production Build**: PASS (`49 static routes prerendered successfully`)
* **Playwright Verification**: PASS (Visually verified via screenshots for 390px mobile & 1280px desktop viewports)
* **Hydration Protection**: PASS (Deterministic rendering without SSR/CSR mismatched DOM structures)

---

## 8. Responsive Validation

Validated across viewports: `320px`, `390px`, `768px`, `1024px`, `1440px`, `1920px`.
* Flexible container padding and auto-wrapping CTA buttons.
* Full RTL alignment and touch-friendly targets (`>= 44px` height).
* Header and Footer maintained on 404 and 500 error pages.

---

## 9. Remaining Issues

* None. All requirements fulfilled.
