PROJECT CONTEXT
Persian RTL Fashion E-Commerce Template

Status: Design System & Architecture Discovery
Version: 0.1
Platform: Web
Framework: React + Next.js
Styling: Tailwind CSS
Primary Language: Persian
Direction: RTL
Design Approach: Mobile First
Theme: Light Only

1. Project Overview

این پروژه یک قالب آماده و قابل توسعه برای فروشگاه اینترنتی است که تمرکز اصلی آن روی حوزه‌های:

لباس زنانه
لباس دخترانه
کفش
اکسسوری‌های مد و فشن

است.

هدف پروژه تولید یک قالب فروشگاهی با کیفیت بالا، طراحی اختصاصی و زیرساخت قابل توسعه است که برای پروژه‌هایی با بودجه متوسط مناسب باشد.

قالب باید در نسخه اول امکانات پایه و ضروری یک فروشگاه حرفه‌ای را داشته باشد، اما معماری آن به شکلی باشد که در آینده بتوان امکانات پیشرفته‌تر را بدون بازنویسی اساسی پروژه اضافه کرد.

2. Technology Stack

تکنولوژی‌های اصلی پروژه:

React
Next.js
Tailwind CSS

معماری پروژه باید:

Component Based باشد.
قابل توسعه باشد.
Mobile First باشد.
RTL First باشد.
با Design Tokenها کار کند.
وابستگی UI به Backend نداشته باشد.
برای اتصال به API مستقل در آینده آماده باشد.
3. Product Strategy

این پروژه در مرحله اول یک Template است، نه یک فروشگاه متصل به Backend واقعی.

بنابراین:

Frontend
   ↓
Mock Data

در آینده:

Frontend
   ↓
Domain / Data Layer
   ↓
Independent API

Backend فعلاً وجود ندارد.

4. Future Backend

Backend در آینده به صورت یک API مستقل توسعه داده خواهد شد.

بنابراین در طراحی معماری Frontend:

نباید:
Componentها مستقیماً به API وابسته باشند.
UI مستقیماً اطلاعات Backend را مدیریت کند.
Mock Data در Componentها نوشته شود.
منطق Business داخل Componentهای UI قرار بگیرد.
باید:
Domain Model مستقل باشد.
Mock Data ساختار واقعی Product را شبیه‌سازی کند.
Data Layer قابل جایگزینی باشد.
Componentها داده دریافت کنند، نه اینکه خودشان داده را تولید کنند.
5. Authentication

احراز هویت و Backend در نسخه اول پیاده‌سازی واقعی نمی‌شوند.

ساختار باید برای اتصال به Authentication در آینده آماده باشد.

6. Target Audience

مخاطب اصلی:

زنان
دختران
خریداران محصولات Fashion
کاربران ایرانی

UI باید برای کاربر ایرانی:

قابل فهم
ساده
سریع
جزئیات‌دار
قابل اعتماد
مدرن

باشد.

7. Visual Direction

جهت بصری پروژه:

Minimal
Clean
Luxury
Simple
Modern
Persian-friendly

هدف این نیست که UI بیش از حد شلوغ یا تزئینی باشد.

ظاهر باید:

ساده و تمیز باشد، ولی حس محصول ارزان یا ساده‌سازی بیش از حد نداشته باشد.

8. Theme

نسخه اول فقط:

Light Mode

دارد.

Dark Mode در Scope فعلی وجود ندارد.

9. Design Philosophy

اصل مهم طراحی:

تمام بخش‌های UI باید از یک Design System مشترک استفاده کنند.

Componentها نباید به شکل مستقل و بدون رعایت Tokenها طراحی شوند.

مثلاً به جای:

