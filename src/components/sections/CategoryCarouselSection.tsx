"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Product, ProductCategory } from "@/types/product";
import { Container } from "@/components/ui/Container";
import { ProductCarousel } from "@/components/commerce/ProductCarousel";
import { IconButton } from "@/components/ui/IconButton";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

interface CategoryCarouselSectionProps {
  category: ProductCategory;
  products: Product[];
  onAddToCart?: (product: Product) => void;
}

export function CategoryCarouselSection({
  category,
  products,
  onAddToCart,
}: CategoryCarouselSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter products for this category up to maximum 20 products
  const categoryProducts = products
    .filter(
      (p) =>
        p.category?.id === category.id ||
        p.category?.slug === category.slug
    )
    .slice(0, 20);

  if (categoryProducts.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;
    const carouselScrollEl = containerRef.current.querySelector(".overflow-x-auto");
    if (!carouselScrollEl) return;
    const scrollAmount = 320;
    const modifier = direction === "left" ? -scrollAmount : scrollAmount;
    carouselScrollEl.scrollBy({ left: modifier, behavior: "smooth" });
  };

  return (
    <section className="w-full my-6 md:my-8" ref={containerRef}>
      <Container>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-foreground">
              {category.name}
            </h2>
            <span className="text-xs text-muted font-medium bg-surface-subtle px-2 py-0.5 rounded-full">
              {categoryProducts.length} محصول
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Desktop Navigation Arrows */}
            <div className="hidden md:flex items-center gap-1.5">
              <IconButton
                ariaLabel="قبلی"
                variant="outline"
                size="sm"
                onClick={() => scroll("right")}
                className="bg-background hover:bg-surface-subtle text-foreground rounded-full h-8 w-8"
              >
                <ChevronRightIcon size={16} />
              </IconButton>
              <IconButton
                ariaLabel="بعدی"
                variant="outline"
                size="sm"
                onClick={() => scroll("left")}
                className="bg-background hover:bg-surface-subtle text-foreground rounded-full h-8 w-8"
              >
                <ChevronLeftIcon size={16} />
              </IconButton>
            </div>

            <Link
              href={`/category/${category.slug}`}
              className="text-xs sm:text-sm font-semibold text-primary hover:underline underline-offset-4"
            >
              مشاهده همه
            </Link>
          </div>
        </div>

        {/* Product Carousel with fixed mobile card width (w-[170px]) across all screen sizes */}
        <ProductCarousel
          products={categoryProducts}
          onAddToCart={onAddToCart}
          cardWidthClass="w-[170px]"
          hideControls
        />
      </Container>
    </section>
  );
}
