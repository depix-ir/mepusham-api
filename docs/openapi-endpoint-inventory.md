# شناسنامه مکمل و فهرست Endpointهای استخراج‌شده از قرارداد OpenAPI (openAPI.yml)

**تاریخ تنظیم:** اسفند ۱۴۰۳ (مارس ۲۰۲۶)
**نسخه قرارداد:** Medusa v2 API Specification 2.21.2
**وضعیت اعتبارسنجی ساختاری:** تأییدشده با ابزار `openapi-spec-validator` (پاسخ: `openAPI.yml: OK`)
**تعداد کل Endpointهای استخراج‌شده:** ۴۲ عدد

---

## ۱. خلاصه عمومی و روش‌های احراز هویت

در این قرارداد OpenAPI دو روش اصلی احراز هویت تعریف شده است:
1. **Bearer JWT Token** (`bearerAuth`): ارسال توکن در هدر `Authorization: Bearer <JWT>` (مورد استفاده در Endpointهای اداری و برخی Endpointهای مشتری).
2. **Session Cookie** (`cookieAuth`): استفاده از کوکی نشست به نام `connect.sid` (مورد استفاده در Endpointهای مشتری مانند اعلانات و تیکت‌ها).

مسیرهای عمومی فروشگاه (`/store/brands`, `/store/categories`, `/store/products/{id}/size-guide`, `/auth/phone/*`, `/store/reviews/media`) نیاز به احراز هویت ندارند (`security: []`).

---

## ۲. فهرست تفکیکی ۴۲ Endpoint استخراج‌شده

### 1. `GET` `/store/brands`
- **operationId:** `listPublicBrands`
- **عنوان عملیات:** List Public Brands
- **توضیحات:** Retrieve a paginated list of publicly active brands.
- **دسته‌بندی (Tag):** Store Brands
- **روش احراز هویت:** بدون نیاز به احراز هویت (عمومی)
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** Limit (تعداد در هر صفحه)، Offset (جابه‌جایی)، جستجوی متنی (q)
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:**
  - *Query Parameters:* `limit` (integer): ; `offset` (integer): ; `q` (string):
- **بدنه درخواست (RequestBody):** نوع `ندارد` - Schema: ندارد
- **پاسخ‌های موفق:** **200**: A list of active brands. (`application/json`: شیء مستند با ویژگی‌های: ['brands', 'count', 'offset', 'limit'])
- **پاسخ‌های خطا:** **400**:  (بدون Schema)

### 2. `GET` `/store/brands/{id}`
- **operationId:** `getPublicBrand`
- **عنوان عملیات:** Get Public Brand
- **توضیحات:** Retrieve public details of an active brand by ID or slug.
- **دسته‌بندی (Tag):** Store Brands
- **روش احراز هویت:** بدون نیاز به احراز هویت (عمومی)
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:**
  - *Path Parameters:* `id` (string - اجباری):
- **بدنه درخواست (RequestBody):** نوع `ندارد` - Schema: ندارد
- **پاسخ‌های موفق:** **200**: Active brand details. (`application/json`: شیء مستند با ویژگی‌های: ['brand'])
- **پاسخ‌های خطا:** **404**:  (بدون Schema)

### 3. `GET` `/admin/brands`
- **operationId:** `listAdminBrands`
- **عنوان عملیات:** List Admin Brands
- **توضیحات:** Retrieve a list of all brands including inactive ones.
- **دسته‌بندی (Tag):** Admin Brands
- **روش احراز هویت:** bearerAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** Limit (تعداد در هر صفحه)، Offset (جابه‌جایی)، فیلتر براساس پارامترهای Query، جستجوی متنی (q)
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:**
  - *Query Parameters:* `limit` (integer): ; `offset` (integer): ; `is_active` (boolean): ; `q` (string):
- **بدنه درخواست (RequestBody):** نوع `ندارد` - Schema: ندارد
- **پاسخ‌های موفق:** **200**: Paginated brand list for admin. (`application/json`: شیء مستند با ویژگی‌های: ['brands', 'count', 'offset', 'limit'])
- **پاسخ‌های خطا:** **401**:  (بدون Schema)

### 4. `POST` `/admin/brands`
- **operationId:** `createAdminBrand`
- **عنوان عملیات:** Create Brand
- **توضیحات:** Create a new brand. Enforces slug uniqueness.
- **دسته‌بندی (Tag):** Admin Brands
- **روش احراز هویت:** bearerAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:** ندارد
- **بدنه درخواست (RequestBody):** نوع `application/json` - Schema: شیء مستند با ویژگی‌های: ['name', 'slug', 'description', 'logo_id', 'is_active', 'metadata']
- **پاسخ‌های موفق:** **201**: Brand created successfully. (`application/json`: شیء مستند با ویژگی‌های: ['brand'])
- **پاسخ‌های خطا:** **400**:  (بدون Schema)<br>**401**:  (بدون Schema)

### 5. `GET` `/admin/brands/{id}`
- **operationId:** `getAdminBrand`
- **عنوان عملیات:** Get Admin Brand Details
- **توضیحات:** بدون توضیحات تکمیلی
- **دسته‌بندی (Tag):** Admin Brands
- **روش احراز هویت:** bearerAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:**
  - *Path Parameters:* `id` (string - اجباری):
