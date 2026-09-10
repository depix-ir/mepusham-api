# PRODUCT DATA MODEL CONTEXT

## 1. هدف این Context

این Context مرجع اصلی ساختار داده مربوط به Product، Product Variant، Product Options، Pricing، Inventory، Images، Category، Brand و Mock Data در پروژه فروشگاهی است.

پروژه یک قالب فروشگاهی آماده و قابل توسعه با:

- React
- Next.js
- TypeScript
- Tailwind CSS

است.

نسخه اول پروژه Backend واقعی ندارد و از Mock Data استفاده می‌کند.

در آینده یک Backend مستقل و API جداگانه به پروژه متصل خواهد شد.

بنابراین Data Model باید از ابتدا طوری طراحی شود که:

1. برای Mock Data ساده و قابل استفاده باشد.
2. UI مستقیماً به Mock Data وابسته نباشد.
3. بعداً API بتواند جایگزین Mock Data شود.
4. Product، Variant، Inventory، Cart و Order از ابتدا قابلیت توسعه داشته باشند.
5. افزودن قابلیت‌های جدید نیازمند بازنویسی اساسی مدل داده نباشد.

---

# 2. اصل مهم معماری

مدل Product نباید به UI فعلی محدود شود.

در نسخه اول فقط دو نوع Option در UI فعال هستند:

- Color
- Size

اما Data Model باید Generic باشد و بتواند در آینده Optionهای دیگری مانند:

- Material
- Style
- Pattern
- Capacity
- Length
- Weight
- Custom

را نیز پشتیبانی کند.

بنابراین نباید ساختار Product به شکل زیر طراحی شود:

