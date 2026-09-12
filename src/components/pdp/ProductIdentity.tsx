"use client";

import React from "react";
import Link from "next/link";
import { ProductBrand, ProductCategory, ProductRating } from "@/types/product";
import { Star, ChevronLeft } from "lucide-react";

export interface ProductIdentityProps {
  title: string;
  brand?: ProductBrand;
  category: ProductCategory;
  sku: string;
  rating?: ProductRating;
}

export function ProductIdentity({
  title,
  brand,
  category,
  sku,
  rating,
}: ProductIdentityProps) {
  const scrollToReviews = (e: React.MouseEvent) => {
    e.preventDefault();
    const reviewElement = document.getElementById("reviews-section");
    if (reviewElement) {
      reviewElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* Breadcrumb Navigation */}
      <nav aria-label="مسیر راهنما" className="flex items-center gap-1.5 text-xs text-muted flex-wrap">
        <Link href="/" className="hover:text-primary transition-colors">
          خانه
        </Link>
        <ChevronLeft className="w-3 h-3 text-muted/60 shrink-0" />
        <Link href={`/products?category=${category.slug}`} className="hover:text-primary transition-colors">
          {category.name}
        </Link>
        <ChevronLeft className="w-3 h-3 text-muted/60 shrink-0" />
        <span className="text-foreground font-medium truncate max-w-[180px] sm:max-w-xs" title={title}>
          {title}
        </span>
      </nav>

      {/* Brand & SKU bar */}
      <div className="flex items-center justify-between gap-2 pt-1">
        {brand && (
          <Link
            href={`/products?brand=${brand.slug}`}
            className="text-xs font-semibold text-primary uppercase tracking-wider hover:underline"
          >
            {brand.name}
          </Link>
        )}
        <span className="text-[11px] text-muted font-mono bg-surface-subtle px-2 py-0.5 rounded-md border border-border-product">
          شناسه: {sku}
        </span>
      </div>

      {/* Product Title */}
      <h1 className="text-lg sm:text-2xl font-bold text-foreground leading-snug tracking-tight">
        {title}
      </h1>

      {/* Rating & Review Counter Summary */}
      {rating && (
        <div className="flex items-center gap-3 pt-0.5">
          <a
            href="#reviews-section"
            onClick={scrollToReviews}
            className="flex items-center gap-1.5 group cursor-pointer"
          >
            <div className="flex items-center gap-1 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 px-2 py-0.5 rounded-md border border-amber-200/60 font-semibold text-xs">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>{rating.average.toFixed(1)}</span>
            </div>
            <span className="text-xs text-muted group-hover:text-primary transition-colors underline decoration-dotted">
              ({rating.count} دیدگاه کاربران)
            </span>
          </a>
        </div>
      )}
    </div>
  );
}
