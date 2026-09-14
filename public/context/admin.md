# Admin Panel Context & Specification

> این فایل مرجع اصلی طراحی و پیاده‌سازی پنل ادمین است. AI Agent باید قبل از هرگونه طراحی، کدنویسی، ریفکتور یا Review آن را مطالعه کند. الزامات صریح این فایل Constraint هستند. اگر موردی مشخص نشده، ساده‌ترین راه‌حل قابل توسعه را انتخاب کن و در تصمیم‌های معماری/بیزینسی مهم سؤال بپرس.

---

## 1. Project Context

پروژه یک فروشگاه اینترنتی فارسی و RTL در حوزه مد زنانه/دخترانه است:

- لباس
- کفش
- کیف و اکسسوری
- ساعت
- محصولات مرتبط با Fashion

تکنولوژی فعلی:

- React
- Next.js
- Tailwind CSS
- Persian RTL
- Peyda
- Light Mode
- Mock Data
- بدون Backend در فاز فعلی

Backend در آینده یک API مستقل خواهد بود.

### اصل مهم

Admin نباید Product/Order Model جداگانه‌ای بسازد، اگر Domain Model موجود پروژه قابلیت استفاده مجدد دارد.

Admin و Storefront باید روی همان مفاهیم Domain کار کنند.

---

# 2. هدف پنل ادمین

پنل Admin یک Operational Workspace است، نه یک فروشگاه دوم و نه صرفاً مجموعه‌ای از CRUD Pageها.

اهداف اصلی:

1. انجام سریع کارهای پرتکرار
2. جلوگیری از گم‌شدن ادمین
3. Bulk Operation ساده و سریع
4. کاهش Navigation غیرضروری
5. مشخص بودن Action بعدی
6. UI مینیمال و حرفه‌ای
7. استفاده راحت در Desktop و Mobile
8. استفاده از Design System موجود
9. کار با Mock Data فعلی
10. آماده بودن معماری برای API آینده

### اصل طلایی

> کار زیاد در زمان کمتر، بدون اینکه UI پیچیده و گیج‌کننده شود.

---

# 3. Roles & Permissions

فعلاً دو سطح دسترسی مفهومی داریم.

## 3.1 Admin / Super Admin

دسترسی کامل به:

- Products
- Categories
- Inventory
- Inventory History
- Orders
- Returns
- Customers
- Tickets
- Discounts
- Free Shipping Campaign
- Admin / Support Accounts
- Settings و قابلیت‌های مدیریتی آینده

## 3.2 Support

تیم پشتیبانی Account مستقل دارد و دسترسی محدود دریافت می‌کند.

وظایف اصلی:

- مشاهده اطلاعات مشتری
- مشاهده سفارش مشتری
- مشاهده جزئیات سفارش
- مشاهده اطلاعات ارسال مرتبط
- مشاهده و پاسخ به Ticket
- کمک به مشتری

دسترسی‌های عملیاتی حساس نباید به‌صورت پیش‌فرض در اختیار Support باشد، از جمله:

- تغییر Inventory
- ایجاد/ویرایش Product
- مدیریت Discount
- مدیریت Admin Users
- Settings

### Permission Architecture

حتی با وجود فقط دو Role، Permissionها باید متمرکز باشند:

```text
Role
  ↓
Permissions
  ↓
Route Guards + Action Guards
```

Permissionها نباید به‌صورت پراکنده داخل Componentها Hardcode شوند.

---

# 4. Information Architecture

ساختار پیشنهادی:

```text
Admin Panel
│
├── Dashboard
│
├── Store
│   ├── Products
│   ├── Categories
│   └── Inventory
│       └── Inventory History
│
├── Sales
│   ├── Orders
│   └── Returns
│
├── Customers
│
├── Support
│   ├── Tickets
│   └── Ticket Details
│
├── Marketing
│   ├── Discounts
│   └── Free Shipping
│
└── Settings
    └── Admin / Support Accounts
```

این ساختار راهنمای معماری است؛ برای هر قابلیت صفحه جدا نساز مگر اینکه Workflow واقعاً به آن نیاز داشته باشد.

