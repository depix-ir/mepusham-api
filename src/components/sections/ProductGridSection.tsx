import React from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { Container } from "@/components/ui/Container";
import { ProductGrid } from "@/components/commerce/ProductGrid";

interface ProductGridSectionProps {
  products: Product[];
  title: string;
  subtitle?: string;
  viewAllUrl?: string;
}

export function ProductGridSection({
  products,
  title,
  subtitle,
  viewAllUrl,
}: ProductGridSectionProps) {
  return (
    <section className="w-full">
      <Container>
        <div className="flex items-end justify-between mb-4 md:mb-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-base md:text-xl font-bold text-foreground">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs md:text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          {viewAllUrl && (
            <Link
              href={viewAllUrl}
              className="text-xs md:text-sm font-medium text-primary hover:underline underline-offset-4"
            >
              مشاهده همه
            </Link>
          )}
        </div>
        <ProductGrid products={products} />
      </Container>
    </section>
  );
}
