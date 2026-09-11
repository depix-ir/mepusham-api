"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { Container } from "@/components/ui/Container";
import { ProductCarousel } from "@/components/commerce/ProductCarousel";
import { IconButton } from "@/components/ui/IconButton";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

interface OfferSectionProps {
  products: Product[];
  title?: string;
  description?: string;
}

export function OfferSection({
  products,
  title = "پیشنهادهای شگفت‌انگیز",
  description = "بهترین تخفیف‌های امروز را از دست ندهید",
}: OfferSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (!containerRef.current) return;
    const carouselScrollEl = containerRef.current.querySelector(".overflow-x-auto");
    if (!carouselScrollEl) return;
    const scrollAmount = 320;
    const modifier = direction === "left" ? -scrollAmount : scrollAmount;
    carouselScrollEl.scrollBy({ left: modifier, behavior: "smooth" });
  };

  return (
    <section className="w-full my-6 md:my-10" ref={containerRef}>
      <Container>
        <div className="w-full rounded-2xl bg-gradient-to-l from-primary to-primary-hover text-primary-foreground p-2 sm:p-6 md:p-8 shadow-md">
          {/* Header row with side margin/padding on text and button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 px-3 sm:px-2">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg sm:text-2xl font-black tracking-tight">{title}</h2>
              {description && (
                <p className="text-xs sm:text-sm text-primary-foreground/85 font-medium">
                  {description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
              {/* Desktop Carousel Controls */}
              <div className="hidden md:flex items-center gap-2">
                <IconButton
                  ariaLabel="قبلی"
                  variant="outline"
                  size="sm"
                  onClick={() => scroll("right")}
                  className="bg-white/10 hover:bg-white/20 border-white/20 text-white rounded-full transition-colors"
                >
                  <ChevronRightIcon size={18} />
                </IconButton>
                <IconButton
                  ariaLabel="بعدی"
                  variant="outline"
                  size="sm"
                  onClick={() => scroll("left")}
                  className="bg-white/10 hover:bg-white/20 border-white/20 text-white rounded-full transition-colors"
                >
                  <ChevronLeftIcon size={18} />
                </IconButton>
              </div>

              <Link
                href="/offers"
                className="text-xs sm:text-sm font-semibold hover:underline underline-offset-4 text-primary-foreground shrink-0 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors"
              >
                مشاهده همه محصولات
              </Link>
            </div>
          </div>

          <ProductCarousel products={products} hideControls />
        </div>
      </Container>
    </section>
  );
}
