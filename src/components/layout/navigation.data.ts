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
  { id: "sale", label: "تخفیف دارها", href: "/sale" },
  { id: "blog", label: "وبلاگ", href: "/blog" },
  { id: "contact", label: "تماس با ما", href: "/contact" },
  { id: "terms", label: "قوانین و مقررات", href: "/terms" },
];

export const productMegaMenuCategories: MegaMenuCategory[] = [
  {
    id: "womens-clothing",
    title: "لباس زنانه",
    href: "/category/womens-dresses",
    items: [
      { title: "مانتو و پالتو", href: "/category/coats-jackets" },
      { title: "شومیز و بلوز", href: "/category/shirts-blouses" },
      { title: "پیراهن و سارافون", href: "/category/womens-dresses" },
      { title: "شلوار و دامن", href: "/category/pants-skirts" },
      { title: "لباس مجلسی", href: "/category/formal-dresses" },
      { title: "هودی و دورس", href: "/category/hoodies-sweatshirts" },
    ],
  },
  {
    id: "girls-clothing",
    title: "لباس دخترانه",
    href: "/category/girls-clothing",
    items: [
      { title: "تیشرت و تاپ", href: "/category/tshirts-tops" },
      { title: "ست دخترانه", href: "/category/girls-sets" },
      { title: "پیراهن دخترانه", href: "/category/girls-dresses" },
      { title: "شلوار و شلوارک", href: "/category/girls-pants" },
    ],
  },
  {
    id: "shoes-sandals",
    title: "کفش و صندل",
    href: "/category/shoes-sandals",
    items: [
      { title: "کفش زنانه", href: "/category/womens-shoes" },
      { title: "کتانی و اسپرت", href: "/category/sneakers" },
      { title: "صندل و دمپایی", href: "/category/sandals" },
      { title: "کفش مجلسی", href: "/category/heels-formal" },
      { title: "نیم بوت و چکمه", href: "/category/boots" },
    ],
  },
  {
    id: "bags-backpacks",
    title: "کیف و کوله",
    href: "/category/bags-backpacks",
    items: [
      { title: "کیف دستی", href: "/category/handbags" },
      { title: "کیف دوشی", href: "/category/shoulder-bags" },
      { title: "کوله پشتی", href: "/category/backpacks" },
      { title: "کیف پول و جاکارتی", href: "/category/wallets" },
    ],
  },
  {
    id: "accessories",
    title: "اکسسوری و شال",
    href: "/category/accessories",
    items: [
      { title: "شال و روسری", href: "/category/scarves" },
      { title: "زیورآلات و بدلیجات", href: "/category/jewelry" },
      { title: "عینک آفتابی", href: "/category/sunglasses" },
      { title: "کمربند و کلاه", href: "/category/belts-hats" },
    ],
  },
];
