export interface FooterLink {
  id: string;
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface TrustBadge {
  id: string;
  title: string;
  image?: string;
  href?: string;
  type: "placeholder" | "image" | "external";
  ariaLabel?: string;
}

export interface FooterLinkGroup {
  id: string;
  title: string;
  links: FooterLink[];
}

export const quickLinks: FooterLinkGroup = {
  id: "quick-access",
  title: "دسترسی سریع",
  links: [
    { id: "products", label: "محصولات", href: "/products" },
    { id: "discounts", label: "تخفیف‌ها", href: "/products?discount=true" },
    { id: "blog", label: "وبلاگ", href: "/blog" },
    { id: "contact", label: "تماس با ما", href: "/contact" },
  ],
};

export const legalLinks: FooterLinkGroup = {
  id: "legal",
  title: "قوانین و حریم خصوصی",
  links: [
    { id: "privacy", label: "حریم خصوصی", href: "/privacy" },
    { id: "terms", label: "قوانین و مقررات", href: "/terms" },
    { id: "returns", label: "شرایط بازگشت کالا", href: "/returns" },
  ],
};

export const trustBadges: TrustBadge[] = [
  {
    id: "enamad-placeholder",
    title: "مجوزها و نماد اعتماد",
    type: "placeholder",
    ariaLabel: "جایگاه نماد اعتماد الکترونیکی (اینماد)",
  },
];

export const brandInfo = {
  name: "مپوشام",
  description: "یک فروشگاه آنلاین برای انتخاب ساده‌تر و مطمئن‌تر پوشاک و اکسسوری زنانه.",
  copyright: "© ۱۴۰۵ مپوشام، تمامی حقوق محفوظ است.",
};