### Navigation Principle

هر بخش باید یک Primary Job واضح داشته باشد:

- Products → ایجاد و مدیریت محصولات
- Inventory → تغییر سریع موجودی
- Orders → فهمیدن سفارش‌هایی که نیاز به Action دارند
- Customers → شناخت مشتری و سابقه او
- Tickets → پاسخ سریع به مشتری
- Discounts → مدیریت تخفیف‌های فعال

---

# 5. Dashboard

Dashboard باید Operational باشد، نه Analytics-heavy.

سؤال اصلی:

> الان چه چیزی نیاز به توجه من دارد؟

موارد پیشنهادی:

- سفارش‌های نیازمند بررسی
- Ticketهای باز
- محصولات ناموجود
- محصولات Low Stock

Quick Actions:

- افزودن محصول
- مدیریت موجودی
- سفارش‌های جدید
- Ticketها

در V1 از نمودارها و KPIهای زیاد خودداری شود.

---

# 6. Admin UX Model

پنل باید Hybrid باشد:

## Full Pages

برای:

- Product Creation
- Product Editing
- Complex Details
- لیست‌های بزرگ
- Workflowهای پیچیده

## Quick Actions

برای:

- تغییر وضعیت سفارش
- تغییر موجودی
- تغییر وضعیت محصول
- Actionهای پرتکرار

## Inline Edit

برای داده‌های ساده و کم‌ریسک.

## Bulk Actions

قابلیت Core:

- افزایش موجودی محصولات/Variants انتخاب‌شده
- تنظیم موجودی
- اعمال تخفیف روی محصولات انتخاب‌شده
- تغییر وضعیت در موارد مجاز
- Print گروهی سفارش‌ها

## Drawer

برای مشاهده Context بدون خروج از لیست:

- Quick Order Details
- Quick Customer Details
- Product Preview

## Modal

برای:

- Confirmation
- عملیات کوتاه
- وارد کردن مقدار تغییر موجودی

Modal برای فرم‌های طولانی استفاده نشود.

## Keyboard Shortcuts

برای Desktop و کارهای پرتکرار قابل استفاده است، اما نباید اجباری باشد.

---

# 7. Visual Direction

Admin باید:

- Minimal
- Professional
- Clean
- Easy to Scan
- RTL
- Light Mode

باشد.

پرهیز از:

- Border زیاد
- Card زیاد
- Nested Card
- Shadow سنگین
- Iconهای بزرگ
- فضای خالی بی‌دلیل
- Decoration غیرضروری
- رنگ‌های زیاد
- Animationهای نمایشی

### Surface Direction

```text
Page:      #FFFFFF
Surface:   #F8F8F8
Secondary: #F1F1F1
Divider:   #E5E5E5
```

Hierarchy بیشتر با Surface، Typography و Spacing ساخته شود، نه Border.

Border برای Input، Selected State و موارد Functionally Necessary مجاز است.

### Typography

Peyda.

Mobile:

- 10px
- 12px
- 14px
- 16px
- 24px

Desktop می‌تواند متناسب Scale شود، ولی Hierarchy حفظ شود.

### Spacing

فقط از Scale موجود تا حد امکان استفاده شود:

```text
0 / 4 / 8 / 16 / 24 / 36px
```

### Radius

```text
0 / 4 / 8 / 9999px
```

---

# 8. Icons

Lucide Icons.

ترجیحاً Import تکی.

اندازه‌های پیشنهادی:

- 14–16px → Inline Metadata
- 18–20px → Standard UI
- 20–24px → Icon Button

Hit Area تعاملی معمولاً 36–44px.

Icon برای Meaning است، نه Decoration.

---

# 9. Responsive

Target:

- 390px
- 428px
- Tablet
- 1440px

Mobile نباید Desktop کوچک‌شده باشد.

## Desktop

- Sidebar
- Table در جاهایی که مقایسه داده مفید است
- Multi-column
- Bulk Selection
- Quick Actions
- Drawer

## Mobile

