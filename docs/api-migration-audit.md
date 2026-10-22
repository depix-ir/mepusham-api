# گزارش ممیزی کامل پروژه Mepusham قبل از اتصال API (مرحله صفر)

تاریخ تنظیم: اسفند ۱۴۰۳ (مارس ۲۰۲۶)
پروژه: Mepusham (فروشگاه آنلاین پوشاک)
وضعیت پروژه: آماده برای اجرای فازبندی شده انتقال به API (Medusa v2 API Specification)

---

## ۱. نقشه ساختار پروژه (Project Structure Map)

### ۱.۱. اطلاعات پایه پروژه و ابزارها
- **فریم‌ورک فرانت‌اند**: Next.js 16.3.4 (App Router)
- **کتابخانه اصلی UI**: React 19.2.8 & React-DOM 19.2.8
- **استایل‌دهی**: Tailwind CSS v4 (`@tailwindcss/postcss`)
- **زبان**: TypeScript 5.9.3
- **آیکون‌ها و کامپوننت‌های بصری**: Lucide React 1.45.0 و Swiper 14.2.0
- **تست رانر (Test Runner)**: Bun test (v1.2.14) با تایپ‌های `@types/bun`
- **پکیج منجر (Package Manager)**: Bun (به همراه فایل‌های قفل `bun.lock` و `package-lock.json`)

### ۱.۲. ساختار پوشه‌ها و مسیرهای کلیدی
```
src/
├── app/                        # مسیرها و صفحات Next.js App Router
│   ├── (storefront)            # صفحات عمومی فروشگاه (صفحه اصلی، محصولات، دسته‌بندی، وبلاگ، قوانین)
│   ├── account/                # پنل کاربری مشتری (سفارش‌ها، مرجوعی‌ها، تیکت‌های پشتیبانی، آدرس‌ها، علاقه‌مندی‌ها)
│   ├── cart/                   # سبد خرید مشتری
│   ├── checkout/               # فرایند ثبت سفارش و تسویه حساب
│   ├── payment/                # صفحه شبیه‌سازی درگاه پرداخت
│   ├── order-confirmation/     # تأییدیه نهایی سفارش
│   ├── admin/                  # پنل مدیریت فروشگاه (محصولات، سفارش‌ها، مشتریان، انبار، تخفیف‌ها، وبلاگ، تنظیمات، پشتیبانی، مرجوعی)
│   ├── global-error.tsx        # مدیریت خطاهای سراسری Next.js
│   └── not-found.tsx           # صفحه ۴۰۴ سفارشی
├── components/                 # کامپوننت‌های مکرر UI
│   ├── ui/                     # کامپوننت‌های پایه (Button, Input, Badge, Toast, EmptyState, ErrorState, Typography, etc.)
│   ├── layout/                 # کامپوننت‌های ساختار صفحه (Header, Footer, Navigation, MegaMenu, MobileBottomBar)
│   ├── commerce/               # کامپوننت‌های تجاری (ProductCard, ProductFilterPanel, SortDropdown, SearchSuggestions)
│   ├── admin/                  # کامپوننت‌های اختصاصی پنل مدیریت (ایجاد برند/دسته، مدال‌ها، جدول‌ها، ویرایشگرها)
│   ├── wishlist/               # کامپوننت‌های اختصاصی لیست علاقه‌مندی‌ها
│   └── sections/               # بخش‌های صفحه اصلی (HeroSection, CategorySection, ProductGridSection, OfferSection)
├── store/                      # مدیریت وضعیت (State Management)
│   ├── cart/                   # Store سبد خرید، محاسبه قیمت، اعتبارسنجی
│   ├── wishlist/               # Store لیست علاقه مندی‌ها و همگام‌سازی با localStorage
│   ├── auth/                   # Store وضعیت احراز هویت مشتری
│   └── admin-auth/             # Store وضعیت احراز هویت مدیران
├── lib/                        # سرویس‌ها، ریپازیتوری‌ها و منطق تجاری
│   ├── api/                    # سرویس مرکزی HTTP client (`client.ts` و `config.ts`)
│   ├── services/               # سرویس‌های اتصال به OpenAPI (brands, categories, media, inventory, notifications, support, sizeGuide, storeSettings, reports, auth)
│   ├── repositories/           # ریپازیتوری‌های محلی Mock (catalogRepository, blogRepository)
│   ├── auth/ & admin-auth/     # سرویس‌های احراز هویت و مجوزها (Permissions, Session, Storage, Cookies)
│   ├── product/, blog/, etc.   # منطق دامنه‌ای محصولات، وبلاگ، تخفیف‌ها، مرجوعی، انبار، آدرس‌ها، راهنمای سایز
│   └── formatting/, search/    # فرمت‌دهی پول/تاریخ و الگوریتم‌های جستجو و پیشنهاد
├── data/                       # داده‌های اولیه و اولیه Mock Seed Data
│   ├── products.ts             # لیست محصولات، برندها و دسته‌بندی‌های پایه
│   ├── mockAccountData.ts      # سفارش‌ها، آدرس‌ها و اطلاعات مشتریان Mock
│   ├── mockPromotionData.ts    # کمپین‌ها و کد‌های تخفیف Mock
│   ├── mockReturnData.ts       # درخواست‌های مرجوعی Mock
│   ├── mockSupportData.ts      # تیکت‌ها و پیام‌های پشتیبانی Mock
│   ├── blogData.ts             # پست‌ها، دسته‌ها و تگ‌های وبلاگ Mock
│   ├── locations.ts            # لیست استان‌ها و شهرهای ایران
│   ├── shipping.ts             # روش‌های ارسال و هزینه‌ها
│   └── pdp-defaults.ts         # مقادیر پیش‌فرض صفحات محصول
└── types/                      # تایپ‌های TypeScript دامنه
```

