"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  ProductsIcon,
  HeartIcon,
  UserIcon,
} from "@/components/icons";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export const defaultBottomNavItems: NavItem[] = [
  { id: "home", label: "خانه", href: "/", icon: HomeIcon },
  { id: "products", label: "محصولات", href: "/products", icon: ProductsIcon },
  { id: "wishlist", label: "پسندیده‌ها", href: "/wishlist", icon: HeartIcon },
  { id: "account", label: "حساب کاربری", href: "/account", icon: UserIcon },
];

export interface MobileBottomBarProps {
  items?: NavItem[];
  activeItemId?: string;
}

export function MobileBottomBar({
  items = defaultBottomNavItems,
  activeItemId,
}: MobileBottomBarProps) {
  const pathname = usePathname();

  // Hide global bottom nav on Product Detail Pages (/products/[slug])
  // so the Sticky Add To Cart Bar has full focus
  const isProductDetailPage =
    pathname?.startsWith("/products/") &&
    pathname.split("/").filter(Boolean).length >= 2;

  if (isProductDetailPage) {
    return null;
  }

  return (
    <nav
      aria-label="ناوبری اصلی موبایل"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeItemId
            ? activeItemId === item.id
            : pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                isActive ? "text-primary" : "text-foreground hover:text-primary"
              }`}
            >
              <IconComponent size={22} className="shrink-0" />
              <span className="text-[10px] font-medium leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