- Sidebar به Drawer
- List/Card به جای Tableهای عریض
- Bottom Sheet برای Select/Filter در موارد مناسب
- Sticky Action Area برای Actionهای مهم
- Touch-friendly controls
- بدون Horizontal Page Overflow

Bulk Operation باید روی Mobile نیز راحت باشد.

---

# 10. Products

Products یکی از مهم‌ترین بخش‌های V1 است.

Admin باید همان اطلاعاتی را مدیریت کند که در Mock Product فعلی پروژه وجود دارد.

**Mock Product Data Model منبع اصلی است.**

Admin نباید Model متفاوت و ناقص بسازد.

اطلاعات ممکن است شامل موارد زیر باشد، فقط در صورت وجود در Model فعلی:

- Name
- Slug
- Brand
- Category
- Subcategory
- Images
- Description
- Tags
- Attributes / Specifications
- Variants
- Color
- Size
- SKU
- Price
- Discount
- Final Price
- Inventory
- Size Guide
- Publish State
- Featured State

AI Agent قبل از ساخت Form باید Model واقعی پروژه را Inspect کند.

---

# 11. Product Creation / Editing

فرم Product نباید یک Form عظیم و بدون ساختار باشد.

ترتیب منطقی:

```text
Basic Information
↓
Images
↓
Category / Brand
↓
Description / Tags / Attributes
↓
Variants
↓
Pricing
↓
Inventory
↓
Publishing
```

Desktop: Sections واضح.

Mobile: در صورت نیاز Accordion.

ادمین همیشه باید بداند:

- کجای Form است
- چه چیزی Required است
- چه چیزی Optional است
- آیا تغییرات ذخیره شده‌اند
- چه چیزی ناقص است

---

# 12. Inventory

Inventory یک بخش مستقل و First-Class است.

دو نوع مدیریت:

1. Single Item
2. Bulk

### Single

```text
Stock: 12

[-] 12 [+]

[Edit Stock]
```

### Bulk

```text
3 items selected

[+5 Stock]
[Set Stock]
[Decrease Stock]
```

Bulk Adjustment باید بتواند:

- Productهای انتخاب‌شده
- Variantهای انتخاب‌شده
- Amount
- Reason

را مدیریت کند.

مثال:

```text
Increase Stock

Amount: 5

Reason:
[New Stock]

[Apply to 3 selected items]
```

### اصل UX

ادمین نباید برای افزایش 5 عدد موجودی مجبور باشد تک‌تک Productها را باز کند.

---

# 13. Inventory History

تاریخچه موجودی Required است.

اطلاعات مفید:

- Product
- Variant
- Previous Quantity
- Change Amount
- New Quantity
- Reason
- Actor
- Timestamp
- Source

مثال:

```text
Product       Change   New Stock   Reason       Actor    Time

Linen Shirt   +5       17          New Stock    Admin    10:42
Linen Shirt   -2       15          Sale         System   12:31
Handbag       +10      20          New Stock    Admin    14:20
```

دو مسیر دسترسی:

```text
Inventory → History
```

و:

```text
Product → Inventory → History
```

---

# 14. Categories

Admin باید Categoryها را مدیریت کند.

Category Model باید با Storefront و Routeهای فعلی سازگار باشد.

از ساخت Identifier یا Slug ناسازگار جلوگیری شود.

UI باید ساده باشد و فقط عمق مورد نیاز Model فعلی را پشتیبانی کند.

---

# 15. Orders

Workflow سفارش:

```text
در حال بررسی
      ↓
در حال آماده‌سازی
      ↓
تحویل به پست
      ↓
ارسال شد
      ↓
تحویل داده شد
```

مسیرهای جانبی:

```text
در حال بررسی → لغو شده

Order واجد شرایط → درخواست مرجوعی
```

## Ownership Status

Admin-controlled:

- در حال بررسی
- در حال آماده‌سازی
- تحویل به پست
- لغو شده

Shipping Provider-controlled:

- ارسال شد
- تحویل داده شد

اگر این وضعیت‌ها از شرکت پست دریافت می‌شوند، Admin نباید بتواند آن‌ها را دستی تغییر دهد.

---

# 16. Order Processing UX

