import React from "react";
import { products } from "@/data/products";
import { categories, banners } from "@/data/common";
import { HeroSection } from "@/components/sections/HeroSection";
import { CategorySection } from "@/components/sections/CategorySection";
import { OfferSection } from "@/components/sections/OfferSection";
import { ProductGridSection } from "@/components/sections/ProductGridSection";

export default function HomePage() {
  const discountedProducts = products.filter((p) => p.pricing.hasDiscount);
  const newArrivals = products.slice(0, 4);

  return (
    <div className="flex flex-col gap-2 md:gap-6 pb-6">
      {/* Hero Banner Section (Carousel Slider) */}
      {banners.length > 0 && <HeroSection banners={banners} />}

      {/* Categories Section */}
      <CategorySection categories={categories} />

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
    </div>
  );
}