- **بدنه درخواست (RequestBody):** نوع `ندارد` - Schema: ندارد
- **پاسخ‌های موفق:** **200**: Brand details. (`application/json`: شیء مستند با ویژگی‌های: ['brand'])
- **پاسخ‌های خطا:** **401**:  (بدون Schema)<br>**404**:  (بدون Schema)

### 6. `PUT` `/admin/brands/{id}`
- **operationId:** `updateAdminBrand`
- **عنوان عملیات:** Update Brand
- **توضیحات:** بدون توضیحات تکمیلی
- **دسته‌بندی (Tag):** Admin Brands
- **روش احراز هویت:** bearerAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:**
  - *Path Parameters:* `id` (string - اجباری):
- **بدنه درخواست (RequestBody):** نوع `application/json` - Schema: شیء مستند با ویژگی‌های: ['name', 'slug', 'description', 'logo_id', 'is_active', 'metadata']
- **پاسخ‌های موفق:** **200**: Brand updated successfully. (`application/json`: شیء مستند با ویژگی‌های: ['brand'])
- **پاسخ‌های خطا:** **400**:  (بدون Schema)<br>**401**:  (بدون Schema)<br>**404**:  (بدون Schema)

### 7. `DELETE` `/admin/brands/{id}`
- **operationId:** `deleteAdminBrand`
- **عنوان عملیات:** Delete Brand
- **توضیحات:** Safely deletes brand if not referenced by products.
- **دسته‌بندی (Tag):** Admin Brands
- **روش احراز هویت:** bearerAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:**
  - *Path Parameters:* `id` (string - اجباری):
- **بدنه درخواست (RequestBody):** نوع `ندارد` - Schema: ندارد
- **پاسخ‌های موفق:** **200**: Brand deleted successfully. (`application/json`: شیء مستند با ویژگی‌های: ['id', 'object', 'deleted'])
- **پاسخ‌های خطا:** **400**:  (بدون Schema)<br>**401**:  (بدون Schema)<br>**404**:  (بدون Schema)

### 8. `GET` `/store/categories`
- **operationId:** `listPublicCategories`
- **عنوان عملیات:** List Public Categories
- **توضیحات:** بدون توضیحات تکمیلی
- **دسته‌بندی (Tag):** Store Categories
- **روش احراز هویت:** بدون نیاز به احراز هویت (عمومی)
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** Limit (تعداد در هر صفحه)، Offset (جابه‌جایی)، جستجوی متنی (q)
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:**
  - *Query Parameters:* `limit` (integer): ; `offset` (integer): ; `parent_category_id` (string): ; `q` (string):
- **بدنه درخواست (RequestBody):** نوع `ندارد` - Schema: ندارد
- **پاسخ‌های موفق:** **200**: List of active, publishable categories. (`application/json`: شیء مستند با ویژگی‌های: ['categories', 'count', 'offset', 'limit'])
- **پاسخ‌های خطا:** **400**:  (بدون Schema)

### 9. `GET` `/store/categories/{id}`
- **operationId:** `getPublicCategory`
- **عنوان عملیات:** Get Public Category
- **توضیحات:** بدون توضیحات تکمیلی
- **دسته‌بندی (Tag):** Store Categories
- **روش احراز هویت:** بدون نیاز به احراز هویت (عمومی)
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:**
  - *Path Parameters:* `id` (string - اجباری):
- **بدنه درخواست (RequestBody):** نوع `ندارد` - Schema: ندارد
- **پاسخ‌های موفق:** **200**: Public category details. (`application/json`: شیء مستند با ویژگی‌های: ['category'])
- **پاسخ‌های خطا:** **404**:  (بدون Schema)

### 10. `GET` `/admin/categories`
- **operationId:** `listAdminCategories`
- **عنوان عملیات:** List Admin Categories
- **توضیحات:** بدون توضیحات تکمیلی
- **دسته‌بندی (Tag):** Admin Categories
- **روش احراز هویت:** bearerAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** Limit (تعداد در هر صفحه)، Offset (جابه‌جایی)، فیلتر براساس پارامترهای Query
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:**
  - *Query Parameters:* `limit` (integer): ; `offset` (integer): ; `is_active` (boolean): ; `parent_category_id` (string):
- **بدنه درخواست (RequestBody):** نوع `ندارد` - Schema: ندارد
- **پاسخ‌های موفق:** **200**: List of categories for admin. (`application/json`: شیء مستند با ویژگی‌های: ['categories', 'count', 'offset', 'limit'])
- **پاسخ‌های خطا:** **401**:  (بدون Schema)

### 11. `POST` `/admin/categories`
- **operationId:** `createAdminCategory`
- **عنوان عملیات:** Create Category
- **توضیحات:** بدون توضیحات تکمیلی
- **دسته‌بندی (Tag):** Admin Categories
- **روش احراز هویت:** bearerAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:** ندارد
- **بدنه درخواست (RequestBody):** نوع `application/json` - Schema: شیء مستند با ویژگی‌های: ['name', 'slug', 'description', 'image_id', 'is_active', 'display_order', 'parent_category_id']
- **پاسخ‌های موفق:** **201**: Category created. (`application/json`: شیء مستند با ویژگی‌های: ['category'])
- **پاسخ‌های خطا:** **400**:  (بدون Schema)<br>**401**:  (بدون Schema)