به جای Status Dropdown عمومی، Action بعدی را Contextual نشان بده.

مثال:

```text
#12452
در حال بررسی

Stock:
✓ همه محصولات موجود است

[شروع آماده‌سازی]
[مشاهده جزئیات]
```

بعد:

```text
در حال آماده‌سازی

[تحویل به پست]
[مشاهده جزئیات]
```

بعد:

```text
تحویل به پست

Tracking Code:
123456789

Shipping Status:
...
```

هدف: Action بعدی همیشه واضح باشد.

---

# 17. Order Details

Order Detail باید اطلاعات کامل ولی قابل Scan داشته باشد:

- Order Number
- Status
- Date
- Customer
- Products
- Variants
- Quantity
- Purchased Prices
- Shipping Method
- Shipping Cost
- Tracking Information
- Address
- Postal Code
- Payment
- Totals
- Cancellation / Return information در صورت وجود

Actionها:

- Change Valid Status
- Cancel در صورت مجاز بودن
- Print
- Shipping Details
- Product Details
- Return Handling

اطلاعات ثانویه را در صورت نیاز با `مشاهده جزئیات` باز کن تا صفحه سنگین نشود.

---

# 18. Order Item Snapshot

Order نباید فقط به Product فعلی وابسته باشد.

در زمان خرید باید Snapshot منطقی ذخیره شود:

```text
Product Snapshot
Variant Snapshot
Purchased Unit Price
Quantity
```

تغییرات آینده Product نباید تاریخچه Order را تغییر دهد.

---

# 19. Printing

Print مورد نیاز است:

- یک Order
- چند Order به‌صورت Bulk

Bulk Print باید پشتیبانی شود.

ترجیحاً Printable Representation مستقل داشته باشیم:

```text
PrintableOrder
PrintableOrderList
```

در آینده امکان توسعه به Shipping Label وجود دارد.

---

# 20. Order Cancellation

Admin باید بتواند Order را در وضعیت‌های مجاز Cancel کند.

Cancellation باید:

- Confirmation داشته باشد
- Consequence را واضح کند
- Status را تغییر دهد
- Inventory را طبق Business Rule اصلاح کند
- History را حفظ کند

Order نباید با Delete از سیستم ناپدید شود.

---

# 21. Returns

مشتری می‌تواند درخواست مرجوعی ثبت کند.

Admin باید بتواند:

- Return Request را ببیند
- جزئیات را مشاهده کند
- Order مرتبط را ببیند
- Customer را ببیند
- Items خریداری‌شده را ببیند
- Request را بررسی کند
- طبق Workflow واقعی کسب‌وکار آن را پردازش کند

Business Ruleهای پیچیده Return/Refund هنوز مشخص نشده‌اند و Agent نباید آن‌ها را حدس بزند.

---

# 22. Customers

Admin و Support برای Customer Service به اطلاعات مشتری نیاز دارند.

Customer Detail می‌تواند شامل:

- اطلاعات مشتری
- Phone
- Addresses
- Orders
- Order Details
- Tickets
- Customer History

باشد.

Admin مجاز به Edit اطلاعات مشتری است.

Support طبق Permission Matrix فقط اطلاعات مجاز را مشاهده/ویرایش می‌کند.

---

# 23. Customer Context

Support نباید برای حل یک مشکل مجبور به رفت‌وآمد زیاد بین صفحات باشد.

در Ticket مرتبط با Order:

```text
Ticket
 ↓
Customer Context
 ↓
Related Order
 ↓
Relevant Order Information
```

در Customer Detail نیز دسترسی سریع به:

- Recent Orders
- Open Tickets
- Addresses
- Customer Information

وجود داشته باشد.

---

# 24. Tickets / Support

Ticket System Required است.

ساختار:

```text
Tickets
  ↓
Ticket List
  ↓
Ticket Detail
```

Ticket List:

- Search
- Status Filter
- Customer
- Related Order
- Sorting در صورت نیاز

Statusهای اولیه می‌توانند:

- Open
- Waiting for Response
- Closed

باشند.

اگر پروژه Status دیگری دارد، همان Source of Truth استفاده شود.

