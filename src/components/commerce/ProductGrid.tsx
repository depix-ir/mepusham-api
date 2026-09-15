import React from "react";
import { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "./ProductCardSkeleton";

export interface ProductGridProps {
  products: Product[];
  skeletonCount?: number;
  onAddToCart?: (product: Product) => void;
  className?: string;
  emptyMessage?: string;
}

export function ProductGrid({
  products,
  skeletonCount = 0,
  onAddToCart,
  className = "",
  emptyMessage = "محصولی برای نمایش وجود ندارد.",
}: ProductGridProps) {
  const hasProducts = products.length > 0;
  const hasSkeletons = skeletonCount > 0;

  if (!hasProducts && !hasSkeletons) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center text-center bg-surface-subtle rounded-xl border border-border-product">
        <p className="text-sm font-medium text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0 border-t border-r border-border-product rounded-xl overflow-hidden bg-background shadow-xs ${className}`.trim()}
    >
      {/* 1. Loaded Products */}
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          className="border-b border-l border-border-product rounded-none border-t-0 border-r-0 hover:z-10 hover:shadow-xl transition-all"
        />
      ))}

      {/* 2. Loading Skeletons */}
      {Array.from({ length: skeletonCount }).map((_, idx) => (
        <ProductCardSkeleton
          key={`grid-skeleton-${idx}`}
          className="border-b border-l border-border-product rounded-none border-t-0 border-r-0"
        />
      ))}
    </div>
  );
}