### 12. `GET` `/admin/categories/{id}`
- **operationId:** `getAdminCategory`
- **عنوان عملیات:** Get Admin Category
- **توضیحات:** بدون توضیحات تکمیلی
- **دسته‌بندی (Tag):** Admin Categories
- **روش احراز هویت:** bearerAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:**
  - *Path Parameters:* `id` (string - اجباری):
- **بدنه درخواست (RequestBody):** نوع `ندارد` - Schema: ندارد
- **پاسخ‌های موفق:** **200**: Category details. (`application/json`: شیء مستند با ویژگی‌های: ['category'])
- **پاسخ‌های خطا:** **401**:  (بدون Schema)<br>**404**:  (بدون Schema)

### 13. `PUT` `/admin/categories/{id}`
- **operationId:** `updateAdminCategory`
- **عنوان عملیات:** Update Category
- **توضیحات:** بدون توضیحات تکمیلی
- **دسته‌بندی (Tag):** Admin Categories
- **روش احراز هویت:** bearerAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:**
  - *Path Parameters:* `id` (string - اجباری):
- **بدنه درخواست (RequestBody):** نوع `application/json` - Schema: شیء مستند با ویژگی‌های: ['name', 'slug', 'description', 'image_id', 'is_active', 'display_order', 'parent_category_id']
- **پاسخ‌های موفق:** **200**: Category updated. (`application/json`: شیء مستند با ویژگی‌های: ['category'])
- **پاسخ‌های خطا:** **400**:  (بدون Schema)<br>**401**:  (بدون Schema)<br>**404**:  (بدون Schema)

### 14. `DELETE` `/admin/categories/{id}`
- **operationId:** `deleteAdminCategory`
- **عنوان عملیات:** Delete Category
- **توضیحات:** بدون توضیحات تکمیلی
- **دسته‌بندی (Tag):** Admin Categories
- **روش احراز هویت:** bearerAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:**
  - *Path Parameters:* `id` (string - اجباری):
- **بدنه درخواست (RequestBody):** نوع `ندارد` - Schema: ندارد
- **پاسخ‌های موفق:** **200**: Category deleted, products preserved. (`application/json`: شیء مستند با ویژگی‌های: ['id', 'object', 'deleted'])
- **پاسخ‌های خطا:** **401**:  (بدون Schema)<br>**404**:  (بدون Schema)

### 15. `POST` `/admin/media/upload`
- **operationId:** `uploadAdminMedia`
- **عنوان عملیات:** Upload Media File
- **توضیحات:** Uploads a media file with buffer magic-byte MIME validation, size limit enforcement, and dimensions calculation.
- **دسته‌بندی (Tag):** Admin Media
- **روش احراز هویت:** bearerAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** پشتیبانی از آپلود فایل در قالب multipart/form-data (فایل عکس/ویدیو، حداکثر حجم مجاز در سطح سرور/Nginx تعیین می‌شود)
- **پارامترهای ورودی:** ندارد
- **بدنه درخواست (RequestBody):** نوع `multipart/form-data` - Schema: شیء مستند با ویژگی‌های: ['file', 'files']
- **پاسخ‌های موفق:** **201**: Media uploaded successfully. (`application/json`: شیء مستند با ویژگی‌های: ['media'])
- **پاسخ‌های خطا:** **400**:  (بدون Schema)<br>**401**:  (بدون Schema)

### 16. `GET` `/admin/media`
- **operationId:** `listAdminMedia`
- **عنوان عملیات:** List Media Library
- **توضیحات:** بدون توضیحات تکمیلی
- **دسته‌بندی (Tag):** Admin Media
- **روش احراز هویت:** bearerAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** Limit (تعداد در هر صفحه)، Offset (جابه‌جایی)، جستجوی متنی (q)
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:**
  - *Query Parameters:* `limit` (integer): ; `offset` (integer): ; `q` (string): ; `mime_type` (string): ; `uploaded_by_id` (string):
- **بدنه درخواست (RequestBody):** نوع `ندارد` - Schema: ندارد
- **پاسخ‌های موفق:** **200**: Paginated media library. (`application/json`: شیء مستند با ویژگی‌های: ['media', 'count', 'offset', 'limit'])
- **پاسخ‌های خطا:** **401**:  (بدون Schema)

### 17. `GET` `/admin/media/{id}`
- **operationId:** `getAdminMedia`
- **عنوان عملیات:** Get Media Metadata
- **توضیحات:** بدون توضیحات تکمیلی
- **دسته‌بندی (Tag):** Admin Media
- **روش احراز هویت:** bearerAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:**
  - *Path Parameters:* `id` (string - اجباری):
- **بدنه درخواست (RequestBody):** نوع `ندارد` - Schema: ندارد
- **پاسخ‌های موفق:** **200**: Media details. (`application/json`: شیء مستند با ویژگی‌های: ['media'])
- **پاسخ‌های خطا:** **401**:  (بدون Schema)<br>**404**:  (بدون Schema)