---

# 25. Ticket Detail

Ticket Detail باید Conversation Workspace باشد:

```text
Ticket #245

Customer
...

Related Order
#12452

────────────────

Customer:
...

Support:
...

Customer:
...

────────────────

[Write Reply...]

[Send Reply]
```

Context مشتری و سفارش مرتبط باید بدون Navigation اضافی قابل دسترسی باشد.

---

# 26. Discounts

Discount System در V1 متوسط و ساده است.

Requirements:

- Percentage Only
- Direct Apply
- No Coupon Code
- Expiration Date
- Usage Limit
- Apply to Selected Products
- Apply to Category
- Filtering
- Active / Inactive

مثال:

```text
Percentage: 20%

Apply To:
- Selected Products
- Category

Expires:
...

Usage Limit:
...

Status:
Active
```

Coupon Code وجود ندارد.

---

# 27. Bulk Discounts

Admin باید بتواند با Filter محصول‌ها را پیدا و انتخاب کند.

مثال:

```text
Category: Bags
Brand: ...
Price: ...
Stock: ...

☐ Bag A
☐ Bag B
☐ Bag C

3 selected

Discount: 20%
Expires: ...

[Apply Discount]
```

قبل از Apply شدن Bulk Change باید Scope تغییر واضح باشد.

---

# 28. Free Shipping Campaign

کمپین ارسال رایگان جدا از Discount باشد.

V1 ساده:

- Active / Inactive
- Start Date
- End Date

شرایط آینده می‌تواند شامل:

- Minimum Order Value
- Product/Category
- City/Region
- Shipping Method

باشد.

در V1 شرط پیچیده اضافه نشود مگر نیاز واقعی ایجاد شود.

---

# 29. Search

Search در صفحات عملیاتی مهم است.

باید:

- Fast
- Predictable
- Persian-friendly
- RTL-aware

باشد.

### Products

- Name
- SKU
- Brand
- Category

### Orders

- Order Number
- Customer Phone
- Customer Name
- Tracking Code در صورت وجود

### Customers

- Name
- Phone

### Tickets

- Ticket ID
- Customer
- Subject

Persian normalization موجود پروژه استفاده شود.

---

# 30. Filters

Filter باید کار را سریع‌تر کند.

Common Filters را مستقیم نشان بده.

Advanced Filters پشت Filter Control باشند.

Filter Panel نباید بی‌دلیل عظیم شود.

Filterهای Domain مشترک تا حد امکان Reusable باشند.

---

# 31. Tables vs Lists

Desktop:

Table وقتی مقایسه چند داده مفید است.

Mobile:

Card/List وقتی Table عریض و سخت‌خوان می‌شود.

Table Desktop را صرفاً با کوچک کردن روی Mobile قرار نده.

---

# 32. Bulk Selection

Bulk Selection باید همیشه نشان دهد:

1. چند Item انتخاب شده
2. چه Actionهایی مجازند
3. Action روی چه Scopeای اعمال می‌شود

مثال:

```text
3 products selected

[Increase Stock]
[Apply Discount]
```

Actionهای Destructive از سایر Actionها جدا باشند.

---

# 33. Destructive Actions

برای:

- Cancel Order
- Delete Product
- Delete Category
- Bulk Destructive Operation

Confirmation لازم است.

Confirmation باید بگوید:

- چه چیزی تغییر می‌کند
- چند Item تحت تأثیر است
- Consequence مهم چیست

Label مبهم استفاده نشود.

---

# 34. Loading / Empty / Error

هر صفحه عملیاتی باید این حالت‌ها را داشته باشد:

- Loading
- Empty
- Error
- Partial Data
- Permission Denied
- Success

Mutation مهم نباید فقط با Toast نشان داده شود؛ UI اصلی نیز باید State جدید را نمایش دهد.

---

# 35. Success Feedback

کوتاه و Contextual:

```text
موجودی با موفقیت افزایش یافت.
```

```text
وضعیت سفارش تغییر کرد.
```

```text
تخفیف روی ۱۲ محصول اعمال شد.
```

