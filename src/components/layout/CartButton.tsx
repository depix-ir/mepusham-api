"use client";

import React from "react";
import { CartIcon } from "@/components/icons";
import { IconButton } from "@/components/ui/IconButton";
import { useCart } from "@/store/cart/cart.store";

export interface CartButtonProps {
  cartItemCount?: number;
  className?: string;
}

export function CartButton({ className = "" }: CartButtonProps) {
  const { getItemCount, openCart } = useCart();
  const count = getItemCount();

  return (
    <div
      className={`relative inline-flex items-center shrink-0 group ${className}`}
    >
      {/* Mobile Cart Button */}
      <div className="md:hidden relative">
        <IconButton
          ariaLabel={`سبد خرید (${count} کالا)`}
          size="lg"
          onClick={openCart}
          className="w-[50px] h-[50px] bg-surface-subtle text-foreground hover:bg-primary hover:text-primary-foreground transition-colors group"
        >
          <CartIcon
            size={22}
            className="text-foreground "
          />
        </IconButton>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full inline-flex items-center justify-center border-2 border-background leading-none">
            {count}
          </span>
        )}
      </div>

      {/* Desktop Dedicated Cart Button */}
      <button
        type="button"
        onClick={openCart}
        className="hidden md:inline-flex items-center gap-2.5 px-4 h-11 bg-primary text-primary-foreground rounded-md font-medium text-sm transition-all duration-200 ease-in-out hover:bg-primary-hover active:bg-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 shadow-2xs hover:shadow-xs cursor-pointer select-none border-none"
        aria-label={`سبد خرید (${count} کالا)`}
      >
        <div className="relative flex items-center justify-center">
          <CartIcon size={20} className="text-primary-foreground shrink-0" />
        </div>
        <span className="font-semibold text-sm whitespace-nowrap">سبد خرید</span>
        {count > 0 ? (
          <span className="bg-primary-foreground text-primary text-xs font-bold px-2 h-5 rounded-full inline-flex items-center justify-center min-w-[20px] shrink-0 leading-none shadow-2xs pt-0.5">
            {count}
          </span>
        ) : (
          <span className="bg-primary-hover/50 text-primary-foreground/90 text-xs font-medium px-2 h-5 rounded-full inline-flex items-center justify-center min-w-[20px] shrink-0 leading-none pt-0.5">
            ۰
          </span>
        )}
      </button>
    </div>
  );
}
