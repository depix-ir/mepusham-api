"use client";

import React, { useState } from "react";
import { Product } from "@/types/product";
import { getVariantDetails } from "@/lib/product/domain";
import { formatPrice } from "@/lib/formatting/currency";
import { useCart } from "@/store/cart/cart.store";
import { useWishlist } from "@/store/wishlist/wishlist.store";
import { ProductGallery } from "./ProductGallery";
import { ProductIdentity } from "./ProductIdentity";
import { VariantSelector } from "./VariantSelector";
import { SizeGuideModal } from "./SizeGuideModal";
import { NotifyMeModal } from "./NotifyMeModal";
import { AddToCartSuccessModal } from "./AddToCartSuccessModal";
import { TrustSignals } from "./TrustSignals";
import { ProductDescription } from "./ProductDescription";
import { ProductTabsAccordion } from "./ProductTabsAccordion";
import { ProductReviews } from "./ProductReviews";
import { RelatedProductsSection } from "./RelatedProductsSection";
import { StickyAddToCartBar } from "./StickyAddToCartBar";
import { ShoppingCart, Bell, Plus, Minus, Trash2 } from "lucide-react";

export interface ProductDetailPageProps {
  product: Product;
  relatedProducts?: Product[];
  onAddToCart?: (product: Product, quantity: number, selectedOptions: Record<string, string>) => void;
}

