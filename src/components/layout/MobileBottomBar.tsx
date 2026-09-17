"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  ProductsIcon,
  OrdersIcon,
  HeartIcon,
  UserIcon,
} from "@/components/icons";
import { useWishlist } from "@/store/wishlist/wishlist.store";
import { routes } from "@/lib/routes";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export const defaultBottomNavItems: NavItem[] = [
  { id: "home", label: "خانه", href: routes.home, icon: HomeIcon },
  { id: "products", label: "محصولات", href: routes.products.list, icon: ProductsIcon },
  { id: "orders", label: "سفارش‌ها", href: routes.account.orders.list, icon: OrdersIcon },
  { id: "wishlist", label: "پسندیده‌ها", href: routes.account.wishlist, icon: HeartIcon },
  { id: "account", label: "حساب کاربری", href: routes.account.root, icon: UserIcon },
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
  const { count: wishlistCount } = useWishlist();

  // Hide global bottom nav on Product Detail Pages (/products/[slug])
  // and Checkout/Payment pages so sticky action bars have full focus
  const isProductDetailPage =
    pathname?.startsWith("/products/") &&
    pathname.split("/").filter(Boolean).length >= 2;
  const isCheckoutOrPayment = pathname === "/checkout" || pathname === "/payment";

  if (isProductDetailPage || isCheckoutOrPayment) {
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
              className={`relative flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                isActive ? "text-primary font-bold" : "text-foreground hover:text-primary"
              }`}
            >
              <div className="relative">
                <IconComponent size={22} className="shrink-0" />
                {item.id === "wishlist" && wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground text-[12px] font-bold rounded-full h-4 w-4  px-1 flex items-center justify-center border border-background leading-none">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