### 18. `DELETE` `/admin/media/{id}`
- **operationId:** `deleteAdminMedia`
- **عنوان عملیات:** Delete Media
- **توضیحات:** Deletes media from DB and disk if not referenced by brands, categories, or products.
- **دسته‌بندی (Tag):** Admin Media
- **روش احراز هویت:** bearerAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:**
  - *Path Parameters:* `id` (string - اجباری):
- **بدنه درخواست (RequestBody):** نوع `ندارد` - Schema: ندارد
- **پاسخ‌های موفق:** **200**: Media deleted successfully. (`application/json`: شیء مستند با ویژگی‌های: ['id', 'object', 'deleted'])
- **پاسخ‌های خطا:** **400**:  (بدون Schema)<br>**401**:  (بدون Schema)<br>**404**:  (بدون Schema)

### 19. `POST` `/store/reviews/media`
- **operationId:** `uploadStoreReviewMedia`
- **عنوان عملیات:** Upload Customer Review Image
- **توضیحات:** بدون توضیحات تکمیلی
- **دسته‌بندی (Tag):** Store Reviews
- **روش احراز هویت:** بدون نیاز به احراز هویت (عمومی)
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** پشتیبانی از آپلود فایل در قالب multipart/form-data (فایل عکس/ویدیو، حداکثر حجم مجاز در سطح سرور/Nginx تعیین می‌شود)
- **پارامترهای ورودی:** ندارد
- **بدنه درخواست (RequestBody):** نوع `multipart/form-data` - Schema: شیء مستند با ویژگی‌های: ['file']
- **پاسخ‌های موفق:** **201**: Image uploaded for review attachment. (`application/json`: شیء مستند با ویژگی‌های: ['url'])
- **پاسخ‌های خطا:** **400**:  (بدون Schema)

### 20. `GET` `/admin/settings`
- **operationId:** `getStoreSettings`
- **عنوان عملیات:** Get Store Settings
- **توضیحات:** Retrieve global store settings, notification toggles, return window parameters, tax rates, and associated store addresses.
- **دسته‌بندی (Tag):** Admin Store Settings
- **روش احراز هویت:** bearerAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:** ندارد
- **بدنه درخواست (RequestBody):** نوع `ندارد` - Schema: ندارد
- **پاسخ‌های موفق:** **200**: Current store settings object. (`application/json`: `StoreSettings`)
- **پاسخ‌های خطا:** **401**:  (بدون Schema)

### 21. `PATCH` `/admin/settings`
- **operationId:** `updateStoreSettings`
- **عنوان عملیات:** Update Store Settings
- **توضیحات:** Update editable store settings attributes (e.g., storeName, supportEmail, taxRate, returnWindowDays, notification toggles). Rejects server-managed fields.
- **دسته‌بندی (Tag):** Admin Store Settings
- **روش احراز هویت:** bearerAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:** ندارد
- **بدنه درخواست (RequestBody):** نوع `application/json` - Schema: شیء مستند با ویژگی‌های: ['storeName', 'contactPhone', 'supportEmail', 'address', 'taxRate', 'enableSmsNotifications', 'enableEmailNotifications', 'returnWindowDays', 'autoApproveReturns', 'defaultShippingAddressId', 'defaultReturnAddressId']
- **پاسخ‌های موفق:** **200**: Updated store settings object. (`application/json`: `StoreSettings`)
- **پاسخ‌های خطا:** **400**:  (بدون Schema)<br>**401**:  (بدون Schema)

### 22. `GET` `/admin/settings/addresses`
- **operationId:** `listStoreAddresses`
- **عنوان عملیات:** List Store Addresses
- **توضیحات:** Retrieve all configured store physical addresses alongside current default shipping/return ID pointers.
- **دسته‌بندی (Tag):** Admin Store Settings
- **روش احراز هویت:** bearerAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:** ندارد
- **بدنه درخواست (RequestBody):** نوع `ندارد` - Schema: ندارد
- **پاسخ‌های موفق:** **200**: List of store addresses with default pointers. (`application/json`: شیء مستند با ویژگی‌های: ['addresses', 'defaultShippingAddressId', 'defaultReturnAddressId'])
- **پاسخ‌های خطا:** **401**:  (بدون Schema)

### 23. `POST` `/admin/settings/addresses`
- **operationId:** `createStoreAddress`
- **عنوان عملیات:** Create Store Address
- **توضیحات:** Create a new physical store address with Iranian 10-digit postal code and phone validation.
- **دسته‌بندی (Tag):** Admin Store Settings
- **روش احراز هویت:** bearerAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:** ندارد
- **بدنه درخواست (RequestBody):** نوع `application/json` - Schema: شیء مستند با ویژگی‌های: ['title', 'recipientName', 'phone', 'province', 'city', 'address', 'plaque', 'floor', 'postalCode']
- **پاسخ‌های موفق:** **201**: Store address created. (`application/json`: شیء مستند با ویژگی‌های: ['address'])
- **پاسخ‌های خطا:** **400**:  (بدون Schema)<br>**401**:  (بدون Schema)

### 24. `PATCH` `/admin/settings/addresses/{id}`
- **operationId:** `updateStoreAddress`
- **عنوان عملیات:** Update Store Address
- **توضیحات:** Update fields of an existing store address.
- **دسته‌بندی (Tag):** Admin Store Settings
- **روش احراز هویت:** bearerAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:**
  - *Path Parameters:* `id` (string - اجباری):
