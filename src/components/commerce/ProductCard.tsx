"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { formatPrice, formatPercent } from "@/lib/formatting/currency";
import { getProductCardPricing } from "@/lib/product/domain";
import { Badge } from "@/components/ui/Badge";
import { CartIcon, TomanIcon } from "@/components/icons";
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
  const { isLiked: checkIsLiked, toggle: toggleWishlist } = useWishlist();
  const isLiked = checkIsLiked(product.id);
  const pricing = getProductCardPricing(product);
  const isOutOfStock =
    !product.inventory.hasAvailableVariants || product.inventory.totalStock === 0;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

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
          className={`object-cover object-center transition-all duration-500 group-hover:scale-105 ${
            isOutOfStock ? "opacity-65 grayscale-[20%]" : ""
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

        {/* Wishlist Interactive Toggle Button */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={isLiked ? `حذف ${product.title} از لیست پسندیده‌ها` : `افزودن ${product.title} به لیست پسندیده‌ها`}
          title={isLiked ? "حذف از پسندیده‌ها" : "افزودن به پسندیده‌ها"}
          className={`absolute top-2 left-2 z-10 p-1.5 rounded-full shadow-xs transition-all cursor-pointer flex items-center justify-center ${
            isLiked
              ? "bg-white/95 backdrop-blur-xs text-rose-500 hover:bg-white hover:scale-110"
              : "bg-white/80 backdrop-blur-xs text-neutral-400 hover:text-rose-500 hover:bg-white hover:scale-110"
          }`}
        >
          <Heart size={16} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "text-rose-500" : ""} />
        </button>

        {/* Discount Badge */}
        {pricing.hasDiscount && pricing.discountPercent && !isOutOfStock && (
          <div className="absolute top-2 right-2 z-10 ">
            <Badge variant="primary" size="md" className="bg-primary text-primary-foreground font-bold">
              {formatPercent(pricing.discountPercent)}
            </Badge>
          </div>
        )}

        {/* Out of stock minimal badge */}
        {isOutOfStock && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="px-2.5 py-1 text-[11px] font-medium tracking-wide bg-white/95 backdrop-blur-md text-neutral-600 rounded-full border border-neutral-200/80 shadow-xs select-none">
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
          <div className={`flex flex-col ${isOutOfStock ? "opacity-60" : ""}`}>
            {pricing.hasDiscount && pricing.compareAtPrice && !isOutOfStock ? (
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted line-through font-medium">
                <span>{formatPrice(pricing.compareAtPrice)}</span>
              </div>
            ) : null}
            <div className="flex items-center gap-1 text-xs sm:text-sm md:text-base font-bold text-foreground tracking-tight">
              <span>{formatPrice(pricing.price)}</span>
              <TomanIcon size={14} className="text-muted shrink-0" />
            </div>
          </div>

          {/* Cart Button */}
          <button
            type="button"
            onClick={handleCartClick}
            disabled={isOutOfStock}
            aria-label={isOutOfStock ? `${product.title} ناموجود است` : `افزودن ${product.title} به سبد خرید`}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
              isOutOfStock
                ? "bg-neutral-100 text-neutral-400 cursor-not-allowed opacity-50"
                : isCartActive
                ? "bg-primary text-primary-foreground shadow-md scale-105 cursor-pointer"
                : "bg-surface-subtle text-foreground hover:bg-primary hover:text-primary-foreground hover:shadow-md active:scale-95 cursor-pointer"
            }`}
          >
            <CartIcon size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