---

## ۲. فهرست صفحات و قابلیت‌ها

### ۲.۱. فروشگاه و مشتری (Storefront)
1. **صفحه اصلی (`/`)**: نمایش اسلایدر هیرو، دسته‌بندی‌های محبوب، اسلایدر پیشنهاد ویژه، محصولات جدید و بنرهای تبلیغاتی.
2. **فهرست محصولات (`/products`)**: لیست محصولات با فیلتر دسته‌بندی/برند/قیمت/موجودی، مرتب‌سازی و صفحه‌بندی.
3. **صفحه جزئیات محصول (`/products/[slug]`)**: گالری تصاویر رسمی و نظرات، انتخاب متغیر (رنگ/سایز)، راهنمای سایز، جدول مشخصات، ثبت نظر، افزودن به سبد خرید و لیست علاقه‌مندی‌ها.
4. **صفحه دسته‌بندی (`/category/[slug]`)**: نمایش محصولات منطبق با دسته انتخابی.
5. **سبد خرید (`/cart`)**: مشاهده آیتم‌ها، تغییر تعداد، حذف آیتم، اعمال کد تخفیف، انتخاب روش ارسال، محاسبه قیمت کل.
6. **فرایند تسویه حساب (`/checkout`)**: انتخاب یا افزودن آدرس تحویلگیرنده، انتخاب روش ارسال، اعمال کد تخفیف، خلاصه فاکتور و انتقال به پرداخت.
7. **پرداخت (`/payment`)**: شبیه‌سازی درگاه پرداخت (موفقیت‌آمیز / ناموفق) و بروزرسانی وضعیت سفارش.
8. **تأییدیه سفارش (`/order-confirmation/[orderId]`)**: نمایش فاکتور خرید نهایی و شماره سفارش ثبت‌شده.
9. **وبلاگ (`/blog` و `/blog/[slug]`)**: لیست مقالات، فیلتر با دسته و تگ، جستجوی مقاله، مشاهده مقاله با زمان مطالعه تخمینی.
10. **صفحات عمومی**: قوانین (`/terms`)، حریم خصوصی (`/privacy`)، تماس با ما (`/contact`).

### ۲.۲. حساب کاربری مشتری (`/account`)
1. **داشبورد حساب (`/account`)**: مشاهده مشخصات مشتری و خلاصه‌ای از آخرین سفارش‌ها.
2. **سفارش‌ها (`/account/orders` و `/account/orders/[orderId]`)**: فهرست تاریخچه سفارش‌ها، جزئیات هر سفارش، دانلود/چاپ فاکتور.
3. **ثبت مرجوعی (`/account/orders/[orderId]/return`)**: فرم انتخاب آیتم‌های مرجوعی، علت مرجوعی و بارگذاری تصویر.
4. **پیگیری مرجوعی‌ها (`/account/returns` و `/account/returns/[id]`)**: لیست درخواست‌های مرجوعی ثبت‌شده و جزئیات وضعیت آن‌ها.
5. **پشتیبانی و تیکت‌ها (`/account/support`, `/account/support/new`, `/account/support/[ticketId]`)**: ایجاد تیکت جدید، ارسال پاسخ، پیگیری وضعیت تیکت.
6. **لیست آدرس‌ها (`/account/addresses`)**: مشاهده، افزودن، ویرایش و حذف آدرس‌های مشتری (با اعتبارسنجی کدپستی ۱۰ رقمی).
7. **لیست علاقه‌مندی‌ها (`/account/wishlist` و `/wishlist`)**: مشاهده و مدیریت محصولات ذخیره‌شده.

