"use client";

import React from "react";
import Link from "next/link";
import { CartIcon } from "@/components/icons";
import { IconButton } from "@/components/ui/IconButton";

export interface CartButtonProps {
  cartItemCount?: number;
  className?: string;
}

export function CartButton({ cartItemCount = 0, className = "" }: CartButtonProps) {
  return (
    <Link
      href="/cart"
      className={`relative inline-flex items-center shrink-0 group ${className}`}
      aria-label={`سبد خرید (${cartItemCount} کالا)`}
    >
      {/* Mobile Cart Button (APPROVED DESIGN: DO NOT CHANGE) */}
      <div className="md:hidden relative">
        <IconButton
          ariaLabel="سبد خرید"
          size="lg"
          className="w-[50px] h-[50px] bg-surface-subtle text-foreground hover:bg-primary hover:text-primary-foreground transition-colors group"
        >
          <CartIcon
            size={22}
            className="text-foreground group-hover:text-primary-foreground transition-colors"
          />
        </IconButton>
        {cartItemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-error text-error-foreground text-[10px] font-bold  rounded-full flex items-center justify-center border-2 border-background">
            {cartItemCount}
          </span>
        )}
      </div>

      {/* Desktop Dedicated Cart Button (Commerce-Specific Visual Identity) */}
      <div
        className="hidden md:inline-flex items-center gap-2.5 px-4 h-11 bg-primary text-primary-foreground rounded-md font-medium text-sm transition-all duration-200 ease-in-out hover:bg-primary-hover active:bg-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 shadow-2xs hover:shadow-xs cursor-pointer select-none"
        role="button"
        tabIndex={0}
      >
        <div className="relative flex items-center justify-center">
          <CartIcon size={20} className="text-primary-foreground shrink-0" />
        </div>
        <span className="font-semibold text-sm whitespace-nowrap">سبد خرید</span>
        {cartItemCount > 0 ? (
          <span className="bg-primary-foreground text-primary text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center shrink-0 leading-none shadow-2xs">
            {cartItemCount}
          </span>
        ) : (
          <span className="bg-primary-hover/50 text-primary-foreground/90 text-xs font-medium px-2 py-0.5 rounded-full min-w-[20px] text-center shrink-0 leading-none">
            ۰
          </span>
        )}
      </div>
    </Link>
  );
}