- **بدنه درخواست (RequestBody):** نوع `application/json` - Schema: شیء مستند با ویژگی‌های: ['title', 'recipientName', 'phone', 'province', 'city', 'address', 'plaque', 'floor', 'postalCode']
- **پاسخ‌های موفق:** **200**: Updated store address. (`application/json`: شیء مستند با ویژگی‌های: ['address'])
- **پاسخ‌های خطا:** **400**:  (بدون Schema)<br>**401**:  (بدون Schema)<br>**404**:  (بدون Schema)

### 25. `DELETE` `/admin/settings/addresses/{id}`
- **operationId:** `deleteStoreAddress`
- **عنوان عملیات:** Delete Store Address
- **توضیحات:** Delete a store address and automatically reassign defaults if necessary.
- **دسته‌بندی (Tag):** Admin Store Settings
- **روش احراز هویت:** bearerAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:**
  - *Path Parameters:* `id` (string - اجباری):
- **بدنه درخواست (RequestBody):** نوع `ندارد` - Schema: ندارد
- **پاسخ‌های موفق:** **200**: Address deletion response. (`application/json`: شیء مستند با ویژگی‌های: ['deleted', 'id'])
- **پاسخ‌های خطا:** **401**:  (بدون Schema)<br>**404**:  (بدون Schema)

### 26. `PUT` `/admin/settings/default-shipping-address`
- **operationId:** `setDefaultShippingAddress`
- **عنوان عملیات:** Set Default Shipping Address
- **توضیحات:** Set the active default shipping origin address ID for store dispatch.
- **دسته‌بندی (Tag):** Admin Store Settings
- **روش احراز هویت:** bearerAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:** ندارد
- **بدنه درخواست (RequestBody):** نوع `application/json` - Schema: شیء مستند با ویژگی‌های: ['addressId']
- **پاسخ‌های موفق:** **200**: Updated store settings with new default shipping address. (`application/json`: `StoreSettings`)
- **پاسخ‌های خطا:** **400**:  (بدون Schema)<br>**401**:  (بدون Schema)

### 27. `PUT` `/admin/settings/default-return-address`
- **operationId:** `setDefaultReturnAddress`
- **عنوان عملیات:** Set Default Return Address
- **توضیحات:** Set the active default return destination address ID for customer returns.
- **دسته‌بندی (Tag):** Admin Store Settings
- **روش احراز هویت:** bearerAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:** ندارد
- **بدنه درخواست (RequestBody):** نوع `application/json` - Schema: شیء مستند با ویژگی‌های: ['addressId']
- **پاسخ‌های موفق:** **200**: Updated store settings with new default return address. (`application/json`: `StoreSettings`)
- **پاسخ‌های خطا:** **400**:  (بدون Schema)<br>**401**:  (بدون Schema)

### 28. `GET` `/store/notifications`
- **operationId:** `listStoreNotifications`
- **عنوان عملیات:** List Customer Notifications
- **توضیحات:** Retrieve paginated notifications for the authenticated customer.
- **دسته‌بندی (Tag):** Store Notifications
- **روش احراز هویت:** bearerAuth / cookieAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** Limit (تعداد در هر صفحه)، Offset (جابه‌جایی)
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:**
  - *Query Parameters:* `limit` (integer): ; `offset` (integer): ; `is_read` (boolean):
- **بدنه درخواست (RequestBody):** نوع `ندارد` - Schema: ندارد
- **پاسخ‌های موفق:** **200**: Paginated notification list. (`application/json`: شیء مستند با ویژگی‌های: ['notifications', 'count', 'offset', 'limit'])
- **پاسخ‌های خطا:** **401**:  (بدون Schema)

### 29. `GET` `/store/notifications/unread-count`
- **operationId:** `getStoreUnreadNotificationCount`
- **عنوان عملیات:** Get Unread Notification Count
- **توضیحات:** Retrieve total unread notifications count for badge indicators.
- **دسته‌بندی (Tag):** Store Notifications
- **روش احراز هویت:** bearerAuth / cookieAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:** ندارد
- **بدنه درخواست (RequestBody):** نوع `ندارد` - Schema: ندارد
- **پاسخ‌های موفق:** **200**: Unread notification count. (`application/json`: شیء مستند با ویژگی‌های: ['count'])
- **پاسخ‌های خطا:** **401**:  (بدون Schema)

### 30. `POST` `/store/notifications/read-all`
- **operationId:** `markAllStoreNotificationsAsRead`
- **عنوان عملیات:** Mark All Notifications As Read
- **توضیحات:** Mark all unread notifications for current customer as read.
- **دسته‌بندی (Tag):** Store Notifications
- **روش احراز هویت:** bearerAuth / cookieAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:** ندارد
- **بدنه درخواست (RequestBody):** نوع `ندارد` - Schema: ندارد
- **پاسخ‌های موفق:** **200**: Success response. (`application/json`: شیء مستند با ویژگی‌های: ['success'])
- **پاسخ‌های خطا:** **401**:  (بدون Schema)

