"use client";

import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SearchInput } from "@/components/ui/SearchInput";
import { HeartIcon } from "@/components/icons";
import { CartButton } from "./CartButton";
import { AccountDropdown } from "./AccountDropdown";
import { useWishlist } from "@/store/wishlist/wishlist.store";
import { routes } from "@/lib/routes";

interface MainHeaderProps {
  cartItemCount?: number;
}

export function MainHeader({ cartItemCount = 0 }: MainHeaderProps) {
  const { count: wishlistCount } = useWishlist();

  return (
    <div className="w-full bg-background border-b border-border py-2 md:py-4 relative z-40 shadow-xs">
      <Container className="flex items-center justify-between gap-3 md:gap-6">
        {/* Desktop Brand Logo */}
        <Link
          href={routes.home}
          className="hidden md:flex items-center gap-2 text-2xl font-black text-primary tracking-tight shrink-0 hover:opacity-90 transition-opacity"
        >
          <span>مپوشام</span>
        </Link>

        {/* Search Bar - Responsive */}
        <div className="flex-1 max-w-full md:max-w-2xl">
          <SearchInput
            brandMark={
              <Link
                href={routes.home}
                onClick={(e) => e.stopPropagation()}
                className="text-primary font-black text-sm hover:opacity-80 transition-opacity cursor-pointer"
              >
                مپوشام
              </Link>
            }
          />
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Wishlist Button (Desktop) */}
          <Link
            href={routes.account.wishlist}
            className="hidden md:inline-flex relative items-center justify-center rounded-full w-10 h-10 text-sm text-foreground hover:bg-surface-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 shrink-0"
            aria-label={wishlistCount > 0 ? `پسندیده‌ها (${wishlistCount})` : "پسندیده‌ها"}
          >
            <HeartIcon size={22} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 min-w-[16px] px-1 flex items-center justify-center border-2 border-background leading-none">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Account Dropdown Button (Mobile & Desktop) */}
          <AccountDropdown />

          {/* Cart Button (Handles Mobile & Desktop) */}
          <CartButton cartItemCount={cartItemCount} />
        </div>
      </Container>
    </div>
  );
}
