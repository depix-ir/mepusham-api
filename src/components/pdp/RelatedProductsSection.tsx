"use client";

import React from "react";
import { Product } from "@/types/product";
import { ProductCarousel } from "@/components/commerce/ProductCarousel";

export interface RelatedProductsSectionProps {
  products: Product[];
  onAddToCart?: (product: Product) => void;
}

export function RelatedProductsSection({
  products,
  onAddToCart,
}: RelatedProductsSectionProps) {
  if (products.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 pt-6 border-t border-border-product">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-xl font-bold text-foreground">
          محصولات مشابه و پیشنهادی
        </h2>
      </div>
      <ProductCarousel products={products} onAddToCart={onAddToCart} />
    </div>
  );
}
