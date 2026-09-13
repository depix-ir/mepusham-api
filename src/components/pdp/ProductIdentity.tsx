"use client";

import React from "react";
import Link from "next/link";
import { ProductBrand, ProductCategory, ProductRating } from "@/types/product";
import { Star, ChevronLeft, Heart } from "lucide-react";

export interface ProductIdentityProps {
  productId?: string;
  title: string;
  brand?: ProductBrand;
  category: ProductCategory;
  sku: string;
  rating?: ProductRating;
  isLiked?: boolean;
  onToggleWishlist?: () => void;
}

export function ProductIdentity({
  title,
  brand,
  category,
  sku,
  rating,
  isLiked = false,
  onToggleWishlist,
}: ProductIdentityProps) {
  const scrollToReviews = (e: React.MouseEvent) => {
    e.preventDefault();
    const reviewElement = document.getElementById("reviews-section");
    if (reviewElement) {
      reviewElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Quiet Breadcrumb Navigation */}
      <nav aria-label="مسیر راهنما" className="flex items-center gap-1 text-[11px] text-muted flex-wrap">
        <Link href="/" className="hover:text-primary transition-colors">
          خانه
        </Link>
        <ChevronLeft className="w-3 h-3 text-muted/50 shrink-0" />
        <Link href={`/products?category=${category.slug}`} className="hover:text-primary transition-colors">
          {category.name}
        </Link>
        <ChevronLeft className="w-3 h-3 text-muted/50 shrink-0" />
        <span className="text-foreground/80 truncate max-w-[160px] sm:max-w-xs" title={title}>
          {title}
        </span>
      </nav>

      {/* Brand & SKU bar */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        {brand ? (
          <Link
            href={`/products?brand=${brand.slug}`}
            className="text-xs font-semibold text-primary uppercase tracking-wide hover:underline"
          >
            {brand.name}
          </Link>
        ) : <div />}
        <span className="text-[11px] text-muted/80 font-mono">
          شناسه: {sku}
        </span>
      </div>

      {/* Product Title and Wishlist Toggle Button */}
      <div className="flex items-start justify-between gap-3 pt-0.5">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-snug tracking-tight flex-1">
          {title}
        </h1>
        {onToggleWishlist && (
          <button
            type="button"
            onClick={onToggleWishlist}
            aria-label={isLiked ? "حذف از پسندیده‌ها" : "افزودن به پسندیده‌ها"}
            title={isLiked ? "حذف از پسندیده‌ها" : "افزودن به پسندیده‌ها"}
            className={`p-2 rounded-full border transition-all shrink-0 cursor-pointer flex items-center justify-center ${
              isLiked
                ? "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
                : "bg-background border-border-product text-muted hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50/50"
            }`}
          >
            <Heart
              size={18}
              fill={isLiked ? "currentColor" : "none"}
              className={`transition-transform duration-200 ${isLiked ? "scale-105" : ""}`}
            />
          </button>
        )}
      </div>

      {/* Compact Rating Summary */}
      {rating && (
        <div className="flex items-center gap-2 pt-0.5">
          <a
            href="#reviews-section"
            onClick={scrollToReviews}
            className="inline-flex items-center gap-1.5 group cursor-pointer"
          >
            <div className="flex items-center gap-1 font-semibold text-xs text-foreground">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
              <span>{rating.average.toFixed(1)}</span>
            </div>
            <span className="text-xs text-muted group-hover:text-primary transition-colors">
              ({rating.count} دیدگاه)
            </span>
          </a>
        </div>
      )}
    </div>
  );
}
