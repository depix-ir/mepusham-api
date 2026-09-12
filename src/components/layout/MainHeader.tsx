"use client";

import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SearchInput } from "@/components/ui/SearchInput";
import { IconButton } from "@/components/ui/IconButton";
import { HeartIcon, UserIcon } from "@/components/icons";
import { CartButton } from "./CartButton";

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
          className="hidden md:flex items-center gap-2 text-2xl font-black text-primary tracking-tight shrink-0 hover:opacity-90 transition-opacity"
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
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
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

          {/* Cart Button (Handles Mobile & Desktop) */}
          <CartButton cartItemCount={cartItemCount} />
        </div>
      </Container>
    </div>
  );
}
