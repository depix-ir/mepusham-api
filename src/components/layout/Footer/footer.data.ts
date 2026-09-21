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
    { id: "order-tracking", label: "پیگیری سفارش", href: "/orders" },
    { id: "blog", label: "وبلاگ", href: "/blog" },
    { id: "contact", label: "تماس با ما", href: "/contact" },
  ],
};

export const legalLinks: FooterLinkGroup = {
  id: "legal",
  title: "پشتیبانی و قوانین",
  links: [
    { id: "support", label: "پشتیبانی", href: "/support" },
    { id: "guides", label: "راهنمای خرید", href: "/support?tab=guides" },
    { id: "faqs", label: "سوالات متداول", href: "/support?tab=faqs" },
    { id: "terms", label: "قوانین", href: "/terms" },
    { id: "returns", label: "بازگشت وجه مرجوعی", href: "/returns" },
    { id: "privacy", label: "حریم خصوصی", href: "/privacy" },
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
  name: "مپوشــــم",
  description: "یک فروشگاه آنلاین برای انتخاب ساده‌تر و مطمئن‌تر پوشاک و اکسسوری زنانه.",
  copyright: "© ۱۴۰۵ مپوشــــم، تمامی حقوق محفوظ است.",
};
