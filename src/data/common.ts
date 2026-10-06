import { ProductCategory, ProductBrand, Banner } from "@/types/product";

export const categories: ProductCategory[] = [
  {
    id: "category-mens-clothing",
    name: "لباس مردانه",
    slug: "mens-clothing",
    imageUrl: "/images/g-star-premium-core-hooded-sweater-grey.webp",
  },
  {
    id: "category-womens-clothing",
    name: "لباس زنانه",
    slug: "womens-clothing",
    imageUrl: "/images/womens-t-shirts-1.webp",
  },
  {
    id: "category-mens-shoes",
    name: "کفش مردانه",
    slug: "mens-shoes",
    imageUrl: "/images/Superstar_II_Schoenen_Zwart_JI0079_00_plp_standard.webp",
  },
  {
    id: "category-womens-shoes",
    name: "کفش زنانه",
    slug: "womens-shoes",
    imageUrl: "/images/Samba_LT_Schoenen_Wit_JS3931_00_plp_standard.webp",
  },
  {
    id: "category-bags",
    name: "کیف و کوله پشتی",
    slug: "bags-backpacks",
    imageUrl: "/images/bag-1.webp",
  },
];

export const brands: ProductBrand[] = [
  { id: "brand-gstar", name: "جی استار رو (G-Star Raw)", slug: "g-star-raw" },
  { id: "brand-adidas", name: "آدیداس (Adidas)", slug: "adidas" },
  { id: "brand-zara", name: "زارا (Zara)", slug: "zara" },
  { id: "brand-mango", name: "مانگو (Mango)", slug: "mango" },
  { id: "brand-bershka", name: "برشکا (Bershka)", slug: "bershka" },
  { id: "brand-stradivarius", name: "استرادیواریوس (Stradivarius)", slug: "stradivarius" },
];

export const banners: Banner[] = [
  {
    id: "banner-1",
    title: "کالکشن پوشاک و استایل مردانه جی استار رو",
    subtitle: "مجموعه جدید هودی، دورس، تیشرت و شلوارهای اورجینال جی استار",
    imageUrl: "/images/banner-one.webp",
    desktopImageUrl: "/images/banner-one.webp",
    mobileImageUrl: "/images/banner-two.webp",
    linkUrl: "/products?category=mens-clothing",
    buttonText: "مشاهده لباس‌های مردانه",
  },
  {
    id: "banner-2",
    title: "جدیدترین مدل‌های کفش و کتانی آدیداس",
    subtitle: "مدل‌های پرطرفدار Samba، Campus، Superstar و Ozweego مردانه و زنانه",
    imageUrl: "/images/banner-two.webp",
    desktopImageUrl: "/images/banner-two.webp",
    mobileImageUrl: "/images/banner-one.webp",
    linkUrl: "/products?category=mens-shoes",
    buttonText: "مشاهده کفش‌ها",
  },
  {
    id: "banner-3",
    title: "کالکشن جدید لباس زنانه و کیف‌های مدرن",
    subtitle: "طراحی‌های شیک و جذاب ویژه استایل کژوال و مهمانی",
    imageUrl: "/images/banner-three.webp",
    desktopImageUrl: "/images/banner-three.webp",
    mobileImageUrl: "/images/banner-three.webp",
    linkUrl: "/products?category=womens-clothing",
    buttonText: "مشاهده لباس‌های زنانه",
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
    title: "کتانی و کفش‌های اسپرت زنانه آدیداس",
    subtitle: "طراحی مدرن، راحت و تنفس‌پذیر برای روزمره",
    imageUrl: "/images/banner-three.webp",
    desktopImageUrl: "/images/banner-three.webp",
    mobileImageUrl: "/images/banner-one.webp",
    linkUrl: "/products?category=womens-shoes",
    buttonText: "دیدن کفش‌های زنانه",
  },
];
