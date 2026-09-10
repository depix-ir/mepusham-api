"use client";

import React, { useRef } from "react";
import { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";
import { IconButton } from "@/components/ui/IconButton";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

export interface ProductCarouselProps {
  products: Product[];
  onAddToCart?: (product: Product) => void;
  className?: string;
}

export function ProductCarousel({
  products,
  onAddToCart,
  className = "",
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    // In RTL direction: scrolling left moves forward in list, right moves backward
    const modifier = direction === "left" ? -scrollAmount : scrollAmount;
    scrollRef.current.scrollBy({ left: modifier, behavior: "smooth" });
  };

  return (
    <div className={`relative w-full group ${className}`.trim()}>
      {/* Navigation Controls (Visible on hover/desktop) */}
      <div className="hidden md:flex items-center justify-between absolute -top-12 left-0 gap-2 z-10">
        <IconButton
          ariaLabel="قبلی"
          variant="outline"
          size="sm"
          onClick={() => scroll("right")}
          className="bg-background/80 hover:bg-background"
        >
          <ChevronRightIcon size={18} />
        </IconButton>
        <IconButton
          ariaLabel="بعدی"
          variant="outline"
          size="sm"
          onClick={() => scroll("left")}
          className="bg-background/80 hover:bg-background"
        >
          <ChevronLeftIcon size={18} />
        </IconButton>
      </div>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex gap-2 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1 -mx-1 dir-rtl"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[170px] sm:w-[210px] md:w-[240px] shrink-0"
          >
            <ProductCard product={product} onAddToCart={onAddToCart} />
          </div>
        ))}
      </div>
    </div>
  );
}