### ۲.۳. پنل مدیریت (`/admin`)
1. **ورود مدیران (`/admin/login`)**: فرم ورود با نام کاربری/رمزعبور و مدیریت نشست اداری.
2. **داشبورد اداری (`/admin/dashboard`)**: آمارهای کلیدی فروش، تعداد سفارش‌ها، مشتریان و نمودارهای گزارش‌گیری.
3. **مدیریت کاتالوگ و محصولات (`/admin/products`, `/admin/products/new`, `/admin/products/[id]`)**: ایجاد، ویرایش، حذف محصول، مدیریت متغیرها، گالری و راهنمای سایز.
4. **مدیریت دسته‌بندی‌ها و برندها (Modals در `/admin/products`)**: مدال ایجاد/ویرایش برند و دسته‌بندی.
5. **مدیریت سفارش‌ها (`/admin/orders`)**: لیست کلی سفارش‌ها، تغییر وضعیت سفارش، فیلترها، چاپ برگه سفارش (Printable Order Sheet).
6. **مدیریت انبار (`/admin/inventory` و `/admin/inventory/history`)**: مشاهده موجودی، تغییر دستی موجودی متغیرها، ثبت تغییرات و تاریخچه تراکنش‌های انبار.
7. **مدیریت مشتریان (`/admin/customers` و `/admin/customers/[customerId]`)**: مشاهده لیست مشتریان، ویرایش مشخصات، تغییر وضعیت حساب (فعال/غیرفعال).
8. **پشتیبانی مشتریان (`/admin/support` و `/admin/support/[ticketId]`)**: پاسخگویی به تیکت‌های مشتریان، پاسخ‌های سریع (Quick Replies)، تغییر وضعیت تیکت.
9. **مدیریت مرجوعی‌ها (`/admin/returns` و `/admin/returns/[id]`)**: بررسی درخواست‌های مرجوعی، تأیید/رد درخواست، تغییر وضعیت و انبارگردانی مرجوعی.
10. **تخفیف‌ها و کمپین‌ها (`/admin/discounts`, `/admin/discounts/campaigns`, `/admin/discounts/free-shipping`)**: تعریف کوپن‌های تخفیف، کمپین‌های پروموشن و قوانین ارسال رایگان.
11. **مدیریت وبلاگ (`/admin/blog`, `/admin/blog/new`, `/admin/blog/[postId]/edit`)**: ویرایشگر بلوکی مقالات، مدیریت دسته‌ها و تگ‌های وبلاگ.
12. **تنظیمات فروشگاه (`/admin/settings`)**: مشخصات فروشگاه، نرخ مالیات، مهلت مرجوعی، تنظیمات اعلان‌ها و مدیریت آدرس‌های انبار/مبدا ارسال و مقصد مرجوعی.

---

## ۳. شناسایی تمام منابع داده (Data Sources & Mocks)

پروژه Mepusham در حال حاضر یک معماری Hybrid Mock/Local Persistence کامل دارد که داده‌های اولیه را از فایل‌های seed خوانده و تغییرات را در `localStorage` ذخیره می‌کند.

### ۳.۱. فایل‌های Seed داده‌های Mock
1. `src/data/products.ts`: آرایه‌های محصولات اولیه (`initialProducts`)، برندها (`initialBrands`) و دسته‌بندی‌ها (`initialCategories`).
2. `src/data/mockAccountData.ts`: آدرس‌های اولیه مشتری (`mockInitialAddresses`) و سفارش‌های اولیه (`mockInitialOrders`).
3. `src/data/mockPromotionData.ts`: تخفیف‌ها (`mockInitialDiscounts`)، کمپین‌ها (`mockInitialCampaigns`) و قوانین ارسال رایگان (`mockInitialFreeShipping`).
4. `src/data/mockReturnData.ts`: درخواست‌های مرجوعی اولیه (`mockInitialReturnRequests`).
5. `src/data/mockSupportData.ts`: تیکت‌های اولیه پشتیبانی (`mockInitialTickets`) و پاسخ‌های سریع (`mockInitialQuickReplies`).
6. `src/data/blogData.ts`: پست‌های اولیه وبلاگ (`initialBlogPosts`)، دسته‌بندی‌های وبلاگ (`initialBlogCategories`) و تگ‌ها (`initialBlogTags`).
7. `src/data/locations.ts`: آرایه ثابت استان‌ها و شهرهای ایران (برای فیلتر و انتخاب آدرس).
8. `src/data/shipping.ts`: روش‌های ارسال ثابت (پست پیشتاز، پیک موتوری، تیپاکس).

