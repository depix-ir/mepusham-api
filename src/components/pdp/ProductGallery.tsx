"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { ProductImage, ProductRating } from "@/types/product";
import { Badge } from "@/components/ui/Badge";
import { formatPercent } from "@/lib/formatting/currency";
import {
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export interface ProductGalleryProps {
  images: ProductImage[];
  title: string;
  hasDiscount?: boolean;
  discountPercent?: number;
  isOutOfStock?: boolean;
  rating?: ProductRating;
}

export function ProductGallery({
  images,
  title,
  hasDiscount = false,
  discountPercent,
  isOutOfStock = false,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [wishlistState, setWishlistState] = useState<"idle" | "active" | "loading">("idle");
  const [showShareToast, setShowShareToast] = useState(false);

  // Drag / Swipe State
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef<number>(0);
  const currentXRef = useRef<number>(0);

  const galleryImages = images.length > 0 ? images : [
    { id: "img-placeholder", url: "/images/placeholders/product-placeholder.webp", alt: title, sortOrder: 0 }
  ];

  const currentImage = galleryImages[selectedIndex] || galleryImages[0];

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Ignore button clicks or multi-touch
    if ((e.target as HTMLElement).closest("button")) return;
    setIsDragging(true);
    startXRef.current = e.clientX;
    currentXRef.current = e.clientX;
    if (e.currentTarget) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    currentXRef.current = e.clientX;
  };

  const handlePointerUpOrCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (e.currentTarget && e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    const deltaX = currentXRef.current - startXRef.current;
    const threshold = 40; // minimum drag distance in px to change slide

    if (galleryImages.length > 1 && Math.abs(deltaX) > threshold) {
      // In RTL (Right-to-Left):
      // Swiping right (deltaX > 0) moves slide to previous
      // Swiping left (deltaX < 0) moves slide to next
      if (deltaX > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }
  };

  const toggleWishlist = () => {
    if (wishlistState === "loading") return;
    setWishlistState("loading");
    setTimeout(() => {
      setWishlistState((prev) => (prev === "active" ? "idle" : "active"));
    }, 250);
  };

  const handleShare = async () => {
    const shareData = {
      title,
      text: `مشاهده و خرید ${title}`,
      url: typeof window !== "undefined" ? window.location.href : "",
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // Fallback copy if user cancels or error
      }
    } else if (typeof window !== "undefined") {
      await navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2500);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Main Image Stage with Drag + Touch Swipe */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUpOrCancel}
        onPointerCancel={handlePointerUpOrCancel}
        className={`relative w-full aspect-square sm:aspect-[4/5] bg-surface-subtle rounded-2xl overflow-hidden border border-border-product shadow-sm group select-none touch-pan-y ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        <Image
          src={currentImage.url}
          alt={currentImage.alt || title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          draggable={false}
          className={`object-cover object-center transition-all duration-300 pointer-events-none ${
            isOutOfStock ? "opacity-60 grayscale-[20%]" : ""
          }`}
        />



        {/* Out of Stock Overlay Badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="bg-foreground text-background text-sm font-bold px-4 py-2 rounded-lg shadow-lg">
              ناموجود
            </span>
          </div>
        )}

        {/* Navigation Arrows for Multiple Images */}
        {galleryImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="تصویر قبلی"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 hover:bg-background text-foreground backdrop-blur-sm flex items-center justify-center shadow-md transition-all active:scale-90 opacity-90 group-hover:opacity-100 cursor-pointer z-10"
            >
              <ChevronLeft className="" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="تصویر بعدی"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 hover:bg-background text-foreground backdrop-blur-sm flex items-center justify-center shadow-md transition-all active:scale-90 opacity-90 group-hover:opacity-100 cursor-pointer z-10"
            >
              <ChevronRight className="" />
            </button>
          </>
        )}

        {/* Top Floating Actions: Wishlist & Share */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
          {/* Wishlist Button */}
          <button
            type="button"
            onClick={toggleWishlist}
            aria-label={wishlistState === "active" ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
            aria-pressed={wishlistState === "active"}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md backdrop-blur-md transition-all active:scale-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              wishlistState === "active"
                ? "bg-red-50 text-red-500 border border-red-200"
                : "bg-background/80 hover:bg-background text-foreground/80 hover:text-foreground"
            }`}
          >
            <Heart
              className={` transition-colors ${
                wishlistState === "active" ? "fill-red-500 stroke-red-500" : ""
              }`}
            />
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            aria-label="اشتراک‌گذاری محصول"
            className="w-10 h-10 rounded-full bg-background/80 hover:bg-background text-foreground/80 hover:text-foreground flex items-center justify-center shadow-md backdrop-blur-md transition-all active:scale-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Share Toast Notification */}
        {showShareToast && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-foreground text-background text-xs font-medium px-4 py-2 rounded-full shadow-lg transition-all animate-fade-in">
            لینک محصول در حافظه کپی شد
          </div>
        )}
      </div>

      {/* Thumbnails Row */}
      {galleryImages.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto p-1 scrollbar-none">
          {galleryImages.map((img, idx) => (
            <button
              key={img.id || idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                selectedIndex === idx
                  ? "border-primary shadow-sm scale-105"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt || `${title} - تصویر ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