### 31. `POST` `/store/notifications/{id}/read`
- **operationId:** `markSingleStoreNotificationAsRead`
- **عنوان عملیات:** Mark Single Notification As Read
- **توضیحات:** Mark a specific notification as read by ID.
- **دسته‌بندی (Tag):** Store Notifications
- **روش احراز هویت:** bearerAuth / cookieAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:**
  - *Path Parameters:* `id` (string - اجباری):
- **بدنه درخواست (RequestBody):** نوع `ندارد` - Schema: ندارد
- **پاسخ‌های موفق:** **200**: Updated notification object. (`application/json`: شیء مستند با ویژگی‌های: ['notification'])
- **پاسخ‌های خطا:** **401**:  (بدون Schema)<br>**404**:  (بدون Schema)

### 32. `GET` `/admin/inventory/history`
- **operationId:** `getGlobalInventoryHistory`
- **عنوان عملیات:** Get Global Inventory Transaction History
- **توضیحات:** Retrieve paginated audit trail of inventory balance adjustments and transactions across all products.
- **دسته‌بندی (Tag):** Admin Inventory
- **روش احراز هویت:** bearerAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** Limit (تعداد در هر صفحه)، Offset (جابه‌جایی)، فیلتر براساس پارامترهای Query
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:**
  - *Query Parameters:* `limit` (integer): ; `offset` (integer): ; `location_id` (string): ; `type` (string):
- **بدنه درخواست (RequestBody):** نوع `ندارد` - Schema: ندارد
- **پاسخ‌های موفق:** **200**: Paginated transaction list. (`application/json`: شیء مستند با ویژگی‌های: ['transactions', 'count', 'offset', 'limit'])
- **پاسخ‌های خطا:** **401**:  (بدون Schema)

### 33. `GET` `/admin/inventory/low-stock`
- **operationId:** `getLowStockInventoryAlerts`
- **عنوان عملیات:** Get Low Stock Items Alert
- **توضیحات:** Retrieve inventory items operating below low stock threshold levels.
- **دسته‌بندی (Tag):** Admin Inventory
- **روش احراز هویت:** bearerAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:**
  - *Query Parameters:* `threshold` (integer):
- **بدنه درخواست (RequestBody):** نوع `ندارد` - Schema: ندارد
- **پاسخ‌های موفق:** **200**: List of low stock inventory items. (`application/json`: شیء مستند با ویژگی‌های: ['items'])
- **پاسخ‌های خطا:** **401**:  (بدون Schema)

### 34. `GET` `/store/tickets`
- **operationId:** `listStoreTickets`
- **عنوان عملیات:** List Customer Support Tickets
- **توضیحات:** Retrieve support tickets created by or associated with the logged-in customer.
- **دسته‌بندی (Tag):** Store Support Tickets
- **روش احراز هویت:** bearerAuth / cookieAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:** ندارد
- **بدنه درخواست (RequestBody):** نوع `ندارد` - Schema: ندارد
- **پاسخ‌های موفق:** **200**: List of tickets. (`application/json`: شیء مستند با ویژگی‌های: ['tickets'])
- **پاسخ‌های خطا:** **401**:  (بدون Schema)

### 35. `POST` `/store/tickets`
- **operationId:** `createStoreTicket`
- **عنوان عملیات:** Create Customer Support Ticket
- **توضیحات:** Open a new customer support ticket with atomic TKT-YYYY-XXXXXX ticket number generation.
- **دسته‌بندی (Tag):** Store Support Tickets
- **روش احراز هویت:** bearerAuth / cookieAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:** ندارد
- **بدنه درخواست (RequestBody):** نوع `application/json` - Schema: شیء مستند با ویژگی‌های: ['category_id', 'subject', 'message', 'order_id', 'product_id', 'priority']
- **پاسخ‌های موفق:** **201**: Support ticket created. (`application/json`: شیء مستند با ویژگی‌های: ['ticket'])
- **پاسخ‌های خطا:** **400**:  (بدون Schema)<br>**401**:  (بدون Schema)

### 36. `GET` `/admin/tickets`
- **operationId:** `listAdminTickets`
- **عنوان عملیات:** List Admin Support Tickets
- **توضیحات:** Retrieve paginated support tickets with status and priority filtering for customer service operators.
- **دسته‌بندی (Tag):** Admin Support Tickets
- **روش احراز هویت:** bearerAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** فیلتر براساس پارامترهای Query
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:**
  - *Query Parameters:* `status` (string): ; `priority` (string): ; `assigned_to_id` (string):
- **بدنه درخواست (RequestBody):** نوع `ندارد` - Schema: ندارد
- **پاسخ‌های موفق:** **200**: Paginated ticket list for admin. (`application/json`: شیء مستند با ویژگی‌های: ['tickets', 'count'])
- **پاسخ‌های خطا:** **401**:  (بدون Schema)

### 37. `GET` `/admin/size-guides/templates`
- **operationId:** `listAdminSizeGuideTemplates`
- **عنوان عملیات:** List Size Guide Templates
- **توضیحات:** Retrieve reusable size guide layout templates.
- **دسته‌بندی (Tag):** Admin Size Guides
- **روش احراز هویت:** bearerAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:** ندارد
- **بدنه درخواست (RequestBody):** نوع `ندارد` - Schema: ندارد
- **پاسخ‌های موفق:** **200**: Size guide templates list. (`application/json`: شیء مستند با ویژگی‌های: ['templates'])
- **پاسخ‌های خطا:** **401**:  (بدون Schema)