Animation غیرضروری ممنوع.

---

# 36. Confirmation Strategy

همه Actionها Confirmation نمی‌خواهند.

معمولاً بدون Confirmation:

- Inline quantity adjustment
- Filter
- Open detail
- Non-destructive changes

Confirmation مناسب:

- Cancel Order
- Delete
- Bulk Destructive Operation
- عملیات پرریسک و غیرقابل بازگشت

بر اساس Reversibility تصمیم بگیر.

---

# 37. Data Architecture

Mock Data فعلی Source of Truth فاز فعلی است.

از Duplicate Mock Data جلوگیری شود.

ترجیح:

```text
Domain Model
     ↓
Service / Store
     ↓
Admin UI
Storefront UI
```

در آینده:

```text
API
 ↓
Service Layer
 ↓
Same Domain Concepts
 ↓
Admin + Storefront
```

---

# 38. Service Abstraction

UI نباید مستقیماً به localStorage یا API آینده Coupled شود.

در صورت نیاز از Serviceهایی مثل:

```text
productService
categoryService
inventoryService
orderService
customerService
ticketService
discountService
adminUserService
```

استفاده شود.

نام دقیق باید با Convention پروژه هماهنگ باشد.

---

# 39. State & Persistence

از Existing State Architecture استفاده شود.

Multiple Sources of Truth ممنوع.

مثال:

```text
Product → Product Source
Cart → Cart Store
Wishlist → Wishlist Store
Orders → Order Source / Service
Inventory → Inventory Source / Service
```

اگر Store/Service موجود است، دوباره‌سازی نکن.

---

# 40. Order Lifecycle

مسیر کلی سیستم:

```text
Cart
 ↓
Checkout
 ↓
Payment
 ↓
Create Order
 ↓
Confirmation
 ↓
Orders
 ↓
Order Detail
 ↓
Tracking / Return / Support
```

Admin باید روی همان Order Lifecycle کار کند.

Admin نباید Order State مستقل و ناسازگار بسازد.

---

# 41. Centralized Status Mapping

Statusها یک Definition مرکزی داشته باشند.

نمونه داخلی:

```text
pending_review
preparing
handed_to_carrier
shipped
delivered
cancelled
return_requested
returned
refunded
```

نام داخلی باید با Convention واقعی پروژه هماهنگ باشد.

UI Labelها Centralized Mapping داشته باشند.

Status String در Componentهای مختلف پراکنده نشود.

---

# 42. Permission Guards

Permission فقط Route را کنترل نمی‌کند؛ Action را هم کنترل می‌کند.

مثال:

```text
Support:
  View Order       ✓
  View Customer    ✓
  Reply Ticket     ✓
  Cancel Order     ✕
  Edit Inventory   ✕
  Edit Discount    ✕
```

UI باید Action غیرمجاز را Hide یا Disable کند.

UI Permission Security Boundary نیست؛ Backend آینده باید Authorization واقعی داشته باشد.

---

# 43. Accessibility

Required:

- Semantic Buttons
- Labels
- Keyboard Navigation
- Visible Focus
- Escape برای Dialog/Drawer
- Focus Management
- ARIA فقط در صورت نیاز
- Status فقط با Color مشخص نشود
- دلیل Disabled بودن در صورت مفید بودن مشخص شود

---

# 44. RTL

کل Admin RTL است.

دقت ویژه در:

- Navigation
- Sidebar
- Tables
- Forms
- Drawers
- Breadcrumbs
- Pagination
- Directional Icons
- Keyboard behavior

---

# 45. Persian Data

در Numeric Inputها در صورت نیاز:

- Persian Digits
- English Digits

هر دو قابل قبول باشند.

قبل از Validation/Storage Normalize شوند.

موارد مهم:

- Phone
- Postal Code
- Price
- Quantity
- Tracking Code

---

# 46. Design System Reuse

Reuse اولویت دارد:

- Button
- Input
- Select
- Modal
- Drawer
- Badge
- Tabs
- Table
- Product Image
- Typography
- Spacing
- Icons

Duplicate Component نساز مگر Requirement واقعی داشته باشد.

