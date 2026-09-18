"use client";

import React, { useState } from "react";
import { Product } from "@/types/product";
import { getVariantDetails } from "@/lib/product/domain";
import { sizeGuideService } from "@/lib/sizeguide/sizeGuideService";
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
import { TomanIcon } from "@/components/icons";

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
    if (!product || !product.id) return;
    if (product.options.length > 0 && !variantDetails.allOptionsSelected) return;
    if (!variantDetails.isAvailable) return;

    const added = addItem(product, 1, selectedOptions);

    if (added) {
      if (customOnAddToCart) {
        customOnAddToCart(product, 1, selectedOptions);
      }
      setIsSuccessModalOpen(true);
    }
  };

  const handleCardAddToCart = (prod: Product) => {
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

  const selectedVariantSummary = product.options
    .map((opt) => {
      const val = opt.values.find((v) => v.id === selectedOptions[opt.id]);
      return val ? `${opt.name}: ${val.label}` : null;
    })
    .filter(Boolean)
    .join(" | ");

  const mainImageUrl = product.images.length > 0 ? product.images[0].url : undefined;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-12 flex flex-col gap-10">
      {/* Primary PDP Layout: Gallery (Col 1-6/7) + Purchase Information Column (Col 7-12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Gallery Column */}
        <div className="lg:col-span-7 xl:col-span-6 w-full">
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

        {/* Product Identity & Purchase Column with Max Width Constraint */}
        <div className="lg:col-span-5 xl:col-span-6 flex flex-col gap-4 max-w-xl">
          {/* Identity: Breadcrumb, Brand, Title, Rating, Wishlist */}
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

          {/* Clean Price Block */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex items-center gap-1.5 text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              <span>{formatPrice(variantDetails.price)}</span>
              <TomanIcon size={20} className="text-muted shrink-0" />
            </div>
            {variantDetails.hasDiscount && variantDetails.compareAtPrice && (
              <span className="text-xs sm:text-sm text-muted line-through font-medium">
                {formatPrice(variantDetails.compareAtPrice)}
              </span>
            )}
            {variantDetails.hasDiscount && variantDetails.discountPercent && (
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                ٪{variantDetails.discountPercent} تخفیف
              </span>
            )}
          </div>

          {/* Variants Selector */}
          <VariantSelector
            product={product}
            selectedOptions={selectedOptions}
            onSelectOption={handleSelectOption}
            sizeGuide={product.sizeGuide}
            onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
          />

          {/* Inventory Status */}
          <div className="flex items-center gap-2 text-xs font-medium">
            {variantDetails.isAvailable ? (
              <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50/60 px-2.5 py-1 rounded-md border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {variantDetails.stock <= 5 ? (
                  <span className="font-semibold">تنها {variantDetails.stock} عدد در انبار باقی مانده</span>
                ) : (
                  <span>موجود در انبار</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-rose-700 bg-rose-50/60 px-2.5 py-1 rounded-md border border-rose-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span className="font-semibold">این تنوع در حال حاضر ناموجود است</span>
              </div>
            )}
          </div>

          {/* Desktop Quantity & Primary Add to Cart Action */}
          <div className="hidden md:flex items-center gap-3 pt-1">
            {!variantDetails.isAvailable ? (
              <button
                type="button"
                onClick={() => setIsNotifyMeOpen(true)}
                className="w-full h-11 px-5 rounded-lg bg-amber-500 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-600 transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span>موجود شد به من اطلاع بده</span>
              </button>
            ) : cartQuantity > 0 ? (
              <div className=" flex items-center justify-between gap-3 p-1.5  border border-primary/30 rounded-lg transition-all">
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
                  className="w-9 h-9 rounded-md bg-background border border-border-product flex items-center justify-center text-foreground hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
                >
                  {cartQuantity === 1 ? (
                    <Trash2 className="w-4 h-4 text-rose-500" />
                  ) : (
                    <Minus className="w-4 h-4 text-foreground" />
                  )}
                </button>

                <div className="flex items-center gap-2 select-none">
                  <span className="text-base font-bold text-primary">{cartQuantity}</span>
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
                  className="w-9 h-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-30 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full h-11 px-6 rounded-lg bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>افزودن به سبد خرید</span>
              </button>
            )}
          </div>

          {/* Compact Trust Signals */}
          <TrustSignals />

          {/* Concise Product Description */}
          <ProductDescription description={product.description} />
        </div>
      </div>

      {/* Specifications & Care Accordion */}
      <div className="max-w-4xl mx-auto w-full">
        <ProductTabsAccordion
          specifications={product.specifications}
          careInstructions={product.careInstructions}
          shippingReturns={product.shippingReturns}
        />
      </div>

      {/* Customer Reviews Section */}
      <div className="max-w-4xl mx-auto w-full">
        <ProductReviews rating={product.rating} reviews={product.reviews} />
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="max-w-7xl mx-auto w-full">
          <RelatedProductsSection
            products={relatedProducts}
            onAddToCart={handleCardAddToCart}
          />
        </div>
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
      {(product.sizeGuide || sizeGuideService.getSizeGuideForProduct(product.id)) && (
        <SizeGuideModal
          isOpen={isSizeGuideOpen}
          onClose={() => setIsSizeGuideOpen(false)}
          data={product.sizeGuide || sizeGuideService.getSizeGuideForProduct(product.id)!}
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