### ۳.۲. سرویس‌ها و ریپازیتوری‌های محلی Mock
1. `src/lib/repositories/catalogRepository.ts`: مدیریت محصولات، برندها و دسته‌بندی‌ها با ذخیره‌سازی در `localStorage`.
2. `src/lib/repositories/blogRepository.ts`: مدیریت مقالات، دسته‌ها و تگ‌های وبلاگ با ذخیره‌سازی در `localStorage`.
3. `src/lib/account/accountService.ts`: مدیریت سفارش‌ها و آدرس‌های مشتری با ذخیره‌سازی در `localStorage`.
4. `src/lib/support/supportService.ts`: مدیریت تیکت‌ها و پیام‌های پشتیبانی با ذخیره‌سازی در `localStorage`.
5. `src/lib/returns/returnService.ts`: مدیریت درخواست‌های مرجوعی و تغییرات انبار مرجوعی با ذخیره‌سازی در `localStorage`.
6. `src/lib/promotions/promotionService.ts`: مدیریت کدهای تخفیف، کمپین‌ها و قوانین ارسال رایگان در `localStorage`.
7. `src/lib/inventory/inventoryService.ts`: مدیریت تراکنش‌های انبار و کاهش موجودی خریدهای ثبت‌شده در `localStorage`.
8. `src/lib/sizeguide/sizeGuideService.ts`: مدیریت قالب‌های راهنمای سایز و متصل به محصولات با ذخیره‌سازی در `localStorage`.
9. `src/lib/admin-auth/mockAdapter.ts`: اعتبارشخصی و مدیریت کاربران اداری با ذخیره‌سازی در `localStorage`.
10. `src/lib/customer/customerService.ts`: مدیریت حساب‌های مشتریان و وضعیت فعال/غیرفعال آن‌ها در `localStorage`.

---

## ۴. تمام نقاط استفاده از Storage (LocalStorage, SessionStorage, Cookies)

پروژه Mepusham برای شبیه‌سازی لایه دیتابیس در فرانت‌اند از کلیدهای `localStorage` و کوکی‌های لایه کلاینت استفاده می‌کند:

### ۴.۱. کلیدهای LocalStorage
| کلید LocalStorage | محل استفاده (فایل) | توضیحات |
| :--- | :--- | :--- |
| `mepusham_catalog_products_v1` | `src/lib/repositories/catalogRepository.ts` | ذخیره‌سازی لیست محصولات کاتالوگ |
| `mepusham_catalog_categories_v1` | `src/lib/repositories/catalogRepository.ts` | ذخیره‌سازی لیست دسته‌بندی‌ها |
| `mepusham_catalog_brands_v1` | `src/lib/repositories/catalogRepository.ts` | ذخیره‌سازی لیست برندها |
| `mepusham_blog_posts_v1` | `src/lib/repositories/blogRepository.ts` | ذخیره‌سازی مقالات وبلاگ |
| `mepusham_blog_categories_v1` | `src/lib/repositories/blogRepository.ts` | ذخیره‌سازی دسته‌بندی‌های وبلاگ |
| `mepusham_blog_tags_v1` | `src/lib/repositories/blogRepository.ts` | ذخیره‌سازی تگ‌های وبلاگ |
| `mepusham_addresses_v1` | `src/lib/account/accountService.ts` | ذخیره‌سازی آدرس‌های مشتریان |
| `mepusham_tickets_v1` | `src/lib/account/accountService.ts` & `supportService.ts` | ذخیره‌سازی تیکت‌های پشتیبانی |
| `mepusham_returns_v1` | `src/lib/returns/returnService.ts` | ذخیره‌سازی درخواست‌های مرجوعی |
| `mepusham_promotions_v1` | `src/lib/promotions/promotionService.ts` | ذخیره‌سازی تخفیف‌ها و کمپین‌ها |
| `mepusham_shipping_methods_v1` | `src/lib/shipping/shippingService.ts` | روش‌های ارسال سفارش |
| `mepusham_inventory_history_v1` | `src/lib/inventory/inventoryService.ts` | تاریخچه تراکنش‌های انبار |
| `mepusham_size_guide_templates_v1` | `src/lib/sizeguide/sizeGuideService.ts` | قالب‌های عمومی راهنمای سایز |
| `product_sizeguide_[productId]` | `src/lib/sizeguide/sizeGuideService.ts` | راهنمای سایز اختصاصی متصل به محصول |
| `mepusham_admin_users_v1` | `src/lib/admin-auth/mockAdapter.ts` | لیست حساب‌های مدیران سیستم |
| `mepusham_admin_session_v1` | `src/lib/admin-auth/repository.ts` | نشست فعال مدیر در سیستم |
| `mepusham_auth_session_v1` | `src/lib/auth/authService.ts` | نشست فعال مشتری در سیستم |
| `mepusham_customer_statuses_v1` | `src/lib/customer/customerService.ts` | وضعیت فعال/بلاک مشتریان |
| `mepusham_customer_profiles_v1` | `src/lib/customer/customerService.ts` | اطلاعات پروفایل مشتریان |
| `mepusham_store_settings_v1` | `src/lib/store-settings/storeSettingsRepository.ts` | تنظیمات کلی فروشگاه |
| `mepusham_cart_v1` | `src/store/cart/cart.persistence.ts` | ذخیره آیتم‌های سبد خرید |
| `mepusham_wishlist_v1` | `src/store/wishlist/wishlist.persistence.ts` | ذخیره لیست علاقه‌مندی‌ها |
| `mepusham_product_reviews_v1` | `src/lib/product/reviewService.ts` | ذخیره نظرات ثبت‌شده کاربران |

