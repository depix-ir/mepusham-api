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
    <section className="w-full my-6 md:my-10">
      <Container>
        <div className="w-full rounded-2xl bg-gradient-to-l from-primary to-primary-hover text-primary-foreground p-5 sm:p-8 md:p-10 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">{title}</h2>
              {description && (
                <p className="text-xs sm:text-sm text-primary-foreground/85 font-medium">
                  {description}
                </p>
              )}
            </div>
            <Link
              href="/offers"
              className="text-xs sm:text-sm font-semibold hover:underline underline-offset-4 text-primary-foreground shrink-0 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors self-start sm:self-auto"
            >
              مشاهده همه محصولات
            </Link>
          </div>

          <ProductCarousel products={products} />
        </div>
      </Container>
    </section>
  );
}
