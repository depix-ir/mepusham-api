import React from "react";
import Link from "next/link";
import { ProductCategory } from "@/types/product";
import { Container } from "@/components/ui/Container";

interface CategorySectionProps {
  categories: ProductCategory[];
}

export function CategorySection({ categories }: CategorySectionProps) {
  return (
    <section className="w-full my-6 md:my-10">
      <Container>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-base md:text-xl font-bold text-foreground">
            دسته‌بندی‌های محبوب
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-6">
          {categories.map((category, idx) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group flex flex-col items-center justify-center p-4 md:p-6 bg-surface-subtle hover:bg-primary-50 border border-border/50 rounded-md transition-all duration-200 text-center"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg md:text-xl mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {idx + 1}
              </div>
              <span className="text-xs md:text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