### ۴.۲. استفاده از Cookieها
- **`mepusham_admin_session_v1`**: در `src/lib/admin-auth/repository.ts` علاوه بر LocalStorage، در `document.cookie` نیز ذخیره می‌شود تا در Middleware یا هدرهای درخواست همگام شود.

---

## ۵. عملیات فرم‌ها و دکمه‌های بدون API واقعی

اکثر فرم‌ها و دکمه‌های موجود در سیستم در حال حاضر عملیات خود را روی `localStorage` یا State محلی انجام می‌دهند.

### ۵.۱. بخش مشتری و خریدار (Storefront)
1. **فرم ثبت‌نام / ورود مشتری (OTP)**:
   - *مسیر/کامپوننت*: `src/components/layout/MainHeader.tsx` و `src/lib/services/auth.ts`
   - *وضعیت*: به سرویس `auth.ts` متصل است اما لایه بک‌اند واقعی وجود ندارد و در صورت نبود API، کد ۱۲۳۴۵۶ را به شکل Mock تأیید می‌کند.
2. **افزودن به سبد خرید و مدیریت سبد خرید**:
   - *مسیر/کامپوننت*: `src/app/cart/page.tsx` و `src/store/cart/cart.store.tsx`
   - *وضعیت*: تمام محاسبات و افزودن/حذف در State زوستاند و `localStorage` اجرا می‌شود.
3. **ثبت سفارش در Checkout**:
   - *مسیر/کامپوننت*: `src/app/checkout/page.tsx`
   - *وضعیت*: سفارش جدید ایجاد کرده و به `mockInitialOrders` در LocalStorage اضافه می‌کند و موجودی محصول را محلی کاهش می‌دهد.
4. **فرم افزودن / ویرایش آدرس مشتری**:
   - *مسیر/کامپوننت*: `src/app/account/addresses/page.tsx`
   - *وضعیت*: ذخیره در `accountService` و کلید `mepusham_addresses_v1`.
5. **فرم ثبت تیکت پشتیبانی و ارسال پاسخ**:
   - *مسیر/کامپوننت*: `src/app/account/support/new/page.tsx` و `[ticketId]/page.tsx`
   - *وضعیت*: ایجاد و ذخیره در `supportService` متصل به `localStorage`.
6. **فرم ثبت مرجوعی**:
   - *مسیر/کامپوننت*: `src/app/account/orders/[orderId]/return/page.tsx`
   - *وضعیت*: ایجاد مرجوعی با کد پیگیری و ذخیره در `returnService` محلی.
7. **فرم ثبت نظر محصول**:
   - *مسیر/کامپوننت*: `src/components/pdp/ProductReviewSection.tsx` و `src/lib/product/reviewService.ts`
   - *وضعیت*: افزودن نظر به `mepusham_product_reviews_v1`.

### ۵.۲. بخش مدیریت (Admin Panel)
1. **فرم ایجاد و ویرایش محصول**:
   - *مسیر/کامپوننت*: `src/app/admin/products/new/page.tsx` و `[id]/page.tsx`
   - *وضعیت*: فراخوانی `catalogRepository.saveProduct` و ذخیره در `localStorage`.
2. **فرم‌های ایجاد برند و دسته‌بندی**:
   - *مسیر/کامپوننت*: `src/components/admin/CreateBrandModal.tsx` و `CreateCategoryModal.tsx`
   - *وضعیت*: متصل به فایل‌های Wrapper در `src/lib/services/brands.ts` و `categories.ts` (که در صورت نبود سرویس REST، روی `catalogRepository` فالبک می‌کنند).
3. **مدیریت موجودی و افزودن متغیر انبار**:
   - *مسیر/کامپوننت*: `src/app/admin/inventory/page.tsx` و drawers مربوطه
   - *وضعیت*: تغییر موجودی در `inventoryService` و ثبت در تاریخچه تراکنش‌های `localStorage`.
