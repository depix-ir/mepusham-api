import { SizeGuideData, ProductRating, ProductReview, ProductSpecification } from "@/types/product";

export const FOOTWEAR_SIZE_GUIDE: SizeGuideData = {
  type: "footwear",
  title: "راهنمای سایز کفش و صندل",
  description: "برای انتخاب بهترین سایز، طول کفی پای خود را بر حسب سانتی‌متر اندازه‌گیری کنید.",
  columns: [
    { key: "eu", label: "سایز ایران / اروپا" },
    { key: "cm", label: "طول پا (سانتی‌متر)" },
    { key: "us", label: "سایز US" },
  ],
  rows: [
    { eu: "36", cm: "23.0", us: "5.5" },
    { eu: "37", cm: "23.5", us: "6.5" },
    { eu: "38", cm: "24.0", us: "7.5" },
    { eu: "39", cm: "24.5", us: "8.5" },
    { eu: "40", cm: "25.0", us: "9.0" },
    { eu: "41", cm: "25.5", us: "9.5" },
  ],
};

export const CLOTHING_SIZE_GUIDE: SizeGuideData = {
  type: "clothing",
  title: "راهنمای سایز پوشاک زنانه",
  description: "اندازه‌های جدول زیر به سانتی‌متر است. با دور دور سینه و کمر خود مقایسه کنید.",
  columns: [
    { key: "size", label: "سایز" },
    { key: "bust", label: "دور سینه (cm)" },
    { key: "waist", label: "دور کمر (cm)" },
    { key: "hip", label: "دور باسن (cm)" },
  ],
  rows: [
    { size: "S (36)", bust: "82 - 86", waist: "64 - 68", hip: "88 - 92" },
    { size: "M (38)", bust: "86 - 90", waist: "68 - 72", hip: "92 - 96" },
    { size: "L (40)", bust: "90 - 94", waist: "72 - 76", hip: "96 - 100" },
    { size: "XL (42)", bust: "94 - 98", waist: "76 - 80", hip: "100 - 104" },
  ],
};

export const DEFAULT_SHIPPING_RETURNS = `ارسال سریع با پست پیشتاز و پیک اختصاصی در سراسر کشور.
امکان تعویض و مرجوعی کلا تا ۷ روز کاری پس از تحویل در صورت عدم استفاده و حفظ اتیکت اولیه.
تمامی سفارش‌های بالای ۲ میلیون تومان شامل ارسال رایگان می‌باشند.`;

export function getDefaultRatingAndReviews(productTitle: string): { rating: ProductRating; reviews: ProductReview[] } {
  return {
    rating: {
      average: 4.7,
      count: 24,
      starDistribution: {
        5: 18,
        4: 4,
        3: 1,
        2: 1,
        1: 0,
      },
    },
    reviews: [
      {
        id: "rev-1",
        authorName: "مریم ابراهیمی",
        rating: 5,
        date: "۱۴۰۳/۱۱/۲۰",
        comment: `بسیار زیبا و باکیفیت است. کاملاً مطابق با عکس‌های ${productTitle} بود و بسته‌بندی عالی داشت.`,
        verifiedPurchase: true,
        aspects: {
          fit: "true_to_size",
          quality: 5,
          comfort: 5,
        },
        storeResponse: {
          author: "پشتیبانی فروشگاه",
          date: "۱۴۰۳/۱۱/۲۱",
          text: "سلام مریم عزیز، ممنون از ثبت دیدگاه ارزشمندتون. خوشحالیم که از خریدی که داشتید رضایت کامل دارید.",
        },
      },
      {
        id: "rev-2",
        authorName: "سارا رضایی",
        rating: 4,
        date: "۱۴۰۳/۱۱/۱۵",
        comment: "کیفیت ساخت و دوختش خیلی خوبه، ارسال هم سریع انجام شد. ممنون از دیزاین خوبتون.",
        verifiedPurchase: true,
        aspects: {
          fit: "true_to_size",
          quality: 4,
          comfort: 4,
        },
      },
      {
        id: "rev-3",
        authorName: "زهرا تهرانی",
        rating: 5,
        date: "۱۴۰۳/۱۱/۰۲",
        comment: "رنگ و جنسش دقیقاً مثل تصویره، خیلی شیکه و تنخور/ظاهر عالی داره.",
        verifiedPurchase: true,
        images: [
          "/images/placeholders/product-placeholder.webp",
        ],
      },
    ],
  };
}

export function getDefaultSpecifications(categorySlug: string): ProductSpecification[] {
  if (categorySlug === "bags") {
    return [
      { label: "جنس رویه", value: "چرم مصنوعی درجه یک مقاوم" },
      { label: "جنس آستر", value: "پارچه شمعی ضدآب" },
      { label: "نوع قفل", value: "زیپ و مگنت استیل" },
      { label: "تعداد محفظه", value: "۲ محفظه اصلی + ۱ جیب زیپ‌دار داخلی" },
      { label: "کشور مبدأ برند", value: "ایران" },
    ];
  }
  if (categorySlug === "shoes") {
    return [
      { label: "جنس رویه", value: "چرم مصنوعی نرم / جیر" },
      { label: "جنس زیره", value: "پی‌یو (PU) سبک و انعطاف‌پذیر" },
      { label: "ارتفاع پاشنه", value: "۵ سانتی‌متر" },
      { label: "نوع قالب", value: "استاندارد" },
      { label: "کشور تولیدکننده", value: "ایران" },
    ];
  }
  if (categorySlug === "accessories") {
    return [
      { label: "جنس بدنه", value: "استیل ضد زنگ رنگ ثابت" },
      { label: "نوع موتور", value: "کوارتز ژاپنی درجه یک" },
      { label: "مقاومت در برابر آب", value: "۳۰ متر (مقاوم در برابر شستشوی دست)" },
      { label: "نوع شیشه", value: "معدنی ضدخش" },
      { label: "گارانتی", value: "۱۲ ماه ضمانت موتور" },
    ];
  }
  return [
    { label: "جنس پارچه", value: "کتان / نخ پنبه ۱۰۰٪" },
    { label: "نوع الگوی برش", value: "کژوال مینیمال" },
    { label: "مناسب فصل", value: "چهار فصل" },
    { label: "کشور سازنده", value: "ایران" },
  ];
}

export function getDefaultCareInstructions(categorySlug: string): string[] {
  if (categorySlug === "shoes" || categorySlug === "bags") {
    return [
      "برای تمیز کردن از دستمال مرطوب و نرم استفاده کنید.",
      "از قرار دادن مستقیم در برابر نور شدید خورشید به مدت طولانی خودداری کنید.",
      "برای حفظ فرم اولیه از قالب یا واکس مخصوص استفاده نمایید.",
    ];
  }
  if (categorySlug === "accessories") {
    return [
      "از تماس مستقیم با عطر، ادکلن و مواد شیمیایی قوی جلوگیری شود.",
      "پس از استفاده با پارچه میکروفایبر نرم پاکسازی شود.",
      "از ضربه شدید به شیشه و بدنه جلوگیری کنید.",
    ];
  }
  return [
    "شستشو با آب حداکثر ۳۰ درجه سانتی‌گراد انجام شود.",
    "از سفیدکننده و مواد شوینده قوی استفاده نکنید.",
    "اتوکشی با دمای ملایم صورت گیرد.",
  ];
}