### 38. `POST` `/admin/size-guides/templates`
- **operationId:** `createAdminSizeGuideTemplate`
- **عنوان عملیات:** Create Size Guide Template
- **توضیحات:** Create a size guide template with measurement matrices.
- **دسته‌بندی (Tag):** Admin Size Guides
- **روش احراز هویت:** bearerAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:** ندارد
- **بدنه درخواست (RequestBody):** نوع `application/json` - Schema: شیء مستند با ویژگی‌های: ['title', 'description', 'columns', 'rows']
- **پاسخ‌های موفق:** **201**: Template created. (`application/json`: شیء مستند با ویژگی‌های: ['template'])
- **پاسخ‌های خطا:** **400**:  (بدون Schema)<br>**401**:  (بدون Schema)

### 39. `GET` `/store/products/{id}/size-guide`
- **operationId:** `getStoreProductSizeGuide`
- **عنوان عملیات:** Get Product Size Guide
- **توضیحات:** Retrieve size guide assigned to a product.
- **دسته‌بندی (Tag):** Store Size Guides
- **روش احراز هویت:** بدون نیاز به احراز هویت (عمومی)
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:**
  - *Path Parameters:* `id` (string - اجباری):
- **بدنه درخواست (RequestBody):** نوع `ندارد` - Schema: ندارد
- **پاسخ‌های موفق:** **200**: Size guide template object. (`application/json`: شیء مستند با ویژگی‌های: ['size_guide'])
- **پاسخ‌های خطا:** **404**:  (بدون Schema)

### 40. `GET` `/admin/reports/margin`
- **operationId:** `getAdminMarginReport`
- **عنوان عملیات:** Get Margin Analysis Report
- **توضیحات:** Retrieve financial margin analysis aggregating Gross Sales, COGS, Discounts, Shipping, Tax, Net Sales, Gross Profit, and Gross Margin percentage across date ranges and product breakdowns.
- **دسته‌بندی (Tag):** Admin Reports
- **روش احراز هویت:** bearerAuth
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:**
  - *Query Parameters:* `start_date` (string): ; `end_date` (string): ; `group_by` (string):
- **بدنه درخواست (RequestBody):** نوع `ندارد` - Schema: ندارد
- **پاسخ‌های موفق:** **200**: Financial margin report. (`application/json`: شیء مستند با ویژگی‌های: ['summary', 'breakdown'])
- **پاسخ‌های خطا:** **401**:  (بدون Schema)

### 41. `POST` `/auth/phone/send-otp`
- **operationId:** `sendPhoneOtpCode`
- **عنوان عملیات:** Send Phone OTP Code
- **توضیحات:** Dispatch verification OTP code to customer's Iranian mobile number (`09...` or `+989...`).
- **دسته‌بندی (Tag):** Authentication
- **روش احراز هویت:** بدون نیاز به احراز هویت (عمومی)
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:** ندارد
- **بدنه درخواست (RequestBody):** نوع `application/json` - Schema: شیء مستند با ویژگی‌های: ['phone']
- **پاسخ‌های موفق:** **200**: OTP code sent successfully. (`application/json`: شیء مستند با ویژگی‌های: ['success', 'message'])
- **پاسخ‌های خطا:** **400**:  (بدون Schema)

### 42. `POST` `/auth/phone/verify`
- **operationId:** `verifyPhoneOtpCode`
- **عنوان عملیات:** Verify Phone OTP Code
- **توضیحات:** Verify OTP code and issue JWT session token for customer.
- **دسته‌بندی (Tag):** Authentication
- **روش احراز هویت:** بدون نیاز به احراز هویت (عمومی)
- **پشتیبانی از صفحه‌بندی / فیلتر / جستجو:** ندارد / تعریف‌نشده در این Endpoint
- **محدودیت/شرایط آپلود فایل:** ندارد
- **پارامترهای ورودی:** ندارد
- **بدنه درخواست (RequestBody):** نوع `application/json` - Schema: شیء مستند با ویژگی‌های: ['phone', 'code']
- **پاسخ‌های موفق:** **200**: Authentication successful. (`application/json`: شیء مستند با ویژگی‌های: ['token', 'customer'])
- **پاسخ‌های خطا:** **400**:  (بدون Schema)

---

## ۳. مدل‌های داده مشترک (Shared Data Models) و Enumها

در بخش `components/schemas` سند OpenAPI مدل‌های زیر به عنوان تک‌منبع حقیقت تعریف شده‌اند:

### مدل `ErrorResponse`
- **نوع:** `object`
- **فیلدهای اجباری (Required):** `['message', 'type']`
- **ویژگی‌ها (Properties):**
  - `message` (string)
  - `type` (string)
  - `code` (string)

### مدل `Brand`
- **نوع:** `object`
- **فیلدهای اجباری (Required):** `['id', 'name', 'slug', 'is_active']`
- **ویژگی‌ها (Properties):**
  - `id` (string)
  - `name` (string)
  - `slug` (string)
  - `description` (string) (قابل مقداردهی null)
  - `logo_id` (string) (قابل مقداردهی null)
  - `is_active` (boolean)
  - `created_at` (string)
  - `updated_at` (string)

