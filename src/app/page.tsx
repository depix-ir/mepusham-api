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
  const newArrivals = products.slice(0, 9);
  const topCategories = categories.slice(0, 4);

  return (
    <div className="flex flex-col gap-6 md:gap-10 pb-8">
      {/* Hero Banner Section (Full width, no padding, no border-radius) */}
      {banners.length > 0 && <HeroSection banners={banners} id="hero-main" />}

      {/* Top Categories Showcase (Photo Cards Grid - 4 categories) */}
      <CategorySection categories={topCategories} variant="cards" />

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
        <React.Fragment key={category.id}>
          <CategoryCarouselSection
            category={category}
            products={products}
          />
          {category.slug === "bags-backpacks" && secondaryBanners.length > 0 && (
            <HeroSection banners={secondaryBanners} id="hero-secondary" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
