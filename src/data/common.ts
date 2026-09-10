import { ProductCategory, ProductBrand, Banner } from "@/types/product";

export const categories: ProductCategory[] = [
  { id: "category-dresses", name: "پیراهن زنانه", slug: "womens-dresses" },
  { id: "category-shoes", name: "کفش و صندل", slug: "shoes-sandals" },
  { id: "category-bags", name: "کیف و کوله", slug: "bags-backpacks" },
  { id: "category-accessories", name: "اکسسوری و شال", slug: "accessories" },
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
    linkUrl: "/category/womens-dresses",
    buttonText: "خرید مجموعه جدید",
  },
  {
    id: "banner-2",
    title: "جدیدترین مدل‌های کیف و کفش",
    subtitle: "طراحی‌های شیک و مدرن روز",
    imageUrl: "/images/banner-2.webp",
    linkUrl: "/category/shoes-sandals",
    buttonText: "مشاهده محصولات",
  },
];
