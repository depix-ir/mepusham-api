import React from "react";
import { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";

export interface ProductGridProps {
  products: Product[];
  onAddToCart?: (product: Product) => void;
  className?: string;
}

export function ProductGrid({
  products,
  onAddToCart,
  className = "",
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center text-center bg-surface-subtle rounded-xl border border-border-product">
        <p className="text-sm font-medium text-muted">محصولی برای نمایش وجود ندارد.</p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0 border-t border-r border-border-product rounded-xl overflow-hidden bg-background shadow-xs ${className}`.trim()}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          className="border-b border-l border-border-product rounded-none border-t-0 border-r-0 hover:z-10 hover:shadow-xl transition-all"
        />
      ))}
    </div>
  );
}
