"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { formatPrice, formatPercent } from "@/lib/formatting/currency";
import { getProductCardPricing } from "@/lib/product/domain";
import { Badge } from "@/components/ui/Badge";
import { CartIcon } from "@/components/icons";

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  isCartActive?: boolean;
}

export function ProductCard({
  product,
  onAddToCart,
  isCartActive = false,
}: ProductCardProps) {
  const pricing = getProductCardPricing(product);
  const isOutOfStock = !product.inventory.hasAvailableVariants || product.inventory.totalStock === 0;

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock && onAddToCart) {
      onAddToCart(product);
    }
  };

  const primaryImage = product.images[0] || {
    url: "/images/placeholders/product-placeholder.webp",
    alt: product.title,
  };

  return (
    <div className="group relative flex flex-col bg-background border border-border-product rounded-md overflow-hidden transition-all duration-200 hover:shadow-md h-full">
      {/* Media / Image Container */}
      <Link href={`/products/${product.slug}`} className="relative block w-full aspect-square bg-surface-subtle overflow-hidden">
        <Image
          src={primaryImage.url}
          alt={primaryImage.alt || product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover object-center transition-transform duration-300 group-hover:scale-105 ${
            isOutOfStock ? "opacity-60 grayscale-[30%]" : ""
          }`}
        />

        {/* Discount Badge */}
        {pricing.hasDiscount && pricing.discountPercent && !isOutOfStock && (
          <div className="absolute top-2 right-2 z-10">
            <Badge variant="primary" size="md">
              {formatPercent(pricing.discountPercent)}
            </Badge>
          </div>
        )}

        {/* Out of stock overlay banner */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/40 flex items-center justify-center">
            <span className="bg-foreground/80 text-background text-xs font-bold px-3 py-1 rounded-sm">
              ناموجود
            </span>
          </div>
        )}
      </Link>

      {/* Content Container */}
      <div className="flex flex-col flex-1 p-3 justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex flex-col gap-1">
          {product.brand && (
            <span className="text-[10px] text-muted font-medium">
              {product.brand.name}
            </span>
          )}
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-xs md:text-sm font-medium text-foreground line-clamp-2 leading-relaxed group-hover:text-primary transition-colors">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Pricing & Cart Action */}
        <div className="flex items-end justify-between gap-2 pt-1 border-t border-border/40 mt-auto">
          {/* Price Block */}
          <div className="flex flex-col">
            {pricing.hasDiscount && pricing.compareAtPrice ? (
              <span className="text-[10px] md:text-xs text-muted line-through">
                {formatPrice(pricing.compareAtPrice, false)}
              </span>
            ) : null}
            <span className="text-xs md:text-sm font-bold text-foreground">
              {formatPrice(pricing.price)}
            </span>
          </div>

          {/* Cart Button */}
          <button
            type="button"
            onClick={handleCartClick}
            disabled={isOutOfStock}
            aria-label={`افزودن ${product.title} به سبد خرید`}
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
              isOutOfStock
                ? "bg-surface-subtle text-muted cursor-not-allowed"
                : isCartActive
                ? "bg-primary text-primary-foreground"
                : "bg-surface-subtle text-foreground hover:bg-primary hover:text-primary-foreground"
            }`}
          >
            <CartIcon size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
