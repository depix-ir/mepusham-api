"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { ProductImage, ProductRating } from "@/types/product";
import { useWishlist } from "@/store/wishlist/wishlist.store";
import {
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

export interface ProductGalleryProps {
  productId?: string;
  images: ProductImage[];
  title: string;
  hasDiscount?: boolean;
  discountPercent?: number;
  isOutOfStock?: boolean;
  rating?: ProductRating;
  isLiked?: boolean;
  onToggleWishlist?: () => void;
}

export function ProductGallery({
  productId,
  images,
  title,
  isOutOfStock = false,
  isLiked: customIsLiked,
  onToggleWishlist,
}: ProductGalleryProps) {
  const wishlist = useWishlist();
  const isLiked = customIsLiked !== undefined ? customIsLiked : (productId ? wishlist.isLiked(productId) : false);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showShareToast, setShowShareToast] = useState(false);

  // Zoom State (Desktop hover & Mobile touch/tap)
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileZoomed, setIsMobileZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

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

  const handleToggleWishlist = () => {
    if (onToggleWishlist) {
      onToggleWishlist();
    } else if (productId) {
      wishlist.toggle(productId);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPos({ x, y });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const rect = e.currentTarget.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((touch.clientY - rect.top) / rect.height) * 100));
      setZoomPos({ x, y });
    }
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
      {/* Main Image Stage with Drag + Touch Swipe & Hover/Touch Zoom */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUpOrCancel}
        onPointerCancel={handlePointerUpOrCancel}
        className={`relative w-full aspect-square sm:aspect-[4/5] bg-surface-subtle rounded-2xl overflow-hidden border border-border-product shadow-sm group select-none touch-pan-y ${
          isDragging ? "cursor-grabbing" : (isHovered || isMobileZoomed) ? "cursor-zoom-out" : "cursor-zoom-in"
        }`}
      >
        <Image
          src={currentImage.url}
          alt={currentImage.alt || title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          draggable={false}
          style={{
            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
            transform: (isHovered || isMobileZoomed) ? "scale(2.25)" : "scale(1)",
          }}
          className={`object-cover object-center transition-transform ${
            (isHovered || isMobileZoomed) ? "duration-100 ease-out" : "duration-300 ease-in-out"
          } pointer-events-none ${isOutOfStock ? "opacity-60 grayscale-[20%]" : ""}`}
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
            onClick={handleToggleWishlist}
            aria-label={isLiked ? "حذف از پسندیده‌ها" : "افزودن به پسندیده‌ها"}
            aria-pressed={isLiked}
            title={isLiked ? "این محصول پسندیده شده است" : "افزودن به پسندیده‌ها"}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md backdrop-blur-md transition-all active:scale-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isLiked
                ? "bg-rose-50 text-rose-600 border border-rose-200"
                : "bg-background/80 hover:bg-background text-foreground/80 hover:text-foreground"
            }`}
          >
            <Heart
              className={`w-5 h-5 transition-transform duration-200 ${
                isLiked ? "fill-rose-600 stroke-rose-600 scale-110" : ""
              }`}
            />
          </button>

          {/* Toggle Mobile Zoom Button */}
          <button
            type="button"
            onClick={() => setIsMobileZoomed((prev) => !prev)}
            aria-label={isMobileZoomed ? "خروج از زوم" : "زوم تصویر"}
            title={isMobileZoomed ? "خروج از زوم" : "زوم تصویر"}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md backdrop-blur-md transition-all active:scale-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isMobileZoomed
                ? "bg-primary text-primary-foreground"
                : "bg-background/80 hover:bg-background text-foreground/80 hover:text-foreground"
            }`}
          >
            {isMobileZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
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
