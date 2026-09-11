"use client";

import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SearchInput } from "@/components/ui/SearchInput";
import { IconButton } from "@/components/ui/IconButton";
import { CartIcon, HeartIcon, UserIcon } from "@/components/icons";

interface MainHeaderProps {
  cartItemCount?: number;
}

export function MainHeader({ cartItemCount = 0 }: MainHeaderProps) {
  return (
    <div className="w-full bg-background border-b border-border py-2 md:py-4">
      <Container className="flex items-center justify-between gap-3 md:gap-6">
        {/* Desktop Brand Logo */}
        <Link
          href="/"
          className="hidden md:flex items-center gap-2 text-2xl font-black text-primary tracking-tight shrink-0"
        >
          <span>مپوشام</span>
        </Link>

        {/* Search Bar - Responsive */}
        <div className="flex-1 max-w-full md:max-w-2xl">
          <SearchInput
            brandMark={<span className="text-primary font-black text-sm">مپوشام</span>}
          />
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Wishlist Button (Desktop) */}
          <Link href="/wishlist" className="hidden md:block">
            <IconButton ariaLabel="پسندیده‌ها" variant="ghost" size="md">
              <HeartIcon size={22} />
            </IconButton>
          </Link>

          {/* Account Button (Desktop) */}
          <Link href="/account" className="hidden md:block">
            <IconButton ariaLabel="حساب کاربری" variant="ghost" size="md">
              <UserIcon size={22} />
            </IconButton>
          </Link>

          {/* Mobile & Desktop Cart Button (Circular 50px height matching search on mobile) */}
          <Link href="/cart" className="relative">
            <IconButton
              ariaLabel="سبد خرید"
              size="lg"
              className="w-[50px] h-[50px] bg-surface-subtle text-foreground hover:bg-primary hover:text-primary-foreground transition-colors group"
            >
              <CartIcon size={22} className="text-foreground group-hover:text-primary-foreground transition-colors" />
            </IconButton>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-error text-error-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-background">
                {cartItemCount}
              </span>
            )}
          </Link>
        </div>
      </Container>
    </div>
  );
}
