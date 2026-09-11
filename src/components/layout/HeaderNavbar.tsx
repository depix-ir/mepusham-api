"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";

export interface HeaderNavItem {
  id: string;
  label: string;
  href: string;
}

export const headerNavItems: HeaderNavItem[] = [
  { id: "home", label: "صفحه اصلی", href: "/" },
  { id: "products", label: "محصولات", href: "/products" },
  { id: "dresses", label: "پیراهن زنانه", href: "/category/womens-dresses" },
  { id: "shoes", label: "کفش و صندل", href: "/category/shoes-sandals" },
  { id: "bags", label: "کیف و کوله", href: "/category/bags-backpacks" },
  { id: "accessories", label: "اکسسوری و شال", href: "/category/accessories" },
];

export function HeaderNavbar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="منوی اصلی دسکتاپ"
      className="hidden md:block w-full border-b border-border bg-background"
    >
      <Container>
        <ul className="flex items-center gap-8 h-12 text-sm font-medium">
          {headerNavItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname?.startsWith(item.href);

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`relative py-3 transition-colors hover:text-primary ${
                    isActive
                      ? "text-primary font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full"
                      : "text-foreground/80"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </nav>
  );
}