### مدل `Category`
- **نوع:** `object`
- **فیلدهای اجباری (Required):** `['id', 'name', 'slug', 'is_active']`
- **ویژگی‌ها (Properties):**
  - `id` (string)
  - `name` (string)
  - `slug` (string)
  - `description` (string) (قابل مقداردهی null)
  - `image_id` (string) (قابل مقداردهی null)
  - `is_active` (boolean)
  - `display_order` (integer)
  - `parent_category_id` (string) (قابل مقداردهی null)
  - `created_at` (string)
  - `updated_at` (string)

### مدل `Media`
- **نوع:** `object`
- **فیلدهای اجباری (Required):** `['id', 'original_filename', 'file_key', 'url']`
- **ویژگی‌ها (Properties):**
  - `id` (string)
  - `original_filename` (string)
  - `file_key` (string)
  - `mime_type` (string)
  - `file_size` (integer)
  - `storage_provider` (string)
  - `url` (string)
  - `width` (integer) (قابل مقداردهی null)
  - `height` (integer) (قابل مقداردهی null)
  - `uploaded_by_id` (string) (قابل مقداردهی null)
  - `created_at` (string)
  - `updated_at` (string)

### مدل `StoreAddress`
- **نوع:** `object`
- **فیلدهای اجباری (Required):** `['id', 'title', 'recipientName', 'phone', 'province', 'city', 'address', 'postalCode']`
- **ویژگی‌ها (Properties):**
  - `id` (string)
  - `title` (string)
  - `recipientName` (string)
  - `recipient_name` (string)
  - `phone` (string)
  - `province` (string)
  - `city` (string)
  - `address` (string)
  - `plaque` (string) (قابل مقداردهی null)
  - `floor` (string) (قابل مقداردهی null)
  - `postalCode` (string)
  - `postal_code` (string)
  - `createdAt` (string)
  - `updatedAt` (string)

### مدل `StoreSettings`
- **نوع:** `object`
- **فیلدهای اجباری (Required):** `['id', 'storeName', 'contactPhone', 'supportEmail', 'address', 'taxRate', 'enableSmsNotifications', 'enableEmailNotifications', 'returnWindowDays', 'autoApproveReturns', 'addresses']`
- **ویژگی‌ها (Properties):**
  - `id` (string)
  - `storeName` (string)
  - `contactPhone` (string)
  - `supportEmail` (string)
  - `address` (string)
  - `taxRate` (number)
  - `enableSmsNotifications` (boolean)
  - `enableEmailNotifications` (boolean)
  - `returnWindowDays` (integer)
  - `autoApproveReturns` (boolean)
  - `defaultShippingAddressId` (string) (قابل مقداردهی null)
  - `defaultReturnAddressId` (string) (قابل مقداردهی null)
  - `addresses` (آرایه‌ای از `StoreAddress`)
  - `createdAt` (string)
  - `updatedAt` (string)

### مدل `Notification`
- **نوع:** `object`
- **فیلدهای اجباری (Required):** `['id', 'receiver_id', 'channel', 'template', 'data']`
- **ویژگی‌ها (Properties):**
  - `id` (string)
  - `receiver_id` (string)
  - `channel` (string)
  - `template` (string)
  - `data` (object)
  - `read_at` (string) (قابل مقداردهی null)
  - `created_at` (string)

### مدل `InventoryTransaction`
- **نوع:** `object`
- **فیلدهای اجباری (Required):** `['id', 'inventory_item_id', 'location_id', 'quantity_change', 'type']`
- **ویژگی‌ها (Properties):**
  - `id` (string)
  - `inventory_item_id` (string)
  - `location_id` (string)
  - `quantity_change` (integer)
  - `type` (string) - Enum مقادیر: `['adjustment', 'sale', 'return', 'transfer', 'reservation']`
  - `description` (string) (قابل مقداردهی null)
  - `created_at` (string)

### مدل `Ticket`
- **نوع:** `object`
- **فیلدهای اجباری (Required):** `['id', 'ticket_number', 'customer_id', 'category_id', 'subject', 'status', 'priority']`
- **ویژگی‌ها (Properties):**
  - `id` (string)
  - `ticket_number` (string) - نمونه: `TKT-2026-000123`
  - `customer_id` (string)
  - `category_id` (string)
  - `subject` (string)
  - `status` (string) - Enum مقادیر: `['open', 'in_progress', 'resolved', 'closed']`
  - `priority` (string) - Enum مقادیر: `['low', 'normal', 'high', 'urgent']`
  - `order_id` (string) (قابل مقداردهی null)
  - `product_id` (string) (قابل مقداردهی null)
  - `assigned_to_id` (string) (قابل مقداردهی null)
  - `created_at` (string)
  - `updated_at` (string)

### مدل `SizeGuideTemplate`
- **نوع:** `object`
- **فیلدهای اجباری (Required):** `['id', 'title', 'columns', 'rows']`
- **ویژگی‌ها (Properties):**
  - `id` (string)
  - `title` (string)
  - `description` (string) (قابل مقداردهی null)
  - `columns` (آرایه‌ای از `string`)
  - `rows` (آرایه‌ای از `object`)
  - `created_at` (string)
  - `updated_at` (string)