---

# 47. Suggested Component Structure

ساختار پیشنهادی:

```text
components/admin/
├── layout/
│   ├── AdminShell
│   ├── AdminSidebar
│   ├── AdminHeader
│   └── MobileAdminNavigation
│
├── shared/
│   ├── AdminPageHeader
│   ├── DataTable
│   ├── FilterBar
│   ├── BulkActionBar
│   ├── StatusBadge
│   ├── ConfirmDialog
│   ├── DetailDrawer
│   └── EmptyState
│
├── products/
├── categories/
├── inventory/
├── orders/
├── customers/
├── tickets/
├── discounts/
└── settings/
```

ساختار واقعی باید با Project Convention هماهنگ باشد.

---

# 48. Avoid Over-Abstraction

قبل از وجود Use Case واقعی، Framework عمومی نساز.

از ساخت مواردی مثل:

```text
EverythingTable
UniversalDrawer
GenericWorkflowEngine
MegaFormBuilder
```

بدون نیاز واقعی خودداری شود.

Reusable Primitive بساز، نه Abstraction بی‌دلیل.

---

# 49. Performance

با رشد Dataset باید قابل توسعه باشد.

در آینده:

- Pagination
- Server-side Filtering
- Debounced Search
- Efficient Bulk Operations
- جلوگیری از Full-page Rerender غیرضروری
- Virtualization فقط در صورت نیاز واقعی

برای Mock Data کوچک Premature Optimization انجام نشود.

---

# 50. Audit / History

در آینده Actionهای عملیاتی باید قابل Audit باشند.

مهم‌ترین موارد:

- Inventory Adjustment
- Order Status Change
- Order Cancellation
- Discount Create/Edit
- Product Price Change
- Product Delete
- Customer Data Edit

Audit باید بتواند در آینده مشخص کند:

```text
What
Who
When
Before / After
```

Backend می‌تواند Implementation کامل را بر عهده بگیرد.

---

# 51. V1 Priority

## P0

1. Products
2. Product Create/Edit
3. Categories
4. Inventory
5. Bulk Inventory
6. Inventory History

## P1

7. Orders
8. Order Status Workflow
9. Order Details
10. Printing
11. Customers
12. Tickets

## P2

13. Returns
14. Discounts
15. Free Shipping
16. Admin/Support Accounts
17. Dashboard Improvements

Priority با تغییر Business Requirement قابل تغییر است.

---

# 52. Initial Daily Workflow

روزهای اول:

```text
Login
 ↓
Products
 ↓
Add / Edit Products
 ↓
Categories
 ↓
Inventory
 ↓
Bulk Stock Adjustment
 ↓
Inventory History
```

بعد از افزایش فروش:

```text
Dashboard
 ↓
Orders Requiring Action
 ↓
Check Inventory
 ↓
Prepare Order
 ↓
Hand Over to Carrier
 ↓
Monitor Shipping
 ↓
Answer Tickets
```

UI باید برای این Workflowها Optimize شود.

---

# 53. AI Agent Rules

قبل از Coding:

1. این فایل را بخوان.
2. Project Structure را Inspect کن.
3. Domain Models را Inspect کن.
4. Mock Data را Inspect کن.
5. Existing Services/Stores را پیدا کن.
6. Existing Routes را بررسی کن.
7. Design Tokens را بررسی کن.
8. Componentهای قابل Reuse را پیدا کن.

### ممنوع

- ساخت Product Model متناقض
- Duplicate Mock Data
- Duplicate Source of Truth
- تغییر Route بدون ضرورت
- تغییر رفتار Storefront هنگام کار روی Admin بدون دلیل
- افزودن Feature خارج از Scope
- Replace کردن Component موجود بدون دلیل
- فرض کردن Backend Behavior
- حدس زدن Business Ruleهای تعریف‌نشده
- Over-abstraction

---

# 54. Decision Rules for AI

اگر Requirement مبهم است:

اولویت تصمیم:

1. Existing Project Convention
2. Existing Domain Model
3. Existing Design System
4. Existing User Flow
5. Simplest Extensible Solution