4. **پاسخگویی اداری به تیکت‌ها و مرجوعی‌ها**:
   - *مسیر/کامپوننت*: `src/app/admin/support/[ticketId]/page.tsx` و `src/app/admin/returns/[id]/page.tsx`
   - *وضعیت*: بروزرسانی وضعیت در `supportService` و `returnService`.
5. **تنظیمات فروشگاه و آدرس‌های مبدا/مقصد**:
   - *مسیر/کامپوننت*: `src/app/admin/settings/page.tsx`
   - *وضعیت*: فراخوانی `storeSettingsService` و ذخیره در LocalStorage.

---

## ۶. فهرست درخواست‌های HTTP فعلی (Existing HTTP Requests)

پروژه دارای یک Client مرکزی استاندارد در `src/lib/api/client.ts` است که URL پایه را از `src/lib/api/config.ts` (مقدار پیش‌فرض: `http://localhost:9000`) می‌خواند.

در حال حاضر سرویس‌های زیر در `src/lib/services/` برای فراخوانی API آماده‌سازی شده‌اند و طبق معماری با `apiClient` پیاده‌سازی شده‌اند:

| فایل سرویس | متد HTTP و Endpoint | کارکرد |
| :--- | :--- | :--- |
| `src/lib/services/brands.ts` | `GET /store/brands` | لیست عمومی برندهای فعال |
| | `GET /store/brands/{id}` | جزئیات برند عمومی |
| | `GET /admin/brands` | لیست برندها برای مدیریت |
| | `GET /admin/brands/{id}` | جزئیات برند برای مدیریت |
| | `POST /admin/brands` | ایجاد برند جدید |
| | `PUT /admin/brands/{id}` | ویرایش برند |
| | `DELETE /admin/brands/{id}` | حذف برند |
| `src/lib/services/categories.ts` | `GET /store/categories` | لیست عمومی دسته‌بندی‌ها |
| | `GET /store/categories/{id}` | جزئیات دسته عمومی |
| | `GET /admin/categories` | لیست دسته‌ها برای مدیریت |
| | `GET /admin/categories/{id}` | جزئیات دسته برای مدیریت |
| | `POST /admin/categories` | ایجاد دسته جدید |
| | `PUT /admin/categories/{id}` | ویرایش دسته |
| | `DELETE /admin/categories/{id}` | حذف دسته |
| `src/lib/services/media.ts` | `POST /admin/media/upload` | بارگذاری فایل رسانه |
| | `GET /admin/media` | لیست کتابخانه رسانه |
| | `GET /admin/media/{id}` | جزئیات رسانه |
| | `DELETE /admin/media/{id}` | حذف فایل رسانه |
| | `POST /store/reviews/media` | بارگذاری تصویر نظر مشتری |
| `src/lib/services/storeSettings.ts` | `GET /admin/settings` | دریافت تنظیمات فروشگاه |
| | `PATCH /admin/settings` | ویرایش تنظیمات فروشگاه |
| | `GET /admin/settings/addresses` | دریافت لیست آدرس‌های فروشگاه |
| | `POST /admin/settings/addresses` | ایجاد آدرس جدید برای فروشگاه |
| | `PATCH /admin/settings/addresses/{id}` | ویرایش آدرس فروشگاه |
| | `DELETE /admin/settings/addresses/{id}` | حذف آدرس فروشگاه |
| | `PUT /admin/settings/default-shipping-address` | تنظیم آدرس پیش‌فرض ارسال |
| | `PUT /admin/settings/default-return-address` | تنظیم آدرس پیش‌فرض مرجوعی |
| `src/lib/services/notifications.ts` | `GET /store/notifications` | لیست اعلانات مشتری |
| | `GET /store/notifications/unread-count` | تعداد اعلانات خوانده‌نشده |
| | `POST /store/notifications/read-all` | علامت‌گذاری همه اعلانات به عنوان خوانده‌شده |
| | `POST /store/notifications/{id}/read` | خوانده شدن یک اعلان |
| `src/lib/services/inventory.ts` | `GET /admin/inventory/history` | تاریخچه تراکنش‌های انبار |
| | `GET /admin/inventory/low-stock` | لیست محصولات با موجودی کم |
| `src/lib/services/support.ts` | `GET /store/tickets` | لیست تیکت‌های مشتری |
| | `POST /store/tickets` | ایجاد تیکت جدید |
| | `GET /admin/tickets` | لیست تیکت‌های پنل مدیریت |
| `src/lib/services/sizeGuide.ts` | `GET /admin/size-guides/templates` | لیست قالب‌های راهنمای سایز |
| | `POST /admin/size-guides/templates` | ایجاد قالب راهنمای سایز |
| | `GET /store/products/{id}/size-guide` | راهنمای سایز محصول |
| `src/lib/services/reports.ts` | `GET /admin/reports/margin` | گزارش مالی حاشیه سود |
| `src/lib/services/auth.ts` | `POST /auth/phone/send-otp` | ارسال کد پیامکی OTP |
| | `POST /auth/phone/verify` | تایید کد OTP و ورود |

