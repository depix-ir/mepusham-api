import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ProductCategory } from "@/types/product";
import { Container } from "@/components/ui/Container";

interface CategorySectionProps {
  categories: ProductCategory[];
  variant?: "cards" | "circular";
  title?: string;
}

export function CategorySection({
  categories,
  variant = "cards",
  title,
}: CategorySectionProps) {
  if (!categories || categories.length === 0) return null;

  // Variant 1: Photo Cards (Used at the top of the Home Page)
  if (variant === "cards") {
    return (
      <section className="w-full my-4 md:my-8">
        <Container>
          {title && (
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-2xl font-bold text-foreground">
                {title}
              </h2>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-[8px]">
            {categories.map((category) => {
              const fallbackImg = "/images/category-1.webp";
              const imgSrc = category.imageUrl || fallbackImg;

              return (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="group relative block w-full aspect-square rounded-2xl overflow-hidden bg-surface-subtle border border-border-product shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <Image
                    src={imgSrc}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover object-center group-hover:scale-108 transition-transform duration-500"
                  />
                </Link>
              );
            })}
          </div>
        </Container>
      </section>
    );
  }

  // Variant 2: Large Circular Images + Linked Category Name (Used at the bottom of Home Page)
  return (
    <section className="w-full my-8 md:my-12">
      <Container>
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
            {title || "دسته‌بندی‌های محبوب"}
          </h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-8 md:gap-10 justify-items-center">
          {categories.map((category) => {
            const fallbackImg = "/images/category-1.webp";
            const imgSrc = category.imageUrl || fallbackImg;

            return (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group flex flex-col items-center text-center cursor-pointer"
              >
                {/* Round Image with Full Border Radius */}
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-2 border-border-product group-hover:border-primary group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 shadow-md bg-surface-subtle">
                  <Image
                    src={imgSrc}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, 176px"
                    className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                {/* Category Name */}
                <span className="mt-3 sm:mt-4 text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
