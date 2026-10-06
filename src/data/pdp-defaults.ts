import { SizeGuideData, ProductRating, ProductReview, ProductSpecification } from "@/types/product";

export const FOOTWEAR_SIZE_GUIDE: SizeGuideData = {
  type: "footwear",
  title: "راهنمای سایز کفش و کتانی",
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
    { eu: "41", cm: "26.0", us: "9.5" },
    { eu: "42", cm: "27.0", us: "10.0" },
    { eu: "43", cm: "28.0", us: "11.0" },
    { eu: "44", cm: "29.0", us: "12.0" },
  ],
};

export const MENS_CLOTHING_SIZE_GUIDE: SizeGuideData = {
  type: "clothing",
  title: "راهنمای سایز پوشاک مردانه",
  description: "اندازه‌های جدول زیر به سانتی‌متر است. با دور سینه، کمر و قد خود مقایسه کنید.",
  columns: [
    { key: "size", label: "سایز" },
    { key: "bust", label: "دور سینه (cm)" },
    { key: "waist", label: "دور کمر (cm)" },
    { key: "shoulder", label: "عرض شانه (cm)" },
  ],
  rows: [
    { size: "S", bust: "92 - 96", waist: "76 - 80", shoulder: "43 - 45" },
    { size: "M", bust: "96 - 102", waist: "80 - 86", shoulder: "45 - 47" },
    { size: "L", bust: "102 - 108", waist: "86 - 92", shoulder: "47 - 49" },
    { size: "XL", bust: "108 - 114", waist: "92 - 98", shoulder: "49 - 51" },
    { size: "XXL", bust: "114 - 120", waist: "98 - 104", shoulder: "51 - 53" },
  ],
};

export const CLOTHING_SIZE_GUIDE: SizeGuideData = {
  type: "clothing",
  title: "راهنمای سایز پوشاک زنانه",
  description: "اندازه‌های جدول زیر به سانتی‌متر است. با دور سینه و کمر خود مقایسه کنید.",
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
امکان تعویض و مرجوعی کالا تا ۷ روز کاری پس از تحویل در صورت عدم استفاده و حفظ اتیکت اولیه.
تمامی سفارش‌های بالای ۲ میلیون تومان شامل ارسال رایگان می‌باشند.`;

export function getDefaultRatingAndReviews(productTitle: string): { rating: ProductRating; reviews: ProductReview[] } {
  return {
    rating: {
      average: 4.8,
      count: 28,
      starDistribution: {
        5: 22,
        4: 5,
        3: 1,
        2: 0,
        1: 0,
      },
    },
    reviews: [
      {
        id: "rev-1",
        authorName: "رضا محمدی",
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
          text: "سلام رضا عزیز، ممنون از ثبت دیدگاه ارزشمندتون. خوشحالیم که از خریدی که داشتید رضایت کامل دارید.",
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
        authorName: "امیر حسینی",
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
  if (categorySlug.includes("bag")) {
    return [
      { label: "جنس رویه", value: "چرم مصنوعی درجه یک مقاوم" },
      { label: "جنس آستر", value: "پارچه شمعی ضدآب" },
      { label: "نوع قفل", value: "زیپ و مگنت استیل" },
      { label: "تعداد محفظه", value: "۲ محفظه اصلی + ۱ جیب زیپ‌دار داخلی" },
      { label: "کشور مبدأ برند", value: "اروپایی / وارداتی" },
    ];
  }
  if (categorySlug.includes("shoe")) {
    return [
      { label: "جنس رویه", value: "چرم / جیر / الیاف تنفس‌پذیر" },
      { label: "جنس زیره", value: "پی‌یو (PU) آنتی‌شوک و سبک" },
      { label: "نوع قالب", value: "استاندارد" },
      { label: "کاربری", value: "روزمره، کژوال و ورزش" },
      { label: "کشور تولیدکننده", value: "اورجینال وارداتی" },
    ];
  }
  return [
    { label: "جنس پارچه", value: "کتان / نخ پنبه ۱۰۰٪ مرغوب" },
    { label: "نوع الگوی برش", value: "کژوال مدرن" },
    { label: "مناسب فصل", value: "چهار فصل" },
    { label: "ضمانت ثبات رنگ", value: "دارد (تضمین کیفیت)" },
  ];
}

export function getDefaultCareInstructions(categorySlug: string): string[] {
  if (categorySlug.includes("shoe") || categorySlug.includes("bag")) {
    return [
      "برای تمیز کردن از دستمال مرطوب و نرم استفاده کنید.",
      "از قرار دادن مستقیم در برابر نور شدید خورشید به مدت طولانی خودداری کنید.",
      "برای حفظ فرم اولیه از قالب یا واکس مخصوص استفاده نمایید.",
    ];
  }
  return [
    "شستشو با آب حداکثر ۳۰ درجه سانتی‌گراد انجام شود.",
    "از سفیدکننده و مواد شوینده قوی استفاده نکنید.",
    "اتوکشی با دمای ملایم صورت گیرد.",
  ];
}
