"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { ProductImage, ProductMediaItem, ProductRating, Product } from "@/types/product";
import { useWishlist } from "@/store/wishlist/wishlist.store";
import { resolveProductMedia } from "@/lib/product/mediaService";
import {
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Camera,
  Star,
  X,
  Maximize2,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";

export interface ProductGalleryProps {
  product?: Product;
  productId?: string;
  images?: ProductImage[];
  title: string;
  selectedVariantId?: string;
  hasDiscount?: boolean;
  discountPercent?: number;
  isOutOfStock?: boolean;
  rating?: ProductRating;
  isLiked?: boolean;
  onToggleWishlist?: () => void;
}

export function ProductGallery({
  product,
  productId: propProductId,
  images: propImages,
  title,
  selectedVariantId,
  isOutOfStock = false,
  isLiked: customIsLiked,
  onToggleWishlist,
}: ProductGalleryProps) {
  const resolvedProductId = product?.id || propProductId || "default-product";
  const wishlist = useWishlist();
  const isLiked =
    customIsLiked !== undefined
      ? customIsLiked
      : wishlist.isLiked(resolvedProductId);

  // Construct synthetic Product if full product object wasn't passed
  const effectiveProduct: Product = useMemo(() => {
    if (product) return product;
    return {
      id: resolvedProductId,
      slug: "product-slug",
      title: title,
      category: { id: "cat", name: "دسته‌بندی", slug: "category" },
      images: propImages || [],
      options: [],
      variants: [],
      pricing: { minPrice: 0, hasDiscount: false },
      inventory: { totalStock: 10, trackStock: true, hasAvailableVariants: true },
      status: "active",
      createdAt: "",
      updatedAt: "",
    };
  }, [product, resolvedProductId, title, propImages]);

  // Resolve all product media items (official + customer) deterministically
  const mediaItems: ProductMediaItem[] = useMemo(() => {
    return resolveProductMedia({
      product: effectiveProduct,
      selectedVariantId,
      includeCustomerMedia: true,
    });
  }, [effectiveProduct, selectedVariantId]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  // Fallback image handling
  const [failedImageIds, setFailedImageIds] = useState<Record<string, boolean>>({});

  // Active Media Item
  const safeIndex = Math.min(Math.max(0, selectedIndex), Math.max(0, mediaItems.length - 1));
  const activeMedia = mediaItems[safeIndex] || {
    id: "fallback-media",
    type: "product" as const,
    url: "/images/placeholders/product-placeholder.webp",
    alt: title,
    productId: resolvedProductId,
    sortOrder: 0,
  };

  // Zoom State
  const [isHovered, setIsHovered] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Ref for focus trap & trigger element restoration
  const triggerRef = useRef<HTMLButtonElement | HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Touch & Drag Swipe State
  const touchStartXRef = useRef<number>(0);
  const touchEndXRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, []);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % mediaItems.length);
  }, [mediaItems.length]);

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  }, [mediaItems.length]);

  // Lock body scroll when fullscreen lightbox is open
  useEffect(() => {
    if (isFullscreen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isFullscreen]);

  // Fullscreen Keyboard Navigation (Escape, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullscreen(false);
      } else if (e.key === "ArrowLeft") {
        // In Persian RTL layout, ArrowLeft moves forward (next item to the left visually)
        handleNext();
      } else if (e.key === "ArrowRight") {
        // ArrowRight moves back
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, handleNext, handlePrev]);

  // Handle pointer move for desktop zoom
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only zoom on mouse/fine pointer devices
    if (e.pointerType === "touch") return;

    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    setZoomPos({ x, y });
  };

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const deltaX = touchEndXRef.current - touchStartXRef.current;
    const swipeThreshold = 40;

    if (Math.abs(deltaX) > swipeThreshold && mediaItems.length > 1) {
      if (deltaX > 0) {
        // Swiped right -> Previous in RTL
        handlePrev();
      } else {
        // Swiped left -> Next in RTL
        handleNext();
      }
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist();
    } else if (resolvedProductId) {
      wishlist.toggle(resolvedProductId);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title,
      text: `مشاهده و خرید ${title}`,
      url: typeof window !== "undefined" ? window.location.href : "",
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // Ignore user cancellation
      }
    } else if (typeof window !== "undefined") {
      await navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2500);
    }
  };

  const openFullscreen = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setIsFullscreen(true);
  };

  const isCurrentFailed = failedImageIds[activeMedia.id];
  const currentImageUrl = isCurrentFailed
    ? "/images/placeholders/product-placeholder.webp"
    : activeMedia.url;

  return (
    <div className="flex flex-col gap-3 w-full max-w-full">
      {/* 1. MAIN SQUARE HERO MEDIA CONTAINER */}
      <div
        ref={triggerRef as React.RefObject<HTMLDivElement>}
        role="button"
        tabIndex={0}
        aria-label={`بزرگ‌نمایی ${activeMedia.alt}`}
        onClick={openFullscreen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            openFullscreen(e);
          }
        }}
        onPointerEnter={(e) => {
          if (e.pointerType !== "touch") setIsHovered(true);
        }}
        onPointerLeave={() => setIsHovered(false)}
        onPointerMove={handlePointerMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full aspect-square bg-surface-subtle rounded-2xl overflow-hidden border border-border-product group select-none cursor-zoom-in touch-pan-y transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        {/* Hero Image with CSS Transform Zoom */}
        <Image
          src={currentImageUrl}
          alt={activeMedia.alt || title}
          fill
          priority={safeIndex === 0}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
          draggable={false}
          onError={() => {
            setFailedImageIds((prev) => ({ ...prev, [activeMedia.id]: true }));
          }}
          style={{
            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
            transform:
              isHovered && !prefersReducedMotion ? "scale(2)" : "scale(1)",
          }}
          className={`object-contain object-center transition-transform ${
            isHovered && !prefersReducedMotion ? "duration-100 ease-out" : "duration-200 ease-in-out"
          } ${isOutOfStock ? "opacity-60 grayscale-[15%]" : ""}`}
        />

        {/* Customer Media Badge Indicator on Main Image */}
        {activeMedia.type === "customer" && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-background/90 text-foreground text-xs font-semibold px-2.5 py-1 rounded-full shadow-xs border border-amber-500/30 backdrop-blur-xs">
            <Camera className="w-3.5 h-3.5 text-amber-500" />
            <span>تصویر مشتری</span>
          </div>
        )}

        {/* Out of Stock Overlay Badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="bg-foreground text-background text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg shadow-md">
              ناموجود
            </span>
          </div>
        )}

        {/* Navigation Arrows on Main Stage (Visible if multiple items) */}
        {mediaItems.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              aria-label="تصویر قبلی"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 hover:bg-background text-foreground flex items-center justify-center shadow-xs backdrop-blur-xs transition-all active:scale-90 opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="تصویر بعدی"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 hover:bg-background text-foreground flex items-center justify-center shadow-xs backdrop-blur-xs transition-all active:scale-90 opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Top Overlay Actions: Wishlist, Fullscreen, Share */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
          {/* Wishlist Button */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label={isLiked ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
            className={`w-9 h-9 rounded-full bg-background/90 hover:bg-background flex items-center justify-center shadow-2xs backdrop-blur-xs transition-all active:scale-90 cursor-pointer ${
              isLiked ? "text-rose-500" : "text-foreground/70 hover:text-foreground"
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500" : ""}`} />
          </button>

          {/* Fullscreen Expand Button */}
          <button
            type="button"
            onClick={openFullscreen}
            aria-label="نمایش تمام‌صفحه"
            className="w-9 h-9 rounded-full bg-background/90 hover:bg-background text-foreground/70 hover:text-foreground flex items-center justify-center shadow-2xs backdrop-blur-xs transition-all active:scale-90 cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            aria-label="اشتراک‌گذاری محصول"
            className="w-9 h-9 rounded-full bg-background/90 hover:bg-background text-foreground/70 hover:text-foreground flex items-center justify-center shadow-2xs backdrop-blur-xs transition-all active:scale-90 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Media Counter Pill */}
        {mediaItems.length > 1 && (
          <div className="absolute bottom-3 left-3 z-10 bg-background/80 text-foreground/80 text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full backdrop-blur-xs border border-border-subtle select-none">
            {safeIndex + 1} / {mediaItems.length}
          </div>
        )}

        {/* Share Toast */}
        {showShareToast && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-foreground text-background text-xs font-semibold px-3 py-1.5 rounded-full shadow-md animate-fade-in">
            لینک محصول کپی شد
          </div>
        )}
      </div>

      {/* 2. CUSTOMER PHOTO SUBTLE METADATA BAR (Shown when customer photo is selected) */}
      {activeMedia.type === "customer" && activeMedia.customerContext && (
        <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-foreground animate-fade-in">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-bold truncate">
                عکس ارسالی توسط {activeMedia.customerContext.authorName}
              </span>
              {activeMedia.customerContext.verifiedPurchase && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  خریدار واقعی
                </span>
              )}
            </div>
          </div>

          <a
            href="#reviews-section"
            className="inline-flex items-center gap-1 text-primary font-bold hover:underline shrink-0 text-[11px]"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>مشاهده نظر</span>
          </a>
        </div>
      )}

      {/* 3. THUMBNAIL STRIP DIRECTLY BELOW MAIN MEDIA */}
      {mediaItems.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto py-1 px-0.5 scrollbar-none touch-pan-x">
          {mediaItems.map((item, idx) => {
            const isSelected = safeIndex === idx;
            const isCustomer = item.type === "customer";
            const isFailed = failedImageIds[item.id];
            const thumbUrl = isFailed
              ? "/images/placeholders/product-placeholder.webp"
              : item.url;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                aria-label={
                  isCustomer
                    ? `عکس ارسالی مشتری ${idx + 1}`
                    : `تصویر محصول ${idx + 1}`
                }
                className={`relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl overflow-hidden border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary ${
                  isSelected
                    ? "border-primary ring-2 ring-primary ring-offset-1 opacity-100 scale-100"
                    : isCustomer
                    ? "border-amber-500/40 opacity-75 hover:opacity-100 hover:border-amber-500"
                    : "border-border-product opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={thumbUrl}
                  alt={item.alt}
                  fill
                  sizes="64px"
                  onError={() => {
                    setFailedImageIds((prev) => ({ ...prev, [item.id]: true }));
                  }}
                  className="object-contain object-center"
                />

                {/* Subtle Visual Indicator Marker for Customer Photos */}
                {isCustomer && (
                  <div className="absolute bottom-1 left-1 w-4 h-4 rounded-full bg-amber-500/90 text-white flex items-center justify-center shadow-2xs backdrop-blur-2xs">
                    <Camera className="w-2.5 h-2.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 4. FULLSCREEN IMMERSIVE LIGHTBOX DIALOG */}
      {isFullscreen && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`گالری تصویر ${title}`}
          onClick={() => setIsFullscreen(false)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
        >
          {/* Lightbox Top Header Actions */}
          <div
            className="flex items-center justify-between w-full max-w-5xl mx-auto z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-white/90">
              <span className="font-bold text-sm sm:text-base truncate max-w-xs sm:max-w-md">
                {title}
              </span>
              <span className="text-xs text-white/60 font-mono">
                ({safeIndex + 1} از {mediaItems.length})
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              aria-label="بستن گالری"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lightbox Center Image Stage (STRICTLY SQUARE) */}
          <div
            className="relative w-full max-w-2xl mx-auto aspect-square my-auto flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black/40 border border-white/10">
              <Image
                src={currentImageUrl}
                alt={activeMedia.alt || title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 800px"
                className="object-contain object-center"
              />

              {/* Customer Photo Badge inside Lightbox */}
              {activeMedia.type === "customer" && (
                <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-amber-500/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md backdrop-blur-xs">
                  <Camera className="w-4 h-4" />
                  <span>عکس مشتری</span>
                  {activeMedia.customerContext?.authorName && (
                    <span className="opacity-90">({activeMedia.customerContext.authorName})</span>
                  )}
                </div>
              )}

              {/* Lightbox Prev / Next Navigation Arrows */}
              {mediaItems.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="تصویر قبلی"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 transition-all active:scale-95 cursor-pointer z-10"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="تصویر بعدی"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 transition-all active:scale-95 cursor-pointer z-10"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Lightbox Bottom Thumbnail Strip */}
          {mediaItems.length > 1 && (
            <div
              className="w-full max-w-3xl mx-auto flex items-center justify-center gap-2.5 overflow-x-auto py-2 px-2 scrollbar-none z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {mediaItems.map((item, idx) => {
                const isSelected = safeIndex === idx;
                const isCustomer = item.type === "customer";
                const isFailed = failedImageIds[item.id];
                const thumbUrl = isFailed
                  ? "/images/placeholders/product-placeholder.webp"
                  : item.url;

                return (
                  <button
                    key={`lb-${item.id}`}
                    type="button"
                    onClick={() => setSelectedIndex(idx)}
                    aria-label={
                      isCustomer
                        ? `انتخاب عکس مشتری ${idx + 1}`
                        : `انتخاب تصویر محصول ${idx + 1}`
                    }
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl overflow-hidden border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-white ${
                      isSelected
                        ? "border-primary ring-2 ring-primary opacity-100 scale-105"
                        : isCustomer
                        ? "border-amber-500/50 opacity-60 hover:opacity-100"
                        : "border-white/20 opacity-50 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={thumbUrl}
                      alt={item.alt}
                      fill
                      sizes="64px"
                      className="object-contain object-center"
                    />
                    {isCustomer && (
                      <div className="absolute bottom-1 left-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-white flex items-center justify-center">
                        <Camera className="w-2 h-2" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