```ts
colors: []
sizes: []


Product
│
├── Options
│   ├── Color
│   └── Size
│
└── Variants
    ├── Color + Size
    ├── Color + Size
    └── Color + Size


    Product
│
├── Options
│   ├── Color
│   └── Size
│
└── Variants
    ├── Color + Size
    ├── Color + Size
    └── Color + Size


    Product موجودیت اصلی فروشگاه است.

ساختار پیشنهادی:

export type Product = {
  id: string
  slug: string

  title: string
  description?: string

  brand?: ProductBrand
  category: ProductCategory

  images: ProductImage[]

  options: ProductOption[]
  variants: ProductVariant[]

  pricing: ProductPricing
  inventory: ProductInventory

  tags?: string[]

  status: ProductStatus

  createdAt: string
  updatedAt: string
}
4. Product ID

هر Product باید یک ID یکتا داشته باشد.

id: string

مثال:

id: "product-001"

ID نباید به عنوان slug استفاده شود.

5. Product Slug

Slug برای URL و routing استفاده می‌شود.

slug: string

مثال:

slug: "black-womens-dress"

در آینده:

/products/black-womens-dress

Product ID و Product Slug دو مفهوم جدا هستند.

6. Product Title

نام محصول:

title: string

مثال:

title: "پیراهن زنانه مدل کلاسیک"
7. Product Description

توضیحات محصول اختیاری است.

description?: string

در نسخه اول می‌تواند ساده باشد.

در آینده می‌توان Description را به ساختار Rich Content تبدیل کرد بدون اینکه Product Model اصلی تغییر کند.

8. Product Status

وضعیت کلی Product:

export type ProductStatus =
  | "active"
  | "draft"
  | "archived"
active

محصول فعال و قابل نمایش در فروشگاه است.

draft

محصول هنوز منتشر نشده است.

archived

محصول آرشیو شده و دیگر در فروشگاه عمومی نمایش داده نمی‌شود.

9. Brand

ساختار Brand:

export type ProductBrand = {
  id: string
  name: string
  slug: string
  logo?: string
}

مثال:

{
  id: "brand-001",
  name: "Brand One",
  slug: "brand-one",
  logo: "/images/brands/brand-one.svg"
}

Brand باید Entity مستقل باشد و Product فقط اطلاعات مورد نیاز خود را reference کند.

10. Category

ساختار Category:

export type ProductCategory = {
  id: string
  name: string
  slug: string
}

مثال:

{
  id: "category-dresses",
  name: "پیراهن زنانه",
  slug: "womens-dresses"
}

در آینده Category می‌تواند به ساختار Hierarchical تبدیل شود.

مثلاً:

پوشاک
└── زنانه
    └── لباس
        └── پیراهن

اما نسخه اول نیاز به پیچیده کردن Product Model ندارد.

11. Product Images

Product می‌تواند چند تصویر داشته باشد.

export type ProductImage = {
  id: string
  url: string
  alt?: string
  sortOrder: number
}

مثال:

{
  id: "product-001-image-01",
  url: "/images/products/product-001/01.webp",
  alt: "پیراهن زنانه مشکی",
  sortOrder: 0
}
12. Image Storage

تصاویر Mock Data در:

public/images/

قرار می‌گیرند.

ساختار پیشنهادی:

public/
└── images/
    ├── products/
    │   ├── product-001/
    │   │   ├── 01.webp
    │   │   ├── 02.webp
    │   │   └── 03.webp
    │   │
    │   └── product-002/
    │       ├── 01.webp
    │       └── 02.webp
    │
    ├── categories/
    ├── brands/
    ├── banners/
    └── placeholders/

Data Model نباید به File ID یا Storage Provider وابسته باشد.

در Mock Data:

url: "/images/products/product-001/01.webp"

در آینده API می‌تواند:

url: "https://cdn.example.com/products/product-001/01.webp"

برگرداند.

13. Product Options

Option مشخص می‌کند Product چه ویژگی‌هایی برای انتخاب دارد.

مثلاً:

رنگ
سایز

ساختار:

export type ProductOption = {
  id: string

  name: string

  type: ProductOptionType

  values: ProductOptionValue[]

  required: boolean

  sortOrder: number
}
14. Product Option Type

در نسخه اول UI فقط Color و Size استفاده می‌شوند.

اما مدل داده باید قابلیت توسعه داشته باشد.

export type ProductOptionType =
  | "color"
  | "size"
  | "material"
  | "style"
  | "pattern"
  | "capacity"
  | "length"
  | "weight"
  | "custom"

این لیست قابل توسعه است.

اضافه کردن Option Type جدید نباید نیازمند تغییر اساسی در Product Model باشد.

15. Product Option Value

هر Option شامل چند Value است.

export type ProductOptionValue = {
  id: string

  label: string

  value: string

  metadata?: Record<string, unknown>

  sortOrder: number
}

مثال Color:

{
  id: "black",
  label: "مشکی",
  value: "#000000",
  sortOrder: 0,

  metadata: {
    hex: "#000000"
  }
}

مثال Size:

{
  id: "medium",
  label: "M",
  value: "M",
  sortOrder: 1
}
16. Color Option

Color یک Option Type مخصوص رنگ است.

{
  id: "color",
  name: "رنگ",
  type: "color",
  required: true,
  sortOrder: 0,

  values: [
    {
      id: "black",
      label: "مشکی",
      value: "#000000",
      sortOrder: 0,

      metadata: {
        hex: "#000000"
      }
    },

    {
      id: "white",
      label: "سفید",
      value: "#FFFFFF",
      sortOrder: 1,

      metadata: {
        hex: "#FFFFFF"
      }
    }
  ]
}

UI نسخه اول Color را به صورت Color Swatch نمایش می‌دهد.

17. Size Option

Size نیز Option Type مستقل است.

{
  id: "size",
  name: "سایز",
  type: "size",
  required: true,
  sortOrder: 1,

  values: [
    {
      id: "m",
      label: "M",
      value: "M",
      sortOrder: 0
    },

    {
      id: "l",
      label: "L",
      value: "L",
      sortOrder: 1
    },

    {
      id: "xl",
      label: "XL",
      value: "XL",
      sortOrder: 2
    }
  ]
}

UI نسخه اول Size را به صورت Size Selector / Chips نمایش می‌دهد.

18. Variant

Variant یک حالت قابل فروش از Product است.

Variant می‌تواند شامل:

ترکیب Optionها
SKU
قیمت
موجودی
تصویر
وضعیت

باشد.

ساختار:

export type ProductVariant = {
  id: string

  sku?: string

  optionValues: ProductVariantOptionValue[]

  pricing: ProductVariantPricing

  inventory: ProductVariantInventory

  imageIds?: string[]

  status: ProductVariantStatus
}
19. Variant Option Values

Variant باید مشخص کند از چه Option Valueهایی ساخته شده است.

export type ProductVariantOptionValue = {
  optionId: string
  valueId: string
}

مثال:

optionValues: [
  {
    optionId: "color",
    valueId: "black"
  },
  {
    optionId: "size",
    valueId: "m"
  }
]

معنی:

رنگ: مشکی
سایز: M
20. Variant Combination

هر ترکیب منحصر به فرد باید Variant مستقل داشته باشد.

مثال:

مشکی + M
مشکی + L
مشکی + XL
سفید + M
سفید + L
سفید + XL

هر کدام Variant ID و در صورت نیاز SKU مستقل دارند.

21. SKU

SKU در سطح Variant قرار می‌گیرد.

sku?: string

مثال:

DR-BLK-M
DR-BLK-L
DR-WHT-M

SKU نباید در سطح Product تعریف شود، چون هر Variant می‌تواند SKU مستقل داشته باشد.

22. Variant Pricing

قیمت اصلی قابل فروش در سطح Variant قرار دارد.

export type ProductVariantPricing = {
  price: number

  compareAtPrice?: number

  discountPercent?: number
}
Product بدون تخفیف
{
  price: 1890000
}
Product تخفیف‌دار
{
  price: 1890000,
  compareAtPrice: 2190000,
  discountPercent: 14
}
23. Pricing Rules

price قیمت فعلی فروش است.

compareAtPrice قیمت قبل از تخفیف است.

discountPercent درصد تخفیف است.

در UI:

Original Price
Discount
Final Price

باید بر اساس وضعیت داده نمایش داده شوند.

مثلاً:

محصول عادی
1,890,000 تومان
محصول تخفیف‌دار
2,190,000     14%
1,890,000 تومان

اگر compareAtPrice وجود نداشته باشد، قیمت قبلی نمایش داده نمی‌شود.

اگر Discount وجود نداشته باشد، Badge تخفیف نمایش داده نمی‌شود.

24. Price Source of Truth

منبع اصلی قیمت:

ProductVariant.pricing

است.

ProductPricing فقط Summary سطح Product است.

این موضوع مهم است، چون ممکن است Variantها قیمت متفاوت داشته باشند.

مثال:

M  → 1,890,000
L  → 1,890,000
XL → 1,990,000
25. Product Pricing Summary

برای Listing و Product Card یک Summary در Product قرار می‌گیرد.

export type ProductPricing = {
  minPrice: number

  maxPrice?: number

  minCompareAtPrice?: number

  hasDiscount: boolean
}

مثال:

{
  minPrice: 1890000,
  maxPrice: 1990000,
  minCompareAtPrice: 2190000,
  hasDiscount: true
}

این Summary منبع اصلی قیمت نیست.

منبع اصلی همچنان Variant است.

26. Variant Inventory

موجودی باید در سطح Variant باشد.

export type ProductVariantInventory = {
  stock: number

  trackStock: boolean

  allowBackorder?: boolean
}

مثال موجود:

{
  stock: 12,
  trackStock: true,
  allowBackorder: false
}

مثال ناموجود:

{
  stock: 0,
  trackStock: true,
  allowBackorder: false
}
27. Product Inventory Summary

Product می‌تواند Summary موجودی داشته باشد.

export type ProductInventory = {
  totalStock: number

  trackStock: boolean

  hasAvailableVariants: boolean
}

totalStock می‌تواند از مجموع Variantهای موجود محاسبه شود.

مثلاً:

Black / M → 10
Black / L → 0
White / M → 5

Total Stock → 15
28. Inventory Source of Truth

منبع اصلی موجودی:

ProductVariant.inventory

است.

Product.inventory فقط Summary است.

در آینده Backend باید Inventory واقعی را مدیریت کند.

29. Variant Status
export type ProductVariantStatus =
  | "active"
  | "inactive"

Variant می‌تواند حتی در حالی که Product فعال است، inactive باشد.

30. Out of Stock

اگر:

stock === 0

و:

allowBackorder === false

باشد، Variant قابل خرید نیست.

Product Card در صورت ناموجود بودن Product:

متن «ناموجود» را نمایش می‌دهد.
تصویر می‌تواند faded شود.
کل Card نباید opacity پایین بگیرد.
31. Product Card Data

Product Card باید تا حد امکان از Product Model استفاده کند و منطق داخلی Commerce را خودش پیاده‌سازی نکند.

Product Card باید بتواند این موارد را نمایش دهد:

Product Image
Discount Badge
Product Title
Original Price
Discount
Final Price
Cart Action
Wishlist Action در صورت نیاز
Out of Stock State
32. Product Card States

ProductCard باید state-based باشد.

Stateهای مورد نیاز:

default
discounted
cart-active
image-placeholder
out-of-stock
loading
33. Variant Selection

Variant Selection باید در Product Detail انجام شود.

Product Detail باید بتواند:

Optionها را نمایش دهد.
انتخاب کاربر را دریافت کند.
Variant مناسب را پیدا کند.
Price Variant را نمایش دهد.
Stock Variant را نمایش دهد.
SKU Variant را در صورت نیاز نمایش دهد.
Image مربوط به Variant را در صورت وجود تغییر دهد.
Add to Cart را فقط در صورت معتبر بودن انتخاب و موجودی فعال کند.
34. Variant Resolver

منطق پیدا کردن Variant نباید داخل UI پراکنده شود.

باید Utility / Domain Function مستقل داشته باشیم.

مثلاً:

findVariant(
  product,
  selectedOptions
)

ورودی:

{
  color: "black",
  size: "m"
}

خروجی:

ProductVariant | null

مثال:

Selected:
Color = Black
Size = M

Result:
variant-001
35. Variant Availability

UI باید بتواند تشخیص دهد کدام Option Valueها قابل انتخاب هستند.

مثلاً:

Black
M   ✓
L   ✕
XL  ✓

اگر Black + L وجود نداشته باشد، L باید disabled شود.

این منطق باید بر اساس Variantها محاسبه شود.

36. Product Images and Variants

Product دارای Imageهای اصلی است:

images: ProductImage[]

Variant می‌تواند Imageهای خاص خودش را reference کند:

imageIds?: string[]

مثلاً:

White Variant
→ image-02
→ image-03

با انتخاب White، Product Detail می‌تواند تصاویر مربوط به آن Variant را نمایش دهد.

37. Product Data Example

نمونه کامل:

export const products: Product[] = [
  {
    id: "product-001",

    slug: "black-womens-dress",

    title: "پیراهن زنانه مدل کلاسیک",

    description:
      "پیراهن زنانه با طراحی مینیمال و مناسب استفاده روزمره و مهمانی.",

    brand: {
      id: "brand-001",
      name: "Brand One",
      slug: "brand-one",
      logo: "/images/brands/brand-one.svg"
    },

    category: {
      id: "category-dresses",
      name: "پیراهن زنانه",
      slug: "womens-dresses"
    },

    images: [
      {
        id: "product-001-image-01",
        url: "/images/products/product-001/01.webp",
        alt: "پیراهن زنانه مشکی",
        sortOrder: 0
      },

      {
        id: "product-001-image-02",
        url: "/images/products/product-001/02.webp",
        alt: "پیراهن زنانه سفید",
        sortOrder: 1
      }
    ],

    options: [
      {
        id: "color",

        name: "رنگ",

        type: "color",

        required: true,

        sortOrder: 0,

        values: [
          {
            id: "black",
            label: "مشکی",
            value: "#000000",

            sortOrder: 0,

            metadata: {
              hex: "#000000"
            }
          },

          {
            id: "white",
            label: "سفید",
            value: "#FFFFFF",

            sortOrder: 1,

            metadata: {
              hex: "#FFFFFF"
            }
          }
        ]
      },

      {
        id: "size",

        name: "سایز",

        type: "size",

        required: true,

        sortOrder: 1,

        values: [
          {
            id: "m",
            label: "M",
            value: "M",
            sortOrder: 0
          },

          {
            id: "l",
            label: "L",
            value: "L",
            sortOrder: 1
          },

          {
            id: "xl",
            label: "XL",
            value: "XL",
            sortOrder: 2
          }
        ]
      }
    ],

    variants: [
      {
        id: "variant-001",

        sku: "DR-BLK-M",

        optionValues: [
          {
            optionId: "color",
            valueId: "black"
          },

          {
            optionId: "size",
            valueId: "m"
          }
        ],

        pricing: {
          price: 1890000,
          compareAtPrice: 2190000,
          discountPercent: 14
        },

        inventory: {
          stock: 12,
          trackStock: true,
          allowBackorder: false
        },

        imageIds: [
          "product-001-image-01"
        ],

        status: "active"
      },

      {
        id: "variant-002",

        sku: "DR-BLK-L",

        optionValues: [
          {
            optionId: "color",
            valueId: "black"
          },

          {
            optionId: "size",
            valueId: "l"
          }
        ],

        pricing: {
          price: 1890000,
          compareAtPrice: 2190000,
          discountPercent: 14
        },

        inventory: {
          stock: 0,
          trackStock: true,
          allowBackorder: false
        },

        imageIds: [
          "product-001-image-01"
        ],

        status: "active"
      },

      {
        id: "variant-003",

        sku: "DR-BLK-XL",

        optionValues: [
          {
            optionId: "color",
            valueId: "black"
          },

          {
            optionId: "size",
            valueId: "xl"
          }
        ],

        pricing: {
          price: 1990000,
          compareAtPrice: 2290000,
          discountPercent: 13
        },

        inventory: {
          stock: 4,
          trackStock: true,
          allowBackorder: false
        },

        imageIds: [
          "product-001-image-01"
        ],

        status: "active"
      },

      {
        id: "variant-004",

        sku: "DR-WHT-M",

        optionValues: [
          {
            optionId: "color",
            valueId: "white"
          },

          {
            optionId: "size",
            valueId: "m"
          }
        ],

        pricing: {
          price: 1990000
        },

        inventory: {
          stock: 5,
          trackStock: true,
          allowBackorder: false
        },

        imageIds: [
          "product-001-image-02"
        ],

        status: "active"
      },

      {
        id: "variant-005",

        sku: "DR-WHT-L",

        optionValues: [
          {
            optionId: "color",
            valueId: "white"
          },

          {
            optionId: "size",
            valueId: "l"
          }
        ],

        pricing: {
          price: 1990000
        },

        inventory: {
          stock: 0,
          trackStock: true,
          allowBackorder: false
        },

        imageIds: [
          "product-001-image-02"
        ],

        status: "active"
      }
    ],

    pricing: {
      minPrice: 1890000,
      maxPrice: 1990000,
      minCompareAtPrice: 2190000,
      hasDiscount: true
    },

    inventory: {
      totalStock: 21,
      trackStock: true,
      hasAvailableVariants: true
    },

    tags: [
      "زنانه",
      "پیراهن",
      "تخفیف"
    ],

    status: "active",

    createdAt: "2026-01-10T10:00:00Z",

    updatedAt: "2026-01-15T12:00:00Z"
  }
]
38. Mock Data Requirements

Mock Data باید فقط برای تست UI و رفتار Commerce باشد.

Mock Data نباید داخل Componentها نوشته شود.

ساختار:

data/
├── products.ts
├── categories.ts
├── brands.ts
└── banners.ts
39. Required Mock Product Scenarios

Mock Data باید حداقل این حالت‌ها را پوشش دهد:

Product 1

محصول عادی:

بدون تخفیف
دارای Color + Size
چند Variant
Product 2

محصول تخفیف‌دار:

compareAtPrice
discountPercent
price
Product 3

محصول با قیمت متفاوت بین Variantها:

M → 1,890,000
L → 1,890,000
XL → 1,990,000
Product 4

محصول دارای Variant ناموجود:

Black / M → available
Black / L → out of stock
Black / XL → available
Product 5

محصول کاملاً ناموجود:

تمام Variantها:

stock = 0
Product 6

محصول دارای چند تصویر.

Product 7

محصول بدون تصویر یا دارای Placeholder.

Product 8

محصول بدون Brand.

Product 9

محصول بدون تخفیف.

Product 10

محصول با Colorهای متعدد.

40. Mock Data Separation

Component نباید مستقیماً این کار را انجام دهد:

import products from "@/data/products"

در Componentهای reusable.

بهتر است:

Data
 ↓
Page / Container
 ↓
Component

مثلاً:

<ProductCard product={product} />

نه اینکه ProductCard خودش Mock Data را import کند.

41. API Future Compatibility

Backend آینده می‌تواند Product را با API برگرداند.

UI نباید بداند داده از:

Mock Data

آمده یا:

API

ساختار منطقی باید این باشد:

Mock/API
   ↓
Data / Domain Layer
   ↓
Product Model
   ↓
UI Components
42. DTO و Domain Model

در آینده ممکن است API دقیقاً همین ساختار را برنگرداند.

مثلاً Backend ممکن است DTO متفاوتی داشته باشد.

در این حالت باید Mapping در Data Layer انجام شود.

API DTO
   ↓
Mapper
   ↓
Domain Product
   ↓
UI

بنابراین UI نباید مستقیماً به API Response وابسته شود.

43. Cart Compatibility

Cart در آینده نباید فقط Product ID ذخیره کند.

Cart Item باید حداقل بتواند:

productId
variantId
quantity

را نگه دارد.

مثال:

{
  productId: "product-001",
  variantId: "variant-001",
  quantity: 2
}

دلیل:

دو خرید از یک Product می‌توانند Variant متفاوت داشته باشند.

مثلاً:

Black / M
Black / L

هر دو یک Product هستند ولی Variant متفاوت دارند.

44. Order Compatibility

Order نیز باید Variant را بشناسد.

Order Item در آینده باید حداقل اطلاعاتی مانند:

productId
variantId
productTitle
variant information
sku
quantity
unit price
total price

را در زمان خرید ذخیره کند.

Order نباید صرفاً به Product فعلی وابسته باشد، چون اطلاعات Product ممکن است بعداً تغییر کند.

45. Inventory Compatibility

Inventory آینده باید بتواند Variant-level باشد.

مثلاً:

Product:
پیراهن زنانه

Variant:
Black / M
Stock: 12

Variant:
Black / L
Stock: 0

Variant:
White / M
Stock: 5

پنل مدیریت آینده باید بتواند موجودی هر Variant را مدیریت کند.

46. Admin Compatibility

مدل داده باید برای Admin Panel آینده مناسب باشد.

Admin Product Management باید بتواند:

Product ایجاد کند.
Product ویرایش کند.
Product حذف/Archive کند.
Category تعیین کند.
Brand تعیین کند.
تصاویر اضافه کند.
Option اضافه کند.
Option Value اضافه کند.
Variant ایجاد کند.
SKU تعیین کند.
قیمت Variant را تعیین کند.
قیمت قبل از تخفیف تعیین کند.
موجودی Variant را تعیین کند.
Variant را فعال/غیرفعال کند.
47. Discount Compatibility

نسخه اول تخفیف می‌تواند مستقیماً در Variant Pricing ذخیره شود.

اما Data Model نباید مانع ساخت سیستم Discount مستقل در آینده شود.

در آینده ممکن است:

Discount

یک Entity مستقل باشد.

مثلاً:

Discount
├── type
├── value
├── startAt
├── endAt
├── productIds
├── variantIds
└── conditions

در آن زمان قیمت نهایی می‌تواند در Domain Layer محاسبه شود.

48. Do Not Hard-code Variant Types in Product

نباید:

type Product = {
  colors: Color[]
  sizes: Size[]
}

ساخته شود.

همچنین نباید در Product:

color?: string
size?: string

به عنوان ساختار اصلی Variant استفاده شود.

ساختار اصلی باید:

options: ProductOption[]
variants: ProductVariant[]

باشد.

49. UI Limitation in Version One

با وجود Generic بودن Data Model، UI نسخه اول فقط باید این Optionها را به صورت رسمی پشتیبانی کند:

Color
Size

یعنی فعلاً:

Color → Color Swatch
Size → Size Selector

Option Typeهای دیگر فقط در Data Model قابل تعریف هستند و تا زمان پیاده‌سازی UI مربوطه نمایش داده نمی‌شوند.

50. Future Option Example

در آینده می‌توان بدون تغییر اساسی ساختار Product:

{
  id: "material",

  name: "جنس",

  type: "material",

  required: false,

  sortOrder: 2,

  values: [
    {
      id: "cotton",
      label: "نخی",
      value: "cotton",
      sortOrder: 0
    },

    {
      id: "linen",
      label: "لینن",
      value: "linen",
      sortOrder: 1
    }
  ]
}

اضافه کرد.

51. Generic Option UI

در آینده UI می‌تواند بر اساس:

option.type

تصمیم بگیرد چه Selectorای استفاده شود.

مثلاً:

color
→ ColorSwatch

size
→ SizeSelector

material
→ Chips / Select

style
→ Chips

capacity
→ Select

custom
→ GenericSelector

این رفتار نباید باعث تغییر Product Model شود.

52. Data Integrity Rules

قواعد مهم:

هر Product باید id یکتا داشته باشد.
هر Product باید slug یکتا داشته باشد.
هر Variant باید id یکتا داشته باشد.
SKU در صورت وجود باید یکتا باشد.
هر Variant باید به Option Valueهای معتبر اشاره کند.
هر Option Value باید متعلق به همان Option باشد.
ترکیب Variantها نباید Duplicate باشد.
Variant فعال بدون Option مورد نیاز نباید ایجاد شود.
موجودی منفی نباید مجاز باشد.
قیمت نباید منفی باشد.
compareAtPrice در صورت وجود باید از price بزرگ‌تر باشد.
Variant ناموجود نباید قابل Add to Cart باشد مگر allowBackorder فعال باشد.
53. Price Formatting

Data Model قیمت را به صورت Number نگه می‌دارد.

مثال:

price: 1890000

نباید:

price: "1,890,000 تومان"

ذخیره شود.

Formatting باید در UI / Formatting Utility انجام شود.

54. Currency

نسخه اول فروشگاه با تومان نمایش داده می‌شود.

اما مقدار قیمت باید Number خام باشد.

مثلاً:

1890000

و نمایش:

۱,۸۹۰,۰۰۰ تومان

توسط Formatter انجام شود.

55. Date Format

در Data Model تاریخ‌ها به صورت ISO String ذخیره شوند:

createdAt: "2026-01-10T10:00:00Z"

نمایش فارسی تاریخ باید در Presentation Layer انجام شود.

56. Recommended File Structure

ساختار پیشنهادی:

src/
├── types/
│   ├── product.ts
│   ├── variant.ts
│   ├── category.ts
│   └── brand.ts
│
├── data/
│   ├── products.ts
│   ├── categories.ts
│   ├── brands.ts
│   └── banners.ts
│
├── lib/
│   ├── product/
│   │   ├── find-variant.ts
│   │   ├── variant-availability.ts
│   │   └── product-pricing.ts
│   │
│   └── formatting/
│       ├── currency.ts
│       └── date.ts

اگر پروژه در ابتدا کوچک باشد، می‌توان بعضی Typeها را نیز در:

src/types/product.ts

نگه داشت و بعداً در صورت رشد پروژه تفکیک کرد.

57. Recommended Domain Utilities

منطق زیر باید خارج از UI باشد:

findVariant()
getVariantAvailability()
getProductPriceRange()
getProductStockStatus()
isVariantAvailable()
calculateDiscountPercent()
formatPrice()

هدف این است که ProductCard و ProductDetail تبدیل به محل انباشته شدن Business Logic نشوند.

58. Product Card vs Product Detail

Product Card:

Product Summary

را نمایش می‌دهد.

Product Detail:

Full Product
+
Options
+
Variant Selection

را مدیریت می‌کند.

Product Card نباید مسئول انتخاب پیچیده Variant باشد.

59. Product Listing

در Product Listing بهتر است Product Summary استفاده شود.

در صورت نیاز می‌توان در آینده API برای Listing داده‌ای مانند:

ProductListItem

برگرداند.

اما Domain Model اصلی Product همچنان مستقل باقی می‌ماند.

60. Performance Considerations

در نسخه اول Mock Data می‌تواند Product کامل را داشته باشد.

اما در آینده API برای Product Listing نباید الزاماً تمام Variantها و تصاویر را ارسال کند.

مثلاً:

Product List API
→ Summary

Product Detail API
→ Full Product + Variants

بنابراین Data Architecture باید امکان داشتن View Modelهای مختلف را داشته باشد.

61. Main Architectural Principle

ساختار نهایی باید این رابطه را حفظ کند:

Product
│
├── Basic Information
│   ├── id
│   ├── slug
│   ├── title
│   └── description
│
├── Taxonomy
│   ├── brand
│   └── category
│
├── Media
│   └── images
│
├── Options
│   ├── Color
│   └── Size
│
├── Variants
│   ├── SKU
│   ├── Option Values
│   ├── Pricing
│   ├── Inventory
│   └── Images
│
├── Product Pricing Summary
│
├── Product Inventory Summary
│
└── Metadata
    ├── tags
    ├── status
    ├── createdAt
    └── updatedAt
62. Final Rules

این Context باید به عنوان مرجع Product Data Model در نظر گرفته شود.

قواعد اصلی:

Product Generic باشد.
Variant Generic باشد.
نسخه اول فقط Color و Size را در UI فعال کند.
Option Typeهای آینده از ابتدا قابل پشتیبانی باشند.
قیمت اصلی در Variant باشد.
موجودی اصلی در Variant باشد.
SKU در Variant باشد.
Product Pricing فقط Summary باشد.
Product Inventory فقط Summary باشد.
Variant انتخاب‌شده در Cart و Order با variantId مشخص شود.
تصاویر Product مستقل باشند.
Variant در صورت نیاز به Imageهای خاص reference کند.
Mock Data از UI جدا باشد.
UI مستقیماً به Mock Data وابسته نباشد.
API آینده از طریق Data/Domain Layer به UI متصل شود.
Business Logic مربوط به Variant و Pricing داخل Utility/Domain Layer باشد.
Product Card نباید مسئول Business Logic پیچیده باشد.
Product Detail مسئول Variant Selection است.
Data Model نباید به Color و Size hard-code شود.
اضافه کردن Variant Type جدید نباید نیازمند بازنویسی Product Model باشد.
هیچ قیمت یا موجودی به صورت formatted string در Data Model ذخیره نشود.
Data Model باید برای Admin Panel، Inventory، Cart، Checkout و Order آینده آماده باشد.

این Context از نظر من برای مرحله فعلی **کامل و کافی است** و لازم نیست فعلاً آن را بیش از این پیچیده کنیم. مهم‌ترین تصمیمش هم این است که **Option و Variant را Generic نگه داریم، ولی در UI نسخه اول فقط Color و Size را فعال کنیم**. این دقیقاً همان تعادلی است که برای یک قالب آماده فروش و قابل ارتقا لازم داریم.    