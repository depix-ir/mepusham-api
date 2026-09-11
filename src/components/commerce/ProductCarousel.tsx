"use client";

import React, { useRef, useState } from "react";
import { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";
import { IconButton } from "@/components/ui/IconButton";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

export interface ProductCarouselProps {
  products: Product[];
  onAddToCart?: (product: Product) => void;
  className?: string;
  hideControls?: boolean;
  cardWidthClass?: string;
}

export function ProductCarousel({
  products,
  onAddToCart,
  className = "",
  hideControls = false,
  cardWidthClass = "w-[170px] sm:w-[220px] md:w-[250px]",
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    // In RTL direction: scrolling left moves forward, right moves backward
    const modifier = direction === "left" ? -scrollAmount : scrollAmount;
    scrollRef.current.scrollBy({ left: modifier, behavior: "smooth" });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsMouseDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  if (products.length === 0) return null;

  return (
    <div className={`relative w-full ${className}`.trim()}>
      {/* Navigation Controls */}
      {!hideControls && (
        <div className="hidden md:flex items-center gap-2 absolute -top-12 left-0 z-10">
          <IconButton
            ariaLabel="قبلی"
            variant="outline"
            size="sm"
            onClick={() => scroll("right")}
            className="bg-background/90 hover:bg-background text-foreground shadow-sm rounded-full"
          >
            <ChevronRightIcon size={18} />
          </IconButton>
          <IconButton
            ariaLabel="بعدی"
            variant="outline"
            size="sm"
            onClick={() => scroll("left")}
            className="bg-background/90 hover:bg-background text-foreground shadow-sm rounded-full"
          >
            <ChevronLeftIcon size={18} />
          </IconButton>
        </div>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeaveOrUp}
        onMouseUp={handleMouseLeaveOrUp}
        onMouseMove={handleMouseMove}
        className={`flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0 dir-rtl select-none ${
          isMouseDown ? "cursor-grabbing scroll-auto" : "cursor-grab"
        }`}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className={`${cardWidthClass} shrink-0 flex flex-col`}
          >
            <ProductCard
              product={product}
              onAddToCart={onAddToCart}
              className="h-full rounded-xl"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