اگر تصمیم فقط Visual است و Default منطقی دارد، ساده‌ترین گزینه را انتخاب کن.

اگر تصمیم روی Architecture یا Business Logic اثر جدی دارد، سؤال بپرس.

---

# 55. Definition of Done

Feature فقط وقتی Done است که UI رندر شود کافی نیست.

## Functionality

- Happy Path
- Empty
- Loading
- Error
- Validation
- Success
- Permission

## Data

- Correct Source of Truth
- No Duplicate Mock Data
- Correct Persistence
- Correct Relationships

## UX

- Common Workflow سریع
- Primary Action واضح
- Navigation حداقلی
- Bulk Action در صورت نیاز
- Stateهای قابل فهم

## Responsive

- 390px
- 428px
- Tablet
- 1440px

## Accessibility

- Keyboard
- Focus
- Labels
- Semantic Controls
- Dialog Behavior

## Architecture

- Reuse منطقی
- No unnecessary abstraction
- API-ready
- No unrelated regression

---

# 56. Non-Goals for V1

بدون Requirement صریح اضافه نشوند:

- Advanced Analytics
- Advanced Reporting
- Coupon Codes
- Multi-store
- Multi-warehouse
- Complex Role Hierarchy
- Accounting / ERP
- Full CRM
- Marketing Automation
- Complex Shipping Rules
- AI Product Content

---

# 57. Core Design Philosophy

Hierarchy تصمیم‌گیری:

```text
Clarity
  ↓
Speed
  ↓
Accuracy
  ↓
Scalability
  ↓
Visual Polish
```

هدف:

> ادمین باید همیشه بداند کجاست، چه کاری باید انجام دهد و سریع‌ترین راه انجام آن چیست.

---

# 58. Confirmed Requirements

موارد زیر قطعی هستند:

- Persian RTL
- Desktop + Mobile
- Admin + Limited Support Accounts
- Product Management based on Mock Data
- Category Management
- Single Inventory Management
- Bulk Inventory Management
- Inventory History
- Order Workflow
- Admin-controlled Order transitions
- Shipping-provider-driven shipping statuses
- Order Cancellation
- Return Requests
- Order Details
- Individual Print
- Bulk Print
- Percentage-only Discounts
- Direct Discounts
- Expiration
- Usage Limit
- Product/Category targeting
- Free Shipping Campaign
- Customer Information
- Customer Editing
- Ticket System
- Minimal UX
- Quick Actions
- Inline Edit
- Bulk Actions
- Drawer
- Modal
- Optional Keyboard Shortcuts
- Responsive Design
- Future API Compatibility

---

# 59. Open Business / Architecture Decisions

این موارد هنوز به‌صورت کامل مشخص نشده‌اند و Agent نباید بدون دلیل Business Rule بسازد:

- Exact Support Permission Matrix
- Exact Return / Refund Workflow
- Postal API Contract
- Free Shipping Conditions
- Discount Conflict / Stacking Rules
- Product Delete vs Archive
- Inventory Reservation Behavior
- Low Stock Threshold
- Pagination Strategy
- Exact Dashboard KPIs
- Admin Authentication Flow
- Full Audit Log Implementation
- Exact Print Document Format
- Shipping Label Requirements

---

# 60. Golden Rule

> **Admin Panel یک Operational Workspace است، نه مجموعه‌ای از CRUD Pageها.**

هر تصمیم طراحی یا کدنویسی را با این سؤال‌ها بررسی کن:

- آیا ادمین سریع پیدایش می‌کند؟
- آیا با Interaction کمتر می‌تواند کار را انجام دهد؟
- آیا Action بعدی واضح است؟
- آیا امکان Bulk Operation وجود دارد؟
- آیا عملیات امن و قابل فهم است؟
- آیا روی Mobile هم قابل استفاده است؟
- آیا از Domain Model موجود استفاده می‌کند؟
- آیا از Duplicate Data جلوگیری می‌کند؟
- آیا برای انتقال Mock Data به API آماده است؟

اگر پاسخ مثبت است، راه‌حل با این Specification هم‌راستا است.