export function ProductDetailPage({
  product,
  relatedProducts = [],
  onAddToCart: customOnAddToCart,
}: ProductDetailPageProps) {
  const { items, addItem, updateQuantity, removeItem, openCart } = useCart();
  const { isLiked: checkIsLiked, toggle: toggleWishlist } = useWishlist();
  const isLiked = checkIsLiked(product.id);

  // Initialize default option selections if options exist
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    product.options.forEach((opt) => {
      if (opt.values.length > 0) {
        initial[opt.id] = opt.values[0].id;
      }
    });
    return initial;
  });

  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isNotifyMeOpen, setIsNotifyMeOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Derive active variant details
  const variantDetails = getVariantDetails(product, selectedOptions);

  // Match cart item for current selection
  const cartItem = React.useMemo(() => {
    if (!product) return undefined;
    return items.find((item) => {
      if (item.productId !== product.id) return false;
      if (variantDetails?.selectedVariant?.id) {
        return item.variantId === variantDetails.selectedVariant.id;
      }
      if (item.selectedVariants && item.selectedVariants.length > 0) {
        return item.selectedVariants.every(
          (sv) => selectedOptions?.[sv.attributeId] === sv.valueId
        );
      }
      return true;
    });
  }, [items, product, selectedOptions, variantDetails]);

  const cartQuantity = cartItem?.quantity || 0;

  const handleSelectOption = (optionId: string, valueId: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionId]: valueId,
    }));
  };

  const handleAddToCart = () => {
    // 1. Validate Product Exists
    if (!product || !product.id) return;

    // 2. Validate Variant Requirement & Selection & Availability
    if (product.options.length > 0 && !variantDetails.allOptionsSelected) return;
    if (!variantDetails.isAvailable) return;

    // Dispatch to global CartStore with quantity 1
    const added = addItem(product, 1, selectedOptions);

    if (added) {
      if (customOnAddToCart) {
        customOnAddToCart(product, 1, selectedOptions);
      }
      setIsSuccessModalOpen(true);
    }
  };

  const handleCardAddToCart = (prod: Product) => {
    // Quick add from related products carousel
    const defaultOpts: Record<string, string> = {};
    prod.options.forEach((opt) => {
      if (opt.values.length > 0) {
        defaultOpts[opt.id] = opt.values[0].id;
      }
    });
    const added = addItem(prod, 1, defaultOpts);
    if (added) {
      openCart();
    }
  };

  // Get selected option labels summary for sticky bar & modal
  const selectedVariantSummary = product.options
    .map((opt) => {
      const val = opt.values.find((v) => v.id === selectedOptions[opt.id]);
      return val ? `${opt.name}: ${val.label}` : null;
    })
    .filter(Boolean)
    .join(" | ");

  const mainImageUrl = product.images.length > 0 ? product.images[0].url : undefined;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-28 md:pb-12 flex flex-col gap-8">
      {/* Main Top Section: Gallery (Left/Right) + Buy Section (Right/Left) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        {/* Gallery Column */}
        <div className="lg:col-span-6 xl:col-span-6 w-full">
          <ProductGallery
            productId={product.id}
            images={product.images}
            title={product.title}
            hasDiscount={variantDetails.hasDiscount}
            discountPercent={variantDetails.discountPercent}
            isOutOfStock={!variantDetails.isAvailable}
            rating={product.rating}
            isLiked={isLiked}
            onToggleWishlist={() => toggleWishlist(product.id)}
          />
        </div>

        {/* Product Identity & Buy Actions Column */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-4">
          {/* Title, Brand, Breadcrumb, SKU, Rating, Wishlist toggle */}
          <ProductIdentity
            productId={product.id}
            title={product.title}
            brand={product.brand}
            category={product.category}
            sku={variantDetails.sku}
            rating={product.rating}
            isLiked={isLiked}
            onToggleWishlist={() => toggleWishlist(product.id)}
          />

          {/* Pricing Block */}
          <div className="flex items-center gap-3 py-2">
            <div className="flex flex-col">
              {variantDetails.hasDiscount && variantDetails.compareAtPrice && (
                <span className="text-xs sm:text-sm text-muted line-through font-medium">
                  {formatPrice(variantDetails.compareAtPrice, false)}
                </span>
              )}
              <span className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {formatPrice(variantDetails.price)}
              </span>
            </div>

            {variantDetails.hasDiscount && variantDetails.discountPercent && (
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {variantDetails.discountPercent}٪ تخفیف
              </span>
            )}
          </div>

          {/* Variants Selector (Colors, Sizes) */}
          <VariantSelector
            product={product}
            selectedOptions={selectedOptions}
            onSelectOption={handleSelectOption}
            sizeGuide={product.sizeGuide}
            onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
          />

          {/* Stock Status Badge */}
          <div className="flex items-center gap-2 text-xs font-medium">
            {variantDetails.isAvailable ? (
              <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {variantDetails.stock <= 5 ? (
                  <span className="font-bold">تنها {variantDetails.stock} عدد در انبار باقی مانده است!</span>
                ) : (
                  <span>موجود در انبار</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="font-bold">در حال حاضر این تنوع ناموجود است</span>
              </div>
            )}
          </div>

          {/* Desktop Quantity & Add to Cart Action Row */}
          <div className="hidden md:flex items-center gap-4 pt-2">
            {!variantDetails.isAvailable ? (
              <button
                type="button"
                onClick={() => setIsNotifyMeOpen(true)}
                className="w-full h-13 px-6 rounded-xl bg-amber-500 text-white font-bold text-base flex items-center justify-center gap-2 hover:bg-amber-600 transition-all active:scale-98 shadow-md cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                <span>موجود شد به من اطلاع بده</span>
              </button>
            ) : cartQuantity > 0 ? (
              <div className="w-full flex items-center justify-between gap-3 p-2 bg-surface-subtle border-2 border-primary/30 rounded-2xl shadow-sm transition-all duration-300 animate-fade-in">
                <button
                  type="button"
                  onClick={() => {
                    if (!cartItem) return;
                    if (cartQuantity <= 1) {
                      removeItem(cartItem.id);
                    } else {
                      updateQuantity(cartItem.id, cartQuantity - 1);
                    }
                  }}
                  aria-label={cartQuantity === 1 ? "حذف از سبد خرید" : "کاهش تعداد"}
                  title={cartQuantity === 1 ? "حذف از سبد خرید" : "کاهش تعداد"}
                  className="w-12 h-12 rounded-xl bg-background border border-border-product flex items-center justify-center text-foreground hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  {cartQuantity === 1 ? (
                    <Trash2 className="w-5 h-5 text-rose-500" />
                  ) : (
                    <Minus className="w-5 h-5 text-foreground" />
                  )}
                </button>

                <div className="flex flex-col items-center justify-center">
                  <div className="flex items-center gap-1.5 font-extrabold text-base text-foreground select-none">
                    <span className="text-xl text-primary">{cartQuantity}</span>
                    <span className="text-sm font-bold text-foreground">عدد در سبد خرید</span>
                  </div>
                  <button
                    type="button"
                    onClick={openCart}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    مشاهده سبد خرید
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!cartItem) return;
                    if (variantDetails.stock > 0 && cartQuantity >= variantDetails.stock) return;
                    updateQuantity(cartItem.id, cartQuantity + 1);
                  }}
                  disabled={variantDetails.stock > 0 && cartQuantity >= variantDetails.stock}
                  aria-label="افزایش تعداد"
                  title="افزایش تعداد"
                  className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-30 disabled:hover:bg-primary transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full h-13 px-8 rounded-xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-3 hover:bg-primary/90 transition-all active:scale-98 shadow-lg shadow-primary/20 cursor-pointer"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>افزودن به سبد خرید</span>
              </button>
            )}
          </div>

          {/* Trust Signals (Express Shipping, Guarantee, Returns) */}
          <TrustSignals />

          {/* Full Product Description */}
          <ProductDescription description={product.description} />
        </div>
      </div>

      {/* Specifications & Care Accordion Tabs */}
      <ProductTabsAccordion
        specifications={product.specifications}
        careInstructions={product.careInstructions}
        shippingReturns={product.shippingReturns}
      />

      {/* Customer Reviews Section */}
      <ProductReviews rating={product.rating} reviews={product.reviews} />

      {/* Related Products Carousel Section */}
      {relatedProducts.length > 0 && (
        <RelatedProductsSection
          products={relatedProducts}
          onAddToCart={handleCardAddToCart}
        />
      )}

      {/* Mobile Sticky Add to Cart Bottom Bar */}
      <StickyAddToCartBar
        product={product}
        selectedOptions={selectedOptions}
        price={variantDetails.price}
        compareAtPrice={variantDetails.compareAtPrice}
        hasDiscount={variantDetails.hasDiscount}
        isAvailable={variantDetails.isAvailable}
        stock={variantDetails.stock}
        onAddToCart={handleAddToCart}
        onOpenNotifyModal={() => setIsNotifyMeOpen(true)}
        selectedVariantSummary={selectedVariantSummary}
      />

      {/* Size Guide Modal */}
      {product.sizeGuide && (
        <SizeGuideModal
          isOpen={isSizeGuideOpen}
          onClose={() => setIsSizeGuideOpen(false)}
          data={product.sizeGuide}
        />
      )}

      {/* Notify Me Modal */}
      <NotifyMeModal
        isOpen={isNotifyMeOpen}
        onClose={() => setIsNotifyMeOpen(false)}
        productTitle={product.title}
        variantLabel={selectedVariantSummary}
      />

      {/* Add-to-Cart Success Modal */}
      <AddToCartSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        productTitle={product.title}
        productImage={mainImageUrl}
        selectedVariantSummary={selectedVariantSummary}
        quantity={1}
        onOpenCart={openCart}
      />
    </div>
  );
}
