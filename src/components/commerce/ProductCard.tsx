"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { formatPrice, formatPercent } from "@/lib/formatting/currency";
import { getProductCardPricing } from "@/lib/product/domain";
import { Badge } from "@/components/ui/Badge";
import { CartIcon } from "@/components/icons";
import { Heart } from "lucide-react";
import { useCart } from "@/store/cart/cart.store";
import { useWishlist } from "@/store/wishlist/wishlist.store";

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  isCartActive?: boolean;
  className?: string;
}

export function ProductCard({
  product,
  onAddToCart,
  isCartActive = false,
  className = "",
}: ProductCardProps) {
  const { addItem, openCart } = useCart();
  const { isLiked: checkIsLiked } = useWishlist();
  const isLiked = checkIsLiked(product.id);
  const pricing = getProductCardPricing(product);
  const isOutOfStock =
    !product.inventory.hasAvailableVariants || product.inventory.totalStock === 0;

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    if (onAddToCart) {
      onAddToCart(product);
      return;
    }

    // Default behavior: add first available variant or default options & open cart drawer
    const defaultOpts: Record<string, string> = {};
    product.options.forEach((opt) => {
      if (opt.values.length > 0) {
        defaultOpts[opt.id] = opt.values[0].id;
      }
    });

    const added = addItem(product, 1, defaultOpts);
    if (added) {
      openCart();
    }
  };

  const primaryImage = product.images[0] || {
    url: "/images/placeholders/product-placeholder.webp",
    alt: product.title,
  };

  const secondaryImage = product.images[1];

  return (
    <div
      className={`group relative flex flex-col bg-background border border-border-product rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg h-full ${className}`.trim()}
    >
      {/* Media / Image Container */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block w-full aspect-square bg-surface-subtle overflow-hidden"
      >
        {/* Primary Image */}
        <Image
          src={primaryImage.url}
          alt={primaryImage.alt || product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover object-center transition-transform duration-500 group-hover:scale-105 ${
            isOutOfStock ? "opacity-50 grayscale-[30%]" : ""
          }`}
        />

        {/* Secondary Image on Hover (if available) */}
        {secondaryImage && !isOutOfStock && (
          <Image
            src={secondaryImage.url}
            alt={secondaryImage.alt || product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        )}

        {/* Wishlist Status Indicator - NON-INTERACTIVE DISPLAY ONLY */}
        {isLiked && (
          <div
            className="absolute top-2 left-2 z-10 p-1.5 rounded-full bg-white/90 backdrop-blur-xs text-rose-500 shadow-xs pointer-events-none select-none flex items-center justify-center"
            aria-hidden="true"
          >
            <Heart size={16} fill="currentColor" className="text-rose-500" />
          </div>
        )}

        {/* Discount Badge */}
        {pricing.hasDiscount && pricing.discountPercent && !isOutOfStock && (
          <div className="absolute top-2 right-2 z-10 ">
            <Badge variant="primary" size="md" className="bg-primary text-primary-foreground font-bold">
              {formatPercent(pricing.discountPercent)}
            </Badge>
          </div>
        )}

        {/* Out of stock overlay banner */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="bg-foreground/90 text-background text-xs font-bold px-3 py-1.5 rounded-md shadow-md">
              ناموجود
            </span>
          </div>
        )}
      </Link>

      {/* Content Container */}
      <div className="flex flex-col flex-1 p-3.5 justify-between gap-3 bg-background">
        {/* Brand & Title */}
        <div className="flex flex-col gap-1">
          {product.brand && (
            <span className="text-[10px] md:text-xs text-muted font-medium tracking-wide">
              {product.brand.name}
            </span>
          )}
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 leading-relaxed group-hover:text-primary transition-colors">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Pricing & Cart Action */}
        <div className="flex items-end justify-between gap-2 pt-2 border-t border-border-product/60 mt-auto">
          {/* Price Block */}
          <div className="flex flex-col">
            {pricing.hasDiscount && pricing.compareAtPrice ? (
              <span className="text-[10px] sm:text-xs text-muted line-through font-medium">
                {formatPrice(pricing.compareAtPrice, false)}
              </span>
            ) : null}
            <span className="text-xs sm:text-sm md:text-base font-bold text-foreground tracking-tight">
              {formatPrice(pricing.price)}
            </span>
          </div>

          {/* Cart Button */}
          <button
            type="button"
            onClick={handleCartClick}
            disabled={isOutOfStock}
            aria-label={`افزودن ${product.title} به سبد خرید`}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer ${
              isOutOfStock
                ? "bg-surface-subtle text-muted cursor-not-allowed opacity-60"
                : isCartActive
                ? "bg-primary text-primary-foreground shadow-md scale-105"
                : "bg-surface-subtle text-foreground hover:bg-primary hover:text-primary-foreground hover:shadow-md active:scale-95"
            }`}
          >
            <CartIcon size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
