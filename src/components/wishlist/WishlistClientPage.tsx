"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useWishlist } from "@/store/wishlist/wishlist.store";
import { useCart } from "@/store/cart/cart.store";
import { products as catalogProducts } from "@/data/products";
import { Product } from "@/types/product";
import { getProductCardPricing } from "@/lib/product/domain";
import { formatPrice } from "@/lib/formatting/currency";
import { TomanIcon } from "@/components/icons";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/commerce/ProductCard";
import { WishlistEmptyState } from "./WishlistEmptyState";
import { WishlistOfferCard } from "./WishlistOfferCard";
import { WishlistTrustSection } from "./WishlistTrustSection";
import { ShoppingBag, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";

export function WishlistClientPage() {
  const { likedProductIds, remove, clear } = useWishlist();
  const { addItem, openCart } = useCart();
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "warning";
    text: string;
    subText?: string;
  } | null>(null);

  // Map wishlist product IDs to current catalog product objects, filtering out invalid or deleted IDs safely
  const likedProducts = useMemo(() => {
    const productMap = new Map<string, Product>();
    catalogProducts.forEach((p) => productMap.set(p.id, p));

    const result: Product[] = [];
    const seen = new Set<string>();

    likedProductIds.forEach((id) => {
      if (!seen.has(id)) {
        seen.add(id);
        const prod = productMap.get(id);
        if (prod) {
          result.push(prod);
        }
      }
    });

    return result;
  }, [likedProductIds]);

  // Derive counts & financial calculations
  const totalLikedCount = likedProducts.length;

  const { availableProducts, unavailableProducts, totalAvailablePrice, totalAvailableDiscount } =
    useMemo(() => {
      const avail: Product[] = [];
      const unavail: Product[] = [];
      let priceSum = 0;
      let discountSum = 0;

      likedProducts.forEach((p) => {
        const isOutOfStock = !p.inventory.hasAvailableVariants || p.inventory.totalStock === 0;
        if (isOutOfStock) {
          unavail.push(p);
        } else {
          avail.push(p);
          const pricing = getProductCardPricing(p);
          priceSum += pricing.price; // quantity defaults to 1
          if (pricing.hasDiscount && pricing.compareAtPrice) {
            discountSum += pricing.compareAtPrice - pricing.price;
          }
        }
      });

      return {
        availableProducts: avail,
        unavailableProducts: unavail,
        totalAvailablePrice: priceSum,
        totalAvailableDiscount: discountSum,
      };
    }, [likedProducts]);

  const availableCount = availableProducts.length;
  const unavailableCount = unavailableProducts.length;
  const isAllOutOfStock = totalLikedCount > 0 && availableCount === 0;

  // Bulk add all available products to Cart
  const handleAddAllToCart = () => {
    if (availableCount === 0) return;

    let addedCount = 0;
    let skippedCount = 0;

    availableProducts.forEach((product) => {
      const defaultOpts: Record<string, string> = {};
      product.options.forEach((opt) => {
        if (opt.values.length > 0) {
          defaultOpts[opt.id] = opt.values[0].id;
        }
      });

      const success = addItem(product, 1, defaultOpts);
      if (success) {
        addedCount++;
      } else {
        skippedCount++;
      }
    });

    const totalSkipped = skippedCount + unavailableCount;

    if (addedCount > 0) {
      if (totalSkipped > 0) {
        setFeedbackMessage({
          type: "warning",
          text: `${addedCount} محصول موجود به سبد خرید اضافه شد.`,
          subText: `${totalSkipped} محصول به دلیل ناموجود بودن یا محدودیت انبار اضافه نشد.`,
        });
      } else {
        setFeedbackMessage({
          type: "success",
          text: "تمام محصولات موجود با موفقیت به سبد خرید اضافه شدند.",
        });
      }
    } else {
      setFeedbackMessage({
        type: "warning",
        text: "هیچ محصولی به سبد خرید اضافه نشد.",
        subText: "محصولات انتخاب شده در انبار موجود نیستند.",
      });
    }
  };

  if (totalLikedCount === 0) {
    return (
      <Container className="py-8">
        <WishlistEmptyState />
      </Container>
    );
  }

  return (
    <Container className="py-6 md:py-10">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-border-product">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl sm:text-2xl font-black text-foreground">محصولات پسندیده شده</h1>
          <span className="text-xs sm:text-sm text-muted font-medium">({totalLikedCount} محصول)</span>
        </div>
        <button
          type="button"
          onClick={clear}
          className="text-xs text-muted hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer font-medium"
        >
          <Trash2 size={15} />
          <span>پاک‌سازی لیست</span>
        </button>
      </div>

      {/* Dynamic Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`mb-6 p-4 rounded-xl border flex items-start justify-between gap-3 ${
            feedbackMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-amber-50 border-amber-200 text-amber-900"
          }`}
        >
          <div className="flex items-start gap-2.5">
            {feedbackMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="flex flex-col gap-0.5">
              <span className="text-xs sm:text-sm font-bold">{feedbackMessage.text}</span>
              {feedbackMessage.subText && (
                <span className="text-[11px] sm:text-xs opacity-90">{feedbackMessage.subText}</span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={openCart}
            className="text-xs font-bold underline shrink-0 hover:opacity-80"
          >
            مشاهده سبد خرید
          </button>
        </div>
      )}

      {/* Main Grid: Desktop 8/4 Layout | Mobile Mobile-first Order */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Wishlist Product Cards Grid (Desktop Right 8 cols / Mobile below summary) */}
        <div className="lg:col-span-8 order-2 lg:order-1 flex flex-col gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
            {likedProducts.map((product) => (
              <div key={product.id} className="relative group/wishlist-item flex flex-col h-full">
                {/* Remove overlay button specific to Wishlist page container */}
                <button
                  type="button"
                  onClick={() => remove(product.id)}
                  aria-label={`حذف ${product.title} از لیست پسندیده‌ها`}
                  title="حذف از پسندیده‌ها"
                  className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-white/95 text-muted hover:text-rose-600 shadow-md transition-colors cursor-pointer"
                >
                  <Trash2 size={15} />
                </button>

                {/* Shared Standard Product Card */}
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Wishlist Summary Sidebar (Desktop Left 4 cols / Mobile top) */}
        <div className="lg:col-span-4 order-1 lg:order-2 flex flex-col gap-4 sticky top-24">
          <div className="bg-background border border-border-product rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-xs">
            <h2 className="text-base font-bold text-foreground pb-3 border-b border-border-product">
              خلاصه لیست پسندیده‌ها
            </h2>

            {/* Counts & Availability Details */}
            <div className="flex flex-col gap-2.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-muted font-medium">
                <span>تعداد کل پسندیده‌ها:</span>
                <span className="text-foreground font-bold">{totalLikedCount} محصول</span>
              </div>

              {unavailableCount > 0 && (
                <div className="flex items-center justify-between text-muted font-medium">
                  <span>محصولات آماده خرید:</span>
                  <span className="text-emerald-700 font-bold">{availableCount} محصول</span>
                </div>
              )}

              {totalAvailableDiscount > 0 && (
                <div className="flex items-center justify-between text-emerald-700 font-medium">
                  <span>مجموع تخفیف:</span>
                  <div className="flex items-center gap-1 font-bold">
                    <span>{formatPrice(totalAvailableDiscount)}</span>
                    <TomanIcon size={13} className="text-emerald-700 shrink-0" />
                  </div>
                </div>
              )}
            </div>

            {/* Total Purchasable Price Block */}
            <div className="flex flex-col gap-1 pt-3 border-t border-border-product">
              <div className="flex items-baseline justify-between">
                <span className="text-xs sm:text-sm font-bold text-foreground">
                  {unavailableCount > 0 ? "مجموع مبلغ محصولات موجود:" : "مجموع مبلغ:"}
                </span>
                {isAllOutOfStock ? (
                  <div className="flex items-center gap-1 text-base sm:text-xl font-black text-primary">
                    <span>۰</span>
                    <TomanIcon size={16} className="text-primary/70 shrink-0" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-base sm:text-xl font-black text-primary">
                    <span>{formatPrice(totalAvailablePrice)}</span>
                    <TomanIcon size={16} className="text-primary/70 shrink-0" />
                  </div>
                )}
              </div>

              {/* Explicit Out-of-Stock Explanation Notice */}
              {unavailableCount > 0 && (
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200/60 leading-relaxed mt-1">
                  مبلغ نهایی بر اساس {availableCount} محصول موجود محاسبه شده است ({unavailableCount} محصول
                  ناموجود در مجموع مبلغ محاسبه نشده‌اند).
                </p>
              )}

              {isAllOutOfStock && (
                <p className="text-[11px] text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200/60 leading-relaxed mt-1">
                  در حال حاضر هیچ‌کدام از محصولات پسندیده‌شده موجود نیستند.
                </p>
              )}
            </div>

            {/* Promotional Bulk Purchase Offer */}
            <WishlistOfferCard />

            {/* Trust Signals Block */}
            <WishlistTrustSection />

            {/* Primary CTA: Add All To Cart */}
            <button
              type="button"
              onClick={handleAddAllToCart}
              disabled={isAllOutOfStock}
              className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                isAllOutOfStock
                  ? "bg-surface-subtle text-muted cursor-not-allowed opacity-60 shadow-none"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-98"
              }`}
            >
              <ShoppingBag size={18} />
              <span>افزودن کل لیست به سبد خرید</span>
            </button>
          </div>
        </div>
      </div>
    </Container>
  );
}
