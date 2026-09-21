import { ProductCategory, ProductBrand, Banner } from "@/types/product";

export const categories: ProductCategory[] = [
  {
    id: "category-shirts-blouses",
    name: "شومیز و بلوز زنانه",
    slug: "womens-shirts-blouses",
    imageUrl: "/images/category-one.webp",
  },
  {
    id: "category-t-shirts",
    name: "تیشرت و تاپ زنانه",
    slug: "womens-t-shirts",
    imageUrl: "/images/category-two.webp",
  },
  {
    id: "category-sweatshirts-hoodies",
    name: "هودی و دورس زنانه",
    slug: "womens-sweatshirts-hoodies",
    imageUrl: "/images/category-three.webp",
  },
  {
    id: "category-shoes",
    name: "کفش زنانه",
    slug: "woman-shoes",
    imageUrl: "/images/category-four.webp",
  },
  {
    id: "category-bags",
    name: "کیف و کوله پشتی",
    slug: "bags-backpacks",
    imageUrl: "/images/bag-1.webp",
  },
];

export const brands: ProductBrand[] = [
  { id: "brand-zara", name: "زارا (Zara)", slug: "zara" },
  { id: "brand-mango", name: "مانگو (Mango)", slug: "mango" },
  { id: "brand-bershka", name: "برشکا (Bershka)", slug: "bershka" },
  { id: "brand-stradivarius", name: "استرادیواریوس (Stradivarius)", slug: "stradivarius" },
];

export const banners: Banner[] = [
  {
    id: "banner-1",
    title: "مجموعه جدید شومیز و بلوزهای زنانه",
    subtitle: "شیک‌ترین و به‌روزترین مدل‌های شومیز و بلوز با تخفیف ویژه",
    imageUrl: "/images/banner-one.webp",
    desktopImageUrl: "/images/banner-one.webp",
    mobileImageUrl: "/images/banner-two.webp",
    linkUrl: "/products?category=womens-shirts-blouses",
    buttonText: "خرید شومیز و بلوز",
  },
  {
    id: "banner-2",
    title: "جدیدترین مدل‌های کفش و صندل زنانه",
    subtitle: "طراحی‌های مدرن و راحت برای استایل‌های روزمره و مجلسی",
    imageUrl: "/images/banner-two.webp",
    desktopImageUrl: "/images/banner-two.webp",
    mobileImageUrl: "/images/banner-one.webp",
    linkUrl: "/products?category=woman-shoes",
    buttonText: "مشاهده کفش‌ها",
  },
  {
    id: "banner-3",
    title: "کالکشن جدید هودی و تیشرت‌های زنانه",
    subtitle: "استایل‌های کژوال و شیک ویژه تمامی فصول",
    imageUrl: "/images/banner-three.webp",
    desktopImageUrl: "/images/banner-three.webp",
    mobileImageUrl: "/images/banner-three.webp",
    linkUrl: "/products?category=womens-t-shirts",
    buttonText: "مشاهده کالکشن",
  },
];

export const secondaryBanners: Banner[] = [
  {
    id: "sec-banner-1",
    title: "جدیدترین مدل‌های کیف و کوله‌پشتی",
    subtitle: "کیفیت عالی، چرم مرغوب و طراحی کاملاً کاربردی",
    imageUrl: "/images/banner-two.webp",
    desktopImageUrl: "/images/banner-two.webp",
    mobileImageUrl: "/images/banner-one.webp",
    linkUrl: "/products?category=bags-backpacks",
    buttonText: "مشاهده کیف‌ها",
  },
  {
    id: "sec-banner-2",
    title: "هودی و دورس‌های پاییزه و زمستانه",
    subtitle: "پارچه‌های بسیار نرم، گرم و باکیفیت",
    imageUrl: "/images/category-three.webp",
    desktopImageUrl: "/images/category-three.webp",
    mobileImageUrl: "/images/category-one.webp",
    linkUrl: "/products?category=womens-sweatshirts-hoodies",
    buttonText: "دیدن هودی‌ها",
  },
];