bg-[#1C68CC]

در Component:

bg-primary

استفاده شود.

به جای:

rounded-[8px]

از Token مربوط به Radius استفاده شود.

10. Color System
Primary Color

رنگ اصلی برند:

#1C68CC

این رنگ به عنوان رنگ اصلی پروژه استفاده می‌شود.

Primary Color Usage

رنگ اصلی برای موارد زیر استفاده می‌شود:

CTA اصلی
Active State
لینک‌های مهم
Navigation Active
Discount Badge
بخش‌های Promotional
Announcement Banner
عناصر تعاملی مهم
Primary Color Scale

طیف پیشنهادی اولیه:

Primary 50
Primary 100
Primary 200
Primary 300
Primary 400
Primary 500
Primary 600 → #1C68CC
Primary 700 → Hover
Primary 800 → Active
Primary 900
Primary 950

مقادیر دقیق طیف رنگی باید در مرحله نهایی Color Token با توجه به Design System نهایی بررسی شوند.

Agent نباید بدون تأیید طراح، این طیف را در Componentهای مختلف تغییر دهد.

11. Neutral Colors

رنگ‌های پایه:

White → #FFFFFF
Black → #000000

برای متن‌ها و سطوح مختلف Neutral نیز باید یک Scale مرکزی وجود داشته باشد.

کاربرد کلی:

Page Background → #FFFFFF

Primary Text → Black / Dark Neutral

Secondary Text → Gray Neutral

Icons → Black / Dark Neutral

Disabled → Gray Neutral

Surface → White / Light Neutral
12. Global Background

تمام صفحات اصلی فروشگاه در نسخه اول:

background: #FFFFFF

دارند.

13. Typography

فونت اصلی:

Peyda

Weightهای مورد استفاده:

Light
Regular
Medium
Bold
Black

معادل پیشنهادی:

Light   → 300
Regular → 400
Medium  → 500
Bold    → 700
Black   → 900
14. Typography Scale — Mobile

سایزهای اصلی Mobile:

10px
12px
14px
16px
24px

این Scale توسط طراح برای Mobile مناسب در نظر گرفته شده است.

15. Typography — Desktop

برای Desktop در صورت نیاز می‌توان سایزهای بزرگ‌تر اضافه کرد.

سایزهای پیشنهادی اولیه:

28px
32px
40px
48px

این سایزها باید فقط در مواردی مثل:

Hero
Page Heading
Campaign
Editorial Content

استفاده شوند.

نباید صرفاً تمام Typography موبایل را برای Desktop بزرگ کنیم.

16. Typography Semantic System

ساختار پیشنهادی:

Display
Heading
Body
Label
Caption
Price

مثلاً:

Display → 24px+
Heading → 16px / 24px
Body → 14px / 16px
Label → 12px / 14px
Caption → 10px / 12px
Price → 14px / 16px

مقادیر دقیق Line Height هنوز نهایی نشده‌اند.

17. Typography Weight Usage
Light
→ Editorial / Large Text

Regular
→ Body / Description

Medium
→ Labels / Navigation / Metadata

Bold
→ Heading / Price / Important Information

Black
→ Major Display Typography

Weight Black باید محدود و هدفمند استفاده شود.

18. Spacing System

Spacingهای فعلی:

0px
4px
8px
16px
24px
36px

Token پیشنهادی:

space-0 → 0px
space-1 → 4px
space-2 → 8px
space-3 → 16px
space-4 → 24px
space-5 → 36px
19. Spacing Rules

کاربرد پیشنهادی:

0px
Reset / No Spacing

4px
Micro spacing

8px
Compact spacing

16px
Standard spacing

24px
Component separation

36px
Section separation

Componentها نباید بدون دلیل از مقادیر Arbitrary مانند:

6px
12px
20px
28px
32px

استفاده کنند.

اگر نیاز واقعی وجود داشته باشد، ابتدا باید بررسی شود که آیا Token جدید لازم است یا خیر.

20. Border

برای Product Card:

border: 1px solid #EEEEEE;

این Border به صورت مشخص برای Product Card تعریف شده است.

21. Border Radius

Radiusهای پروژه:

0px
4px
8px
full

Token:

radius-none → 0px
radius-sm   → 4px
radius-md   → 8px
radius-full → 9999px
22. Radius Usage

پیشنهاد:

0px
Square UI

4px
Small UI elements

8px
Cards / Inputs / Standard Components

Full
Pills / Circular buttons / Rounded controls

در بخش Header و بعضی کنترل‌ها Radius برابر full است.

23. Grid System

طراحی Grid به صورت Responsive انجام می‌شود.

Reference اصلی Desktop:

1440px

است.

نباید:
1920px

به عنوان Reference اصلی طراحی استفاده شود.

24. Desktop Grid — Configuration A
Reference → 1440px

Columns → 12
Margin → 96px
Gutter → 24px

Content Width:

1440 - 96 - 96
= 1248px
25. Desktop Grid — Configuration B
Reference → 1440px

Columns → 12
Margin → 72px
Gutter → 24px

Content Width:

1440 - 72 - 72
= 1296px

این دو حالت فعلاً به عنوان Configurationهای Layout در نظر گرفته می‌شوند و الزاماً به معنای دو Breakpoint مستقل نیستند.

26. Tablet Grid
Columns → 6
Margin → 56px
Gutter → 24px

در Layoutهای متراکم:

Gutter → 16px
27. Mobile Large Grid

Reference:

428 × 1024

Grid:

Columns → 4
Margin → 16px
Gutter → 16px

در صورت تراکم بالای محتوا:

Gutter → 8px
28. Mobile Small Grid

Reference:

390 × 844

Grid:

Columns → 4
Margin → 16px
Gutter → 16px

در صورت تراکم بالا:

Gutter → 8px
29. Product Grid

Product Grid با Grid اصلی صفحه هماهنگ است.

Mobile
4 Columns
Product Card → span 2

نتیجه:

2 Products per Row
Tablet
6 Columns
Product Card → span 3

نتیجه:

2 Products per Row
Desktop
12 Columns
Product Card → span 3

نتیجه:

4 Products per Row

در بعضی Layoutهای Desktop می‌توان:

span 4

استفاده کرد.

30. Product Card

Product Card یکی از مهم‌ترین Componentهای پروژه است.

کارت باید از ابتدا به صورت Reusable و State-based ساخته شود.

31. Product Card Anatomy
ProductCard
│
├── Media
│   ├── Product Image
│   ├── Discount Badge
│   └── Optional Action
│
└── Content
    ├── Product Title
    ├── Original Price
    ├── Discount
    ├── Final Price
    └── Cart Action
32. Product Card States

حداقل Stateهای مورد نیاز:

Default
Discounted
Cart Active
Image Placeholder
Out of Stock
Loading
33. Product Card — Default

ساختار:

Image

Product Title

Original Price / Metadata

Discount

Final Price

Cart Button
34. Product Card — Discounted

در حالت Discount:

Original Price
Discount Badge
Final Price

نمایش داده می‌شود.

رنگ Discount در طراحی فعلی می‌تواند از Primary استفاده کند.

35. Product Card — Cart Active

Cart Action می‌تواند Stateهای مختلف داشته باشد:

idle
added
disabled

در طراحی نمونه، دکمه Cart در حالت Active می‌تواند به رنگ اصلی و پررنگ‌تر نمایش داده شود.

36. Product Card — Image Placeholder

اگر Image وجود نداشته باشد:

Image → Placeholder

نباید Layout شکسته شود.

37. Product Card — Out of Stock

برای محصول ناموجود:

Inventory → Out of Stock

و متن:

ناموجود

نمایش داده می‌شود.

Image می‌تواند Faded شود.

اما:

کل Card نباید opacity پایین بگیرد.

متن و اطلاعات محصول باید همچنان قابل خواندن باشند.

38. Product Card Media

Media بهتر است با Aspect Ratio ثابت کار کند.

پیشنهاد اولیه:

aspect-ratio: 1 / 1

به جای Height ثابت.

این مسئله برای Responsive بودن Product Grid بسیار مهم است.

39. Product Card Border
Border:
1px solid #EEEEEE
Background:
#FFFFFF
Radius:
8px
Shadow:
None

تا این مرحله Shadow برای Product Card تعریف نشده است.

40. Product Card Typography — Mobile

پیشنهاد اولیه بر اساس طراحی فعلی:

Product Title
14px / Regular یا Medium

Original Price
10px / Regular

Discount
12px / Medium

Final Price
14px / Bold

Out of Stock
14px / Medium

تعداد خطوط Title و Truncation هنوز نهایی نشده است.

41. Product Variants

محصول باید از ابتدا Variant داشته باشد.

مثلاً:

Product
├── Variant
│   ├── Color
│   ├── Size
│   ├── SKU
│   ├── Price
│   └── Inventory

مدل Variant نباید بعداً به Product اضافه شود.

42. Product Data

Mock Data باید ساختار واقعی و قابل توسعه داشته باشد.

ساختار مفهومی:

Product
├── id
├── title
├── brand
├── category
├── images
├── variants
├── pricing
├── discount
├── inventory
├── rating
└── metadata

جزئیات دقیق Domain Model بعداً تعریف خواهد شد.

43. Digikala Functional Reference

از نظر امکانات Product Card، هدف این است که Product Card از نظر سطح اطلاعات و قابلیت‌ها غنی باشد.

Reference عملکردی:

Digikala

اما:

طراحی بصری پروژه نباید Copy از Digikala باشد.

هدف:

Functional richness
+
Original visual design

است.

44. Header — Mobile

Header موبایل شامل:

Announcement Banner
+
Main Header
+
Bottom Navigation

است.

45. Announcement Banner

مشخصات:

Width → 100%
Height → 40px
Background → Primary
Text → White
Radius → None

متن Dynamic است.

مثلاً:

ارسال رایگان برای خریدهای بالای ...
46. Main Mobile Header

ارتفاع:

50px

ساختار:

Search
+
Cart
47. Mobile Search

Search باید فضای کمی مصرف کند.

Placeholder نمونه:

جستجوی محصول در نام برند

لوگو / Brand Mark داخل Search قرار می‌گیرد تا فضای جداگانه‌ای برای Logo در Header مصرف نشود.

ساختار مفهومی:

Search
├── Brand Mark
├── Input
└── Search Affordance

Search:

Height → 50px
Radius → Full

Background پیشنهادی:

Light Neutral

مقدار دقیق هنوز باید در Color System نهایی شود.

48. Mobile Cart Button

در کنار Search قرار می‌گیرد.

مشخصات:

Height → 50px
Radius → Full

رنگ پیشنهادی:

Primary

آیکون:

White

عرض دقیق و رفتار Badge هنوز نهایی نشده است.

49. Mobile Bottom Navigation

چهار Navigation Item:

خانه
محصولات
پسندیده‌ها
حساب کاربری

هر Item:

Icon
+
Label
50. Bottom Navigation — Default
Icon → Black
Text → Black
51. Bottom Navigation — Active
Icon → Primary
Text → Primary

Active فقط با رنگ مشخص می‌شود، ولی در مرحله Accessibility باید بررسی شود که تغییر رنگ به تنهایی برای انتقال State کافی نباشد.

52. Bottom Navigation Behavior

Bottom Navigation برای Mobile طراحی شده و باید به شکل Fixed در پایین Viewport قرار بگیرد.

Implementation باید Safe Area موبایل را نیز در نظر بگیرد.

53. Offer Section

Offer Section برای نمایش محصولات دارای تخفیف ویژه است.

ساختار:

OfferSection
│
├── Header
│   ├── Title
│   ├── Description
│   └── View All
│
└── Product Carousel
54. Offer Section Background
Background → Primary
55. Offer Section Header

Header شامل:

Title
Description
مشاهده همه

است.

رنگ:

Title → White
Description → White / Light Primary
Action → White
56. Offer Product Carousel

محصولات به صورت Horizontal Carousel نمایش داده می‌شوند.

Mobile باید از:

Touch Swipe
Horizontal Scroll

پشتیبانی کند.

همچنین دکمه‌های:

Previous
Next

وجود دارند.

57. Carousel Gap

فاصله کارت‌ها:

8px
58. Carousel RTL

Carousel باید RTL واقعی داشته باشد.

صرفاً:

direction: rtl;

کافی نیست.

موارد زیر باید RTL-aware باشند:

Next
Previous
Scroll Position
Swipe
Keyboard Navigation
Focus
59. Product Grid vs Carousel

این دو باید از نظر معماری جدا باشند.

Product Listing:

CSS Grid

Product Carousel:

Horizontal Flex / Carousel

نباید Carousel را با Grid اصلی صفحه پیاده‌سازی کرد.

60. Mobile First

تمام Design فعلی بر مبنای Mobile First تعریف شده است.

بنابراین:

Mobile
↓
Tablet
↓
Desktop
↓
Large Desktop

Responsive behavior باید به صورت Progressive تعریف شود.

61. مهم: Mobile Values نباید به Desktop تعمیم داده شوند

تمام اندازه‌هایی که تاکنون توسط طراح ارائه شده‌اند، در درجه اول برای Mobile هستند مگر اینکه صراحتاً خلاف آن گفته شده باشد.

بنابراین AI Agent نباید مثلاً:

Mobile Product Card Width

را مستقیماً برای Desktop استفاده کند.

Desktop باید بر اساس Grid و UX مخصوص Desktop طراحی شود.

62. Component Architecture

معماری پیشنهادی:

Design Tokens
        ↓
Foundations
        ↓
UI Components
        ↓
Commerce Components
        ↓
Sections
        ↓
Pages
        ↓
Layouts
        ↓
Data / Domain Layer
63. Foundation Components

نمونه:

Button
Icon
Typography
Badge
Input
Container
Grid
64. UI Components

نمونه:

SearchInput
CartButton
NavigationItem
Modal
Drawer
Dropdown
Tabs
Toast
Skeleton
65. Commerce Components

نمونه:

ProductCard
ProductGrid
ProductCarousel
PriceBlock
DiscountBadge
VariantSelector
WishlistButton
QuantitySelector
CartItem
OrderSummary
66. Sections

نمونه:

OfferSection
HeroSection
CategorySection
ProductSection
BannerSection
BrandSection
67. Pages

ساختار اولیه پیشنهادی:

Home
Category
Search
Product Detail
Wishlist
Cart
Checkout
Account

این لیست هنوز نهایی نشده و در مرحله معماری صفحات تکمیل خواهد شد.

68. Admin Panel

Admin Panel جزو Scope پروژه است.

نسخه اول باید شامل:

Products
Inventory
Categories
Discounts
Orders

باشد.

69. Admin Product Management

امکانات:

Add Product
Edit Product
Product Information
Product Variants
Inventory
70. Admin Category Management

امکانات:

Create Category
Edit Category
Delete/Archive Category
Organize Products

جزئیات Hierarchy دسته‌بندی بعداً تعریف می‌شود.

71. Admin Discount Management

امکانات:

Create Discount
Edit Discount
Manage Discount
Assign Discount

جزئیات Ruleهای تخفیف هنوز مشخص نشده است.

72. Admin Order Management

Order Management باید:

کامل و حرفه‌ای

باشد.

موارد دقیق زیر هنوز باید تعریف شوند:

Order Statuses
Order Filters
Order Search
Order Details
Customer Information
Payment Status
Shipping Status
Bulk Actions
Order Timeline
73. Data Architecture

Mock Data نباید داخل UI Component قرار گیرد.

ساختار پیشنهادی:

data/
├── products
├── categories
├── discounts
├── orders
└── users

یا ساختار معادل Domain-based.

74. Domain / UI Separation

مثلاً:

<ProductCard product={product} />

بهتر از:

<ProductCard
  title="..."
  price="..."
  image="..."
  discount="..."
/>

است؛ اگر Product Domain Model مشخص باشد.

75. Future API Compatibility

در آینده:

Mock Repository

می‌تواند با:

API Repository

جایگزین شود.

Componentها نباید متوجه شوند داده از Mock آمده یا API.

76. Loading States

Componentهای مهم باید از ابتدا قابلیت Loading داشته باشند.

خصوصاً:

ProductCard
ProductGrid
Product Detail
Search
Orders
Admin Tables
77. Empty States

برای مواردی مثل:

No Products
No Search Results
Empty Cart
Empty Wishlist
No Orders
No Categories

باید Empty State اختصاصی وجود داشته باشد.

78. Error States

برای بخش‌های تعاملی باید Error State در نظر گرفته شود.

مثلاً:

Product loading failed
Search failed
Order loading failed
79. Accessibility

موارد زیر باید رعایت شوند:

Semantic HTML
Accessible Labels
Keyboard Navigation
Focus State
Touch Target
ARIA where necessary
Image Alt
Color Contrast

رنگ نباید تنها روش انتقال State باشد.

80. RTL Requirements

RTL باید از سطح Root پروژه رعایت شود.

موارد مهم:

Layout
Typography
Spacing
Icons
Chevron Direction
Carousel
Navigation
Forms
Tables
Admin

همه باید RTL-aware باشند.

81. Icon Direction

برای Iconهایی که Direction دارند، مثل:

Arrow
Chevron
Back
Forward

نباید صرفاً از Icon ثابت استفاده شود.

Direction باید با RTL/UX مورد نظر هماهنگ شود.

82. Design Token Principle

Tokenها باید در یک محل مرکزی تعریف شوند.

دسته‌بندی:

Colors
Typography
Spacing
Radius
Borders
Shadows
Breakpoints
Container
Z-index
Motion
83. Tailwind Principle

Tailwind باید برای استفاده از Design Tokenها تنظیم شود.

مثلاً:

primary
primary-hover
primary-active

text-primary
text-secondary

surface
surface-muted

border-product

نام‌گذاری نهایی Tokenها در زمان پیاده‌سازی مشخص می‌شود.

84. Avoid Hard-Coded UI Values

در Componentها تا حد امکان از مواردی مانند:

bg-[#1C68CC]
mt-[17px]
rounded-[9px]

اجتناب شود.

به جای آن:

bg-primary
mt-4
rounded-md

استفاده شود.

85. Component State Philosophy

هر Component باید Stateهای خودش را داشته باشد.

مثلاً:

Button
├── Default
├── Hover
├── Active
├── Focus
├── Disabled
└── Loading

و:

ProductCard
├── Default
├── Discount
├── Added
├── Out of Stock
├── Placeholder
└── Loading
86. Responsive Philosophy

Componentها الزاماً نباید در تمام Deviceها DOM یکسان داشته باشند.

مثلاً Header:

Header
├── AnnouncementBar
├── MobileHeader
├── DesktopHeader
├── MobileBottomNavigation
└── DesktopNavigation

ولی Componentهای پایه می‌توانند Shared باشند:

SearchInput
CartButton
NavigationItem
87. Performance Principles

به دلیل استفاده از Next.js:

Server Components در جایی که نیاز به Client State نیست ترجیح داده شوند.
"use client" فقط زمانی استفاده شود که واقعاً لازم باشد.
Carousel و Interactive Components می‌توانند Client Component باشند.
Image optimization باید با قابلیت‌های Next.js انجام شود.
Mock Data نباید باعث Bundle غیرضروری شود.
88. Mobile Performance

Mobile اولویت اصلی است.

بنابراین:

تصاویر باید بهینه باشند.
Layout Shift کنترل شود.
Product Grid سبک باشد.
Carousel نباید باعث Performance مشکل‌دار شود.
JavaScript غیرضروری نباید وارد Client Bundle شود.
89. Naming Principle

نام Componentها باید بر اساس نقش واقعی آنها باشد.

مثلاً:

ProductCard
ProductCarousel
SearchInput
CartButton
AnnouncementBar
BottomNavigation

نه:

Box1
Section2
BlueCard
NewComponent
90. Component Variants

اگر تفاوت Component صرفاً State یا Variant باشد، Component جدید نسازیم.

مثلاً:

<Button variant="primary" />
<Button variant="secondary" />

بهتر از:

PrimaryButton
BlueButton
MainButton

است.

91. Current Project Scope
Confirmed
✓ React
✓ Next.js
✓ Tailwind
✓ Persian
✓ RTL
✓ Mobile First
✓ Light Mode
✓ Fashion E-commerce
✓ Women's / Girls' fashion
✓ Primary Blue
✓ #1C68CC
✓ White page background
✓ Black/dark text and selected icons
✓ Peyda
✓ Typography scale
✓ Spacing scale
✓ Radius scale
✓ Product Card border
✓ Responsive Grid
✓ Product Variants
✓ Mock Data
✓ Future Independent API
✓ Admin Panel
✓ Product Management
✓ Inventory
✓ Categories
✓ Discounts
✓ Professional Order Management
✓ Mobile Header
✓ Mobile Bottom Navigation
✓ Offer Section
✓ Product Carousel
92. Not Yet Finalized

موارد زیر هنوز نیاز به تصمیم طراحی دارند:

Desktop Header
Desktop Navigation
Desktop Search
Desktop Cart
Desktop Bottom/Header behavior

Desktop Product Card
Desktop Product Grid
Desktop Product Carousel

Tablet Header

Product Detail Page
Product Gallery
Variant Selector
Size Selector
Color Selector

Search Page
Filter
Sort
Pagination / Infinite Scroll

Cart
Checkout
Order Confirmation

Wishlist
Account

Admin Layout
Admin Dashboard
Admin Product CRUD
Admin Category CRUD
Admin Discount CRUD
Admin Order Workflow

Authentication UI

Exact Product Domain Model
Exact Variant Model

Semantic Color States
Success
Warning
Error
Info

Shadow System
Border System
Icon Library
Motion System
Breakpoints
Line Heights
Container implementation
93. AI Agent Working Rules

AI Agent باید این Context را به عنوان مرجع پروژه در نظر بگیرد.

Rule 1

قبل از ایجاد Component جدید بررسی کن آیا Component مشابه وجود دارد.

Rule 2

قبل از استفاده از مقدار جدید برای:

Color
Spacing
Radius
Typography

بررسی کن آیا Token موجود برای آن وجود دارد.

Rule 3

Mobile را مبنای فعلی قرار بده.

اما:

Mobile Design را بدون تصمیم صریح به Desktop تعمیم نده.

Rule 4

تمام UI باید RTL باشد.

Rule 5

تمام متن‌های User-facing فعلاً فارسی هستند مگر اینکه مشخصاً خلاف آن تعیین شود.

Rule 6

Mock Data باید از UI جدا باشد.

Rule 7

Domain Model باید برای API آینده مناسب باشد.

Rule 8

Product Variant باید از ابتدا در معماری Product لحاظ شود.

Rule 9

Product Card باید State-based باشد.

Rule 10

برای Stateهای مختلف، بدون دلیل Component جدا نساز.

Rule 11

از Copy کردن طراحی Digikala خودداری شود.

Digikala فقط Reference عملکردی برای سطح امکانات Product Card است.

Rule 12

در صورت ابهام، Agent نباید یک تصمیم مهم معماری را بی‌صدا اتخاذ کند.

باید:

Problem
+
Options
+
Recommendation

ارائه کند.

94. Design Decision Workflow

از این مرحله به بعد برای هر Component این اطلاعات باید مشخص شود:

1. Purpose
2. Anatomy
3. Content
4. Variants
5. States
6. Dimensions
7. Spacing
8. Typography
9. Colors
10. Responsive Behavior
11. Interaction
12. Accessibility
13. Data Contract
14. Loading State
15. Empty State
16. Error State
17. Desktop Behavior
18. Tablet Behavior
19. Mobile Behavior
95. Current Development Philosophy

هدف پروژه این نیست که از ابتدا بیشترین تعداد Feature را داشته باشد.

هدف:

High Quality
+
Clean Architecture
+
Reusable Components
+
Good UX
+
Medium Cost
+
Future Extensibility

است.

بنابراین باید از Overengineering جلوگیری شود.

اما مواردی که اضافه کردن آنها در آینده هزینه زیادی دارد، باید از ابتدا درست طراحی شوند.

مثلاً:

Product Variants
Domain Models
Design Tokens
Responsive Grid
Component Architecture
Data Layer
96. Next Design Phase

پس از تکمیل Foundation فعلی، مرحله بعدی باید تعریف دقیق Componentها باشد.

ترتیب پیشنهادی:

1. Color Tokens
2. Typography Tokens
3. Spacing
4. Radius
5. Grid
6. Icon System

7. Button
8. Input
9. Search
10. Badge
11. Product Card
12. Product Carousel
13. Product Grid

14. Header Mobile
15. Header Desktop
16. Bottom Navigation

17. Product Detail
18. Cart
19. Checkout

20. Category
21. Search
22. Wishlist
23. Account

24. Admin Design System
25. Admin Components
26. Admin Pages
97. Important Current Constraint

تا زمانی که مشخصات Desktop توسط طراح ارائه نشده:

تمام مشخصات عددی فعلی UI را Mobile-oriented در نظر بگیر.

Desktop باید با توجه به:

1440px Reference
12-column Grid
24px Gutter
72px / 96px Margin

و رفتار واقعی Component طراحی شود.

END OF PROJECT CONTEXT

Document Status: Living Document

این فایل باید در طول پروژه به‌روزرسانی شود و هر تصمیم نهایی Design System، Architecture یا Component به آن اضافه شود.