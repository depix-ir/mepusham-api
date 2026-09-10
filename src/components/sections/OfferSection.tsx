import React from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { Container } from "@/components/ui/Container";
import { ProductCarousel } from "@/components/commerce/ProductCarousel";

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
  if (products.length === 0) return null;

  return (
    <section className="w-full my-6 md:my-10 py-6 md:py-10 bg-primary text-primary-foreground">
      <Container>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg md:text-2xl font-bold">{title}</h2>
            {description && (
              <p className="text-xs md:text-sm text-primary-foreground/80">
                {description}
              </p>
            )}
          </div>
          <Link
            href="/offers"
            className="text-xs md:text-sm font-medium hover:underline underline-offset-4 text-primary-foreground shrink-0"
          >
            مشاهده همه محصولات
          </Link>
        </div>

        <ProductCarousel products={products} />
      </Container>
    </section>
  );
}
