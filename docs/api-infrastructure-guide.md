# راهنمای استفاده و معماری زیرساخت مرکزی API (Phase 2)

این سند نحوه تعامل با زیرساخت مرکزی API، ساختار Endpointها، مدیریت تایپ‌ها، پیکربندی محیط و ملاحظات معماری Next.js را تشریح می‌کند.

---

## ۱. پیکربندی محیط (Environment Configuration)

تنظیمات آدرس پایه API در فایل `src/lib/api/config.ts` متمرکز شده است:

- متغیر محیطی: `NEXT_PUBLIC_API_BASE_URL`
- فایل نمونه: `.env.example`
- آدرس پیش‌فرض توسعه: `http://localhost:9000`

```ts
import { BASE_URL, getApiBaseUrl, IS_API_BASE_URL_CONFIGURED } from "@/lib/api/config";
```

### تفاوت Build-Time و Runtime در Next.js
- **کد سمت کلاینت (Client Components)**: متغیرهای با پیشوند `NEXT_PUBLIC_` در زمان کامپایل/بیلد جایگذاری می‌شوند.
- **کد سمت سرور (Server Components / SSR)**: مقدار `process.env.NEXT_PUBLIC_API_BASE_URL` به صورت پویا در runtime قابل خواندن است.

---

## ۲. مسیرهای مرکزی API (Endpoints Module)

تمامی مسیرهای ۴۲‌گانه مستخرج از سند `openAPI.yml` در `src/lib/api/endpoints.ts` تعریف شده‌اند. مسیرهای پویا حتماً از تابع `encodeURIComponent` استفاده می‌کنند:

```ts
import { API_ENDPOINTS } from "@/lib/api/endpoints";

// مسیرهای ثابت
const brandsUrl = API_ENDPOINTS.storeBrands; // "/store/brands"

// مسیرهای پویا به همراه encode خودکار
const brandUrl = API_ENDPOINTS.storeBrand("brand-id/special&key");
// "/store/brands/brand-id%2Fspecial%26key"
```

---

## ۳. API Client مشترک (`apiClient`)

کلاینت مرکزی در `src/lib/api/client.ts` تمامی متدهای اصلی HTTP را ارائه می‌دهد:

### ۳.۱. نمونه فراخوانی GET با Query Parameters
```ts
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { ApiBrand } from "@/lib/api/openapi-types";

const response = await apiClient.get<{ brands: ApiBrand[]; count: number }>(
  API_ENDPOINTS.storeBrands,
  {
    params: { limit: 10, offset: 0, q: "کفش" },
  }
);
```

### ۳.۲. نمونه فراخوانی POST با JSON Body
```ts
const response = await apiClient.post<{ brand: ApiBrand }>(
  API_ENDPOINTS.adminBrands,
  { name: "برند جدید", slug: "new-brand" }
);
```

### ۳.۳. آپلود فایل با `FormData`
در ارسال `FormData` هدر `Content-Type` به صورت دستی **تنظیم نمی‌شود** تا مرورگر یا fetch بتواند boundary مربوطه را تعیین کند:

```ts
const formData = new FormData();
formData.append("file", fileObject);

const mediaRes = await apiClient.post<{ media: ApiMedia }>(
  API_ENDPOINTS.adminMediaUpload,
  formData
);
```

### ۳.۴. تایم‌اوت و لغو درخواست
```ts
const data = await apiClient.get(API_ENDPOINTS.storeBrands, {
  timeout: 5000, // 5 seconds timeout
});
```

### ۳.۵. مدیریت پاسخ‌ها و خطاهای HTTP (`ApiError`)
- پاسخ‌های HTTP 204 (No Content) بدون خطای JSON parse، مقدار شیء خالی `{}` برمی‌گردانند.
- پاسخ‌های غیر JSON به صورت متنی دریافت می‌شوند.
- در صورت دریافت خطا (Status >= 400)، کلاس `ApiError` شامل `status` و `payload` پرتاب می‌شود:

```ts
import { ApiError } from "@/lib/api/client";

try {
  await apiClient.post(API_ENDPOINTS.adminBrands, data);
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`خطای API کد ${error.status}:`, error.message, error.payload);
  }
}
```

---

## ۴. تایپ‌های TypeScript مستخرج از OpenAPI

تایپ‌ها با دستور زیر از `openAPI.yml` تولید می‌شوند:

```bash
npx openapi-typescript openAPI.yml -o src/lib/api/openapi-types.ts
```

تایپ‌های آماده برای استفاده در سرویس‌ها:
- `ApiBrand`
- `ApiCategory`
- `ApiMedia`
- `ApiStoreAddress`
- `ApiStoreSettings`
- `ApiNotification`
- `ApiInventoryTransaction`
- `ApiTicket`
- `ApiSizeGuideTemplate`

---

## ۵. تفکیک Server و Client و ارزیابی BFF / Route Handlers

### ۵.۱. قوانین تفکیک Server و Client در Next.js
1. **Server Components**:
   - برای دریافت اولیه داده‌ها در SSR و افزایش سرعت لود اولیه استفاده می‌شوند.
   - کلیدهای سِروری و Secretها فقط در متغیرهای بدون پیشوند `NEXT_PUBLIC_` نگهداری شده و هرگز به فرانت‌اند فرستاده نمی‌شوند.
2. **Client Components**:
   - برای تعاملات کاربر (فرم‌ها، دکمه‌ها، Modals) استفاده می‌شوند.
   - درخواست‌های کلاینت از توکن‌های Session/JWT ذخیره‌شده در `localStorage` یا کوکی‌های `SameSite` استفاده می‌کنند.

### ۵.۲. ارزیابی الگوی BFF (Backend For Frontend)
- در فاز فعلی، بک‌اند Medusa v2 به طور مستقیم هدرها، توکن‌ها و احراز هویت لازم را مدیریت می‌کند.
- ایجاد بی‌دلیل API Route Handlers / BFF باعث ایجاد دایل‌آپ دوگانه (Client -> Next.js Route -> Medusa) و افزایش latency شبکه می‌گردد.
- بنابراین فرانت‌اند به طور مستقیم و تایپ‌امپ امن از طریق `apiClient` با API ارتباط برقرار می‌کند مگر اینکه در مراحل بعدی نیاز به مخفی‌سازی API Keyهای شخص ثالث (مانند درگاه‌های بانکی) وجود داشته باشد.
