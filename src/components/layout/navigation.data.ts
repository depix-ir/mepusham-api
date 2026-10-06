export interface PrimaryNavItem {
  id: string;
  label: string;
  href: string;
  hasMegaMenu?: boolean;
}

export interface MegaMenuSubitem {
  title: string;
  href: string;
}

export interface MegaMenuCategory {
  id: string;
  title: string;
  href: string;
  items: MegaMenuSubitem[];
}

export const primaryNavItems: PrimaryNavItem[] = [
  { id: "home", label: "خانه", href: "/" },
  { id: "products", label: "محصولات", href: "/products", hasMegaMenu: true },
  { id: "sale", label: "تخفیف دارها", href: "/products?has_discount=true" },
  { id: "blog", label: "وبلاگ", href: "/blog" },
  { id: "contact", label: "تماس با ما", href: "/contact" },
  { id: "terms", label: "قوانین و مقررات", href: "/terms" },
];

export const productMegaMenuCategories: MegaMenuCategory[] = [
  {
    id: "mens-clothing",
    title: "لباس مردانه",
    href: "/products?category=mens-clothing",
    items: [
      { title: "تیشرت و پولوشرت", href: "/products?category=mens-clothing&q=تیشرت" },
      { title: "هودی و سویشرت", href: "/products?category=mens-clothing&q=هودی" },
      { title: "شلوار کتان و جین", href: "/products?category=mens-clothing&q=شلوار" },
      { title: "همه پوشاک مردانه", href: "/products?category=mens-clothing" },
    ],
  },
  {
    id: "womens-clothing",
    title: "لباس زنانه",
    href: "/products?category=womens-clothing",
    items: [
      { title: "تیشرت و تاپ", href: "/products?category=womens-clothing&q=تیشرت" },
      { title: "شومیز و بلوز", href: "/products?category=womens-clothing&q=شومیز" },
      { title: "پیراهن و مجلسی", href: "/products?category=womens-clothing&q=مجلسی" },
      { title: "همه پوشاک زنانه", href: "/products?category=womens-clothing" },
    ],
  },
  {
    id: "mens-shoes",
    title: "کفش مردانه",
    href: "/products?category=mens-shoes",
    items: [
      { title: "کتانی و اسپرت آدیداس", href: "/products?category=mens-shoes&q=کتانی" },
      { title: "کفش کوهنوردی و بوت", href: "/products?category=mens-shoes&q=کوهنوردی" },
      { title: "کفش چرم و کژوال", href: "/products?category=mens-shoes&q=چرمی" },
      { title: "همه کفش‌های مردانه", href: "/products?category=mens-shoes" },
    ],
  },
  {
    id: "womens-shoes",
    title: "کفش زنانه",
    href: "/products?category=womens-shoes",
    items: [
      { title: "کتانی و اسپرت آدیداس", href: "/products?category=womens-shoes&q=کتانی" },
      { title: "کفش‌های سامبا و کمپس", href: "/products?category=womens-shoes&q=سامبا" },
      { title: "کفش چرم و راحتی", href: "/products?category=womens-shoes&q=چرمی" },
      { title: "همه کفش‌های زنانه", href: "/products?category=womens-shoes" },
    ],
  },
  {
    id: "bags-backpacks",
    title: "کیف و کوله پشتی",
    href: "/products?category=bags-backpacks",
    items: [
      { title: "کیف دستی زنانه", href: "/products?category=bags-backpacks" },
      { title: "کیف دوشی", href: "/products?category=bags-backpacks" },
      { title: "کوله پشتی", href: "/products?category=bags-backpacks" },
      { title: "همه کیف‌ها", href: "/products?category=bags-backpacks" },
    ],
  },
];
