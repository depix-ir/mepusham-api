import React from "react";
import { products } from "@/data/products";
import { categories, banners } from "@/data/common";
import { HeroSection } from "@/components/sections/HeroSection";
import { CategorySection } from "@/components/sections/CategorySection";
import { OfferSection } from "@/components/sections/OfferSection";
import { ProductGridSection } from "@/components/sections/ProductGridSection";
import { CategoryCarouselSection } from "@/components/sections/CategoryCarouselSection";

export default function HomePage() {
  const discountedProducts = products.filter((p) => p.pricing.hasDiscount);
  const newArrivals = products.slice(0, 4);

  return (
    <div className="flex flex-col gap-6 md:gap-10 pb-8">
      {/* Hero Banner Section (Full width, no padding, no border-radius) */}
      {banners.length > 0 && <HeroSection banners={banners} />}

      {/* Top Categories Showcase (Photo Cards Grid) */}
      <CategorySection categories={categories} variant="cards" />

      {/* Special Offers Section (Carousel) */}
      <OfferSection
        products={discountedProducts}
        title="پیشنهادهای شگفت‌انگیز"
        description="تخفیف‌های ویژه روی لباس‌ها و اکسسوری‌های منتخب"
      />

      {/* New Arrivals Grid Section */}
      <ProductGridSection
        products={newArrivals}
        title="جدیدترین محصولات"
        subtitle="بهترین و به روزترین استایل‌های زنانه"
        viewAllUrl="/products"
      />

      {/* Category Product Carousels (1 Carousel Per Category) */}
      {categories.map((category) => (
        <CategoryCarouselSection
          key={category.id}
          category={category}
          products={products}
        />
      ))}
    </div>
  );
}
