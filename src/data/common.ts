import { ProductCategory, ProductBrand, Banner } from "@/types/product";

export const categories: ProductCategory[] = [
  {
    id: "category-dresses",
    name: "پیراهن زنانه",
    slug: "womens-dresses",
    imageUrl: "/images/category-1.webp",
  },
  {
    id: "category-shoes",
    name: "کفش و صندل",
    slug: "shoes-sandals",
    imageUrl: "/images/category-2.webp",
  },
  {
    id: "category-bags",
    name: "کیف و کوله",
    slug: "bags-backpacks",
    imageUrl: "/images/category-3.webp",
  },
  {
    id: "category-accessories",
    name: "اکسسوری و شال",
    slug: "accessories",
    imageUrl: "/images/category-4.webp",
  },
  {
    id: "category-coats",
    name: "مانتو و پالتو",
    slug: "coats-jackets",
    imageUrl: "/images/tag-1.webp",
  },
  {
    id: "category-pants",
    name: "شلوار و دامن",
    slug: "pants-skirts",
    imageUrl: "/images/tag-2.webp",
  },
];

export const brands: ProductBrand[] = [
  { id: "brand-zar", name: "زارا", slug: "zara" },
  { id: "brand-mango", name: "مانگو", slug: "mango" },
  { id: "brand-bershka", name: "برشکا", slug: "bershka" },
  { id: "brand-stradivarius", name: "استرادیواریوس", slug: "stradivarius" },
];

export const banners: Banner[] = [
  {
    id: "banner-1",
    title: "مجموعه جدید بهاره و تابستانه",
    subtitle: "تخفیف‌های ویژه تا ۵۰ درصد روی منتخب لباس‌ها",
    imageUrl: "/images/banner-1.webp",
    desktopImageUrl: "/images/banner-1.webp",
    mobileImageUrl: "/images/banner-2.webp",
    linkUrl: "/category/womens-dresses",
    buttonText: "خرید مجموعه جدید",
  },
  {
    id: "banner-2",
    title: "جدیدترین مدل‌های کیف و کفش",
    subtitle: "طراحی‌های شیک و مدرن روز",
    imageUrl: "/images/banner-2.webp",
    desktopImageUrl: "/images/banner-2.webp",
    mobileImageUrl: "/images/banner-1.webp",
    linkUrl: "/category/shoes-sandals",
    buttonText: "مشاهده محصولات",
  },
  {
    id: "banner-3",
    title: "استایل‌های خاص و اکسسوری",
    subtitle: "جدیدترین کالکشن شال، کیف و زیورآلات",
    imageUrl: "/images/banner-3.webp",
    desktopImageUrl: "/images/banner-3.webp",
    mobileImageUrl: "/images/banner-3.webp",
    linkUrl: "/category/accessories",
    buttonText: "مشاهده کالکشن",
  },
];

export const secondaryBanners: Banner[] = [
  {
    id: "sec-banner-1",
    title: "جدیدترین مدل‌های کیف و کوله",
    subtitle: "کیفیت عالی، قیمت مناسب و استایل متفاوت",
    imageUrl: "/images/banner-2.webp",
    desktopImageUrl: "/images/banner-2.webp",
    mobileImageUrl: "/images/banner-1.webp",
    linkUrl: "/category/bags-backpacks",
    buttonText: "مشاهده کیف‌ها",
  },
  {
    id: "sec-banner-2",
    title: "مجموعه خاص اکسسوری و شال",
    subtitle: "مکمل زیبایی و استایل شما برای تمامی فصول",
    imageUrl: "/images/category-4.webp",
    desktopImageUrl: "/images/category-4.webp",
    mobileImageUrl: "/images/category-1.webp",
    linkUrl: "/category/accessories",
    buttonText: "دیدن اکسسوری‌ها",
  },
];