---

## ۷. ماتریس اولیه اتصال هر قابلیت به API (Feature-to-API Matrix)

با تطبیق قابلیت‌های فرانت‌اند با سند `openAPI.yml` (قرارداد Medusa v2 Backend):

| قابلیت UI | مسیر صفحه / کامپوننت | منبع داده فعلی | Endpoint منطبق در openAPI.yml | وضعیت اتصال | ریسک جایگزینی |
| :--- | :--- | :--- | :--- | :--- | :--- |
| لیست و جزئیات برندها | `/admin/products`, modal | `brands.ts` / `catalogRepository` | `/store/brands`, `/admin/brands` | آماده سرویس (سرویس آماده است و قابلیت Fallback دارد) | پایین (پوشش کامل تست) |
| لیست و جزئیات دسته‌بندی‌ها | `/category/[slug]`, Modals | `categories.ts` / `catalogRepository` | `/store/categories`, `/admin/categories` | آماده سرویس | پایین |
| آپلود رسانه و گالری | `/admin/products/new`, reviews | `media.ts` / local blob | `/admin/media/upload`, `/store/reviews/media` | آماده سرویس | متوسط (نیازمند پشتیبانی سرور از multipart) |
| تنظیمات فروشگاه & آدرس‌ها | `/admin/settings` | `storeSettingsRepository` | `/admin/settings`, `/admin/settings/addresses` | آماده سرویس | پایین |
| اعلان‌های کاربری | `MainHeader.tsx` | `notifications.ts` | `/store/notifications` | آماده سرویس | پایین |
| انبار و تراکنش‌های انبار | `/admin/inventory` | `inventoryService` | `/admin/inventory/history`, `/admin/inventory/low-stock` | آماده سرویس | متوسط |
| تیکت‌های پشتیبانی | `/account/support`, `/admin/support` | `supportService` | `/store/tickets`, `/admin/tickets` | آماده سرویس | پایین |
| راهنمای سایز | PDP, `/admin/products` | `sizeGuideService` | `/admin/size-guides/templates`, `/store/products/{id}/size-guide` | آماده سرویس | پایین |
| گزارش حاشیه سود | `/admin/dashboard` | `reports.ts` | `/admin/reports/margin` | آماده سرویس | پایین |
| ورود پیامکی (OTP) | Modal ورود | `auth.ts` / mock code | `/auth/phone/send-otp`, `/auth/phone/verify` | آماده سرویس | متوسط |
| محصولات و متغیرهای کاتالوگ | `/products`, `/products/[slug]`, `/admin/products` | `catalogRepository` | *در openAPI با کاتالوگ مدوسا متصل می‌شود* | Mock | بالا (نیاز به همگام‌سازی ساختار متغیرها) |
| سبد خرید و ثبت سفارش | `/cart`, `/checkout` | `cart.store`, `accountService` | *در openAPI متصل خواهد شد* | Mock | بالا (نیاز به مدیریت Cart ID در مدوسا) |
| تخفیف‌ها و پروموشن‌ها | `/cart`, `/admin/discounts` | `promotionService` | *مطابق قوانین پروموشن مدوسا* | Mock | متوسط |
| درخواست‌های مرجوعی | `/account/returns`, `/admin/returns` | `returnService` | *مطابق فلو سفارشات مرجوعی* | Mock | متوسط |

---

## ۸. فهرست ریسک‌ها و وابستگی‌ها (Risks & Dependencies)

1. **مدیریت همزمان IDهای Mock و IDهای واقعی دیتابیس**:
   - *ریسک*: شناسه محصولات در Mock به صورت `prod-1` است در حالی که Medusa از ULID/UUID (`prod_01...`) استفاده می‌کند.
   - *راهکار*: استفاده از Adapter Pattern برای ترجمه IDها یا پاک‌سازی کلیدهای LocalStorage در زمان اتصال کامل به API.

2. **اعتبارسنجی احراز هویت و توکن‌های JWT**:
   - *ریسک*: در حال حاضر توکن‌های Mock در LocalStorage ذخیره می‌شوند. پس از اتصال واقعی به API، لزوم ارسال هدر `Authorization: Bearer <token>` یا استفاده از کوکی‌های `SameSite=Lax` به طور کاملاً سخت‌گیرانه مطرح می‌شود.
   - *راهکار*: هدرهای `client.ts` آماده است و نیازمند بررسی کوکی‌ها در محیط Production است.

