import React from "react";
import { catalogRepository } from "@/lib/repositories/catalogRepository";
import { banners, secondaryBanners } from "@/data/common";
import { HeroSection } from "@/components/sections/HeroSection";
import { CategorySection } from "@/components/sections/CategorySection";
import { OfferSection } from "@/components/sections/OfferSection";
import { ProductGridSection } from "@/components/sections/ProductGridSection";
import { CategoryCarouselSection } from "@/components/sections/CategoryCarouselSection";

export default function HomePage() {
  const products = catalogRepository.getProducts({ isHydrated: false });
  const categories = catalogRepository.getCategories({ isHydrated: false });

  const discountedProducts = products.filter((p) => p.pricing.hasDiscount);
  const newArrivals = products.slice(0, 8);

  return (
    <div className="flex flex-col gap-6 md:gap-10 pb-8">
      {/* Hero Banner Section (Full width, no padding, no border-radius) */}
      {banners.length > 0 && <HeroSection banners={banners} id="hero-main" />}

      {/* Top Categories Showcase (Photo Cards Grid - 5 main categories) */}
      <CategorySection categories={categories} variant="cards" />

      {/* Special Offers Section (Carousel) */}
      <OfferSection
        products={discountedProducts}
        title="پیشنهادهای شگفت‌انگیز"
        description="تخفیف‌های ویژه روی لباس‌ها و کفش‌های جدید مردانه و زنانه"
      />

      {/* New Arrivals Grid Section */}
      <ProductGridSection
        products={newArrivals}
        title="جدیدترین محصولات"
        subtitle="بهترین و به‌روزترین استایل‌های لباس و کفش مردانه و زنانه"
        viewAllUrl="/products"
      />

      {/* Secondary Banner Slider directly below New Arrivals */}
      {secondaryBanners.length > 0 && (
        <HeroSection banners={secondaryBanners} id="hero-secondary" />
      )}

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
