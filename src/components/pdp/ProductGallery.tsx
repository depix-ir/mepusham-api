"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { ProductImage, ProductRating } from "@/types/product";
import { useWishlist } from "@/store/wishlist/wishlist.store";
import { reviewService } from "@/lib/product/reviewService";
import {
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Camera,
  Star,
  X,
  MessageSquare,
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
  const [activeTab, setActiveTab] = useState<"product" | "customer">("product");
  const [selectedCustomerPhoto, setSelectedCustomerPhoto] = useState<{
    url: string;
    authorName: string;
    rating: number;
    comment: string;
    date: string;
  } | null>(null);

  // Retrieve customer photos for this product
  const customerPhotos = productId
    ? reviewService.getCustomerImages(productId, title)
    : [];

  // Zoom State
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
    const threshold = 40;

    if (galleryImages.length > 1 && Math.abs(deltaX) > threshold) {
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
    <div className="flex flex-col gap-3 w-full">
      {/* Main Image Stage */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUpOrCancel}
        onPointerCancel={handlePointerUpOrCancel}
        className={`relative w-full aspect-square sm:aspect-[4/5] bg-surface-subtle rounded-xl overflow-hidden border border-border-product shadow-2xs group select-none touch-pan-y ${
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
            <span className="bg-foreground text-background text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-md shadow-md">
              ناموجود
            </span>
          </div>
        )}

        {/* Navigation Arrows for Multiple Images (Compact Subtle Control) */}
        {galleryImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="تصویر قبلی"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 hover:bg-background text-foreground backdrop-blur-xs flex items-center justify-center shadow-xs transition-all active:scale-90 opacity-80 group-hover:opacity-100 cursor-pointer z-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="تصویر بعدی"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 hover:bg-background text-foreground backdrop-blur-xs flex items-center justify-center shadow-xs transition-all active:scale-90 opacity-80 group-hover:opacity-100 cursor-pointer z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Top Floating Actions (Compact Buttons with Small Visual Icons) */}
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">




          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            aria-label="اشتراک‌گذاری محصول"
            className="w-8 h-8 rounded-full bg-background/80 hover:bg-background text-foreground/80 hover:text-foreground flex items-center justify-center shadow-xs backdrop-blur-xs transition-all active:scale-90 cursor-pointer focus-visible:outline-none"
          >
            <Share2 className="w-3 h-3" />
          </button>
        </div>

        {/* Share Toast Notification */}
        {showShareToast && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-foreground text-background text-xs font-medium px-3 py-1.5 rounded-full shadow-md transition-all animate-fade-in">
            لینک محصول کپی شد
          </div>
        )}
      </div>

      {/* Gallery Selector Tabs (Product Photos vs Customer Photos) */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-1.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("product")}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === "product"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "bg-surface-subtle text-muted-foreground hover:text-foreground"
            }`}
          >
            تصاویر محصول ({galleryImages.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("customer")}
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === "customer"
                ? "bg-amber-500 text-white shadow-2xs"
                : "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>ارسالی‌های مشتریان ({customerPhotos.length})</span>
          </button>
        </div>

        <a
          href="#reviews-section"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>مشاهده همه دیدگاه‌ها</span>
        </a>
      </div>

      {/* Thumbnails / Customer Photos Grid Row */}
      {activeTab === "product" ? (
        galleryImages.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto p-0.5 scrollbar-none">
            {galleryImages.map((img, idx) => (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                  selectedIndex === idx
                    ? "border-primary ring-1 ring-primary"
                    : "border-border-product opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.alt || `${title} - تصویر ${idx + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover object-center"
                />
              </button>
            ))}
          </div>
        )
      ) : (
        /* Customer Photos Grid */
        customerPhotos.length > 0 ? (
          <div className="flex items-center gap-2 overflow-x-auto p-0.5 scrollbar-none">
            {customerPhotos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setSelectedCustomerPhoto(photo)}
                className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-lg overflow-hidden border border-amber-500/40 hover:border-amber-500 transition-all cursor-pointer group"
              >
                <Image
                  src={photo.url}
                  alt={`عکس ارسالی توسط ${photo.authorName}`}
                  fill
                  sizes="64px"
                  className="object-cover object-center group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <ZoomIn className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-3 text-center text-xs text-muted-foreground bg-surface-subtle/50 rounded-xl border border-dashed border-border-subtle">
            هنوز عکسی توسط خریداران ارسال نشده است. شما می‌توانید در صفحه سفارش خود اولین عکس را ارسال کنید!
          </div>
        )
      )}

      {/* Customer Photo Modal Lightbox */}
      {selectedCustomerPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedCustomerPhoto(null)}
        >
          <div
            className="relative w-full max-w-lg bg-background rounded-2xl overflow-hidden shadow-2xl border border-border space-y-3 p-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-foreground">
                  عکس ارسالی توسط {selectedCustomerPhoto.authorName}
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                  خریدار واقعی
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomerPhoto(null)}
                className="w-7 h-7 rounded-full bg-surface-subtle hover:bg-surface-muted flex items-center justify-center text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Image */}
            <div className="relative w-full aspect-square bg-surface-subtle rounded-xl overflow-hidden">
              <Image
                src={selectedCustomerPhoto.url}
                alt={selectedCustomerPhoto.comment}
                fill
                className="object-contain"
              />
            </div>

            {/* Rating & Comment */}
            <div className="space-y-1.5 pt-1 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= selectedCustomerPhoto.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted/30 fill-muted/20"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {selectedCustomerPhoto.date}
                </span>
              </div>
              <p className="text-foreground/90 leading-relaxed text-xs">
                &ldquo;{selectedCustomerPhoto.comment}&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