3. **مدیریت ناهماهنگی State زوستاند سبد خرید و Medusa Cart**:
   - *ریسک*: سبد خرید فعلی فرانت‌اند به‌صورت کاملاً کلاینتی در زوستاند محاسبه می‌شود، اما بک‌اند Medusa محاسبه مالیات و تخفیف‌ها را روی سرور انجام می‌دهد.
   - *راهکار*: حفظ لایه Cart Store زوستاند و همگام‌سازی بی‌سروصدا با API بک‌اند.

4. **حفظ پایداری UI در زمان قطعی API (Graceful Fallback)**:
   - *ریسک*: در صورت قطع بودن بک‌اند محلی (`http://localhost:9000`)، UI نباید با خطای Crash مواجه شود.
   - *راهکار*: حفظ استراتژی فعلی سرویس‌ها که در صورت شکست شبکه به داده‌های محلی/پیش‌فرض Fallback می‌کنند.

---

## ۹. دستورات تست موجود و وضعیت فعلی (Test Suite Status)

### ۹.۱. دستورات اجرای تست در پروژه‌
در فایل `package.json` دستورات زیر تعریف شده‌اند:
- **اجرای کلی تست‌ها**: `bun test`
- **اجرای تست با حالت Watch**: `bun test --watch`
- **پوشش تست (Coverage)**: `bun test --coverage`
- **بررسی تایپ‌های TypeScript**: `bun run typecheck`
- **بررسی لینتر**: `bun run lint`

### ۹.۲. وضعیت فعلی تست‌ها
تمامی **۱۰۴ تست موجود در ۱۶ فایل تست** با موفقیت و بدون هیچ‌گونه خطایی اجرا می‌شوند:
```
104 pass
0 fail
380 expect() calls
Ran 104 tests across 16 files.
```

پوشش تست‌ها شامل تمامی بخش‌های حیاتی فرانت‌اند و منطق دامنه‌ای است:
- `src/lib/auth/__tests__/idorOwnership.test.ts` (تست‌های امنیت IDOR و مالکیت منابع)
- `src/lib/auth/__tests__/securityAndShipping.test.ts` (تست‌های امنیت و سرویس ارسال)
- `src/lib/admin-auth/__tests__/adminAuthService.test.ts` (تست‌های ورود و مجوزهای مدیران)
- `src/lib/store-settings/__tests__/storeSettings.test.ts` (تست‌های تنظیمات فروشگاه و آدرس‌ها)
- `src/lib/sizeguide/__tests__/sizeGuide.test.ts` (تست‌های قالب‌ها و ماتریکس راهنمای سایز)
- `src/lib/product/__tests__/goldenProduct.test.ts` (تست یکپارچگی End-to-End محصول مراجع)
- `src/lib/promotions/__tests__/promotionService.test.ts` (تست‌های اولویت تخفیف و ارسال رایگان)
- `src/lib/blog/__tests__/blog.test.ts` (تست‌های وبلاگ و جستجو)
- `src/lib/variant/__tests__/variant.test.ts` (تست‌های سازنده متغیرهای محصول)
- `src/lib/returns/__tests__/returns.test.ts` (تست‌های ماشین حالت و ثبت مرجوعی)
- `src/lib/customer/__tests__/customerService.test.ts` (تست‌های پروفایل مشتری)
- `src/lib/support/__tests__/supportService.test.ts` (تست‌های تیکت‌های پشتیبانی)
- `src/components/ui/__tests__/emptyAndErrorStates.test.ts` (تست‌های کامپوننت‌های EmptyState و ErrorState)

---

## ۱۰. خلاصه و مراحل بعدی (Next Steps)

### فایل‌های بررسی‌شده:
- کلیه فایل‌های موجود در `src/app`, `src/components`, `src/lib`, `src/store`, `src/data`, `src/types`
- فایل‌های کانفیگ: `package.json`, `openAPI.yml`, `tsconfig.json`

### فایل‌های ایجاد/تغییر داده‌شده:
- ایجاد سند جامع ممیزی: `docs/api-migration-audit.md`

### موارد نامشخص (Open Items):
- آدرس نهایی سرور دپلوی‌شده بک‌اند (در حال حاضر `http://localhost:9000` قرار داده شده است).
- فرآیند دقیق پردازش پرداخت درگاه ایرانی (زرین‌پال / سامان‌کیش) در متصل شدن به سفارشات Medusa.

### فاز بعدی بدون وابستگی مسدودکننده:
مرحله بعدی پروژه می‌تواند شامل اتصال تدریجی سرویس‌های آماده (`brands`, `categories`, `media`, `storeSettings`, `notifications`, `support`, `sizeGuide`, `reports`, `auth`) به API واقعی بدون دستکاری UI و با حفظ فالبک محلی انجام شود.
