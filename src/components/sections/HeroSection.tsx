"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Banner } from "@/types/product";
import { ChevronRightIcon, ChevronLeftIcon } from "@/components/icons";

interface HeroSectionProps {
  banners: Banner[];
  autoPlayInterval?: number;
}

export function HeroSection({
  banners,
  autoPlayInterval = 4500,
}: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const dragStartX = useRef(0);
  const currentDragX = useRef(0);
  const isPointerDown = useRef(false);
  const wasDragged = useRef(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const bannerList = banners || [];
  const bannerCount = bannerList.length;

  const nextSlide = useCallback(() => {
    if (bannerCount === 0) return;
    setCurrentIndex((prev) => (prev + 1) % bannerCount);
  }, [bannerCount]);

  const prevSlide = useCallback(() => {
    if (bannerCount === 0) return;
    setCurrentIndex((prev) => (prev - 1 + bannerCount) % bannerCount);
  }, [bannerCount]);

  // Autoplay timer
  useEffect(() => {
    if (isHovered || isDragging || bannerCount <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isHovered, isDragging, bannerCount, autoPlayInterval, nextSlide]);

  // Drag / Touch Handlers
  const handlePointerDown = (clientX: number) => {
    isPointerDown.current = true;
    dragStartX.current = clientX;
    currentDragX.current = clientX;
    wasDragged.current = false;
    setIsDragging(true);
    setDragOffset(0);
  };

  const handlePointerMove = (clientX: number) => {
    if (!isPointerDown.current) return;
    const deltaX = clientX - dragStartX.current;
    currentDragX.current = clientX;

    if (Math.abs(deltaX) > 6) {
      wasDragged.current = true;
    }
    setDragOffset(deltaX);
  };

  const handlePointerEnd = () => {
    if (!isPointerDown.current) return;
    isPointerDown.current = false;

    const deltaX = currentDragX.current - dragStartX.current;
    const threshold = sliderRef.current
      ? Math.min(sliderRef.current.offsetWidth * 0.15, 80)
      : 50;

    // In RTL:
    // Moving left (deltaX < 0) advances to next slide
    // Moving right (deltaX > 0) returns to previous slide
    if (deltaX < -threshold) {
      nextSlide();
    } else if (deltaX > threshold) {
      prevSlide();
    }

    setDragOffset(0);
    setIsDragging(false);

    // Briefly keep wasDragged true so click event is intercepted
    setTimeout(() => {
      wasDragged.current = false;
    }, 120);
  };

  // Prevent link navigation if drag occurred
  const handleSlideClick = (e: React.MouseEvent) => {
    if (wasDragged.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (bannerCount === 0) return null;

  return (
    <section
      className="w-full max-w-full h-[180px] md:h-[400px] select-none overflow-hidden p-0 m-0 rounded-none border-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (isPointerDown.current) handlePointerEnd();
      }}
    >
      <div
        ref={sliderRef}
        className="relative w-full h-full max-w-full rounded-none overflow-hidden bg-surface-subtle group touch-pan-y p-0 border-none"
        onMouseDown={(e) => handlePointerDown(e.clientX)}
        onMouseMove={(e) => handlePointerMove(e.clientX)}
        onMouseUp={handlePointerEnd}
        onTouchStart={(e) => handlePointerDown(e.touches[0].clientX)}
        onTouchMove={(e) => handlePointerMove(e.touches[0].clientX)}
        onTouchEnd={handlePointerEnd}
      >
        {/* Slides Track */}
        <div
          className={`w-full h-full flex ${
            isDragging
              ? "transition-none cursor-grabbing"
              : "transition-transform duration-500 ease-out cursor-grab"
          }`}
          style={{
            transform: `translateX(calc(${currentIndex * 100}% + ${dragOffset}px))`,
          }}
        >
          {bannerList.map((banner, index) => {
            const desktopImage = banner.desktopImageUrl || banner.imageUrl;
            const mobileImage = banner.mobileImageUrl || banner.imageUrl;

            return (
              <div
                key={banner.id || index}
                className="w-full h-full shrink-0 relative rounded-none overflow-hidden"
              >
                {/* Linked Image */}
                <Link
                  href={banner.linkUrl}
                  onClick={handleSlideClick}
                  className="relative block w-full h-full cursor-pointer"
                  draggable={false}
                >
                  {/* Desktop / Tablet Image */}
                  <Image
                    src={desktopImage}
                    alt={banner.title || `اسلاید ${index + 1}`}
                    fill
                    priority={index === 0}
                    sizes="100vw"
                    className="hidden md:block object-cover object-center"
                    draggable={false}
                  />

                  {/* Mobile Image */}
                  <Image
                    src={mobileImage}
                    alt={banner.title || `اسلاید ${index + 1}`}
                    fill
                    priority={index === 0}
                    sizes="100vw"
                    className="block md:hidden object-cover object-center"
                    draggable={false}
                  />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Controls: Next / Prev Arrows */}
        {bannerCount > 1 && (
          <>
            {/* Right Arrow Button (RTL: Previous Slide) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              aria-label="اسلاید قبلی"
              className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/85 hover:bg-background text-foreground shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer backdrop-blur-sm opacity-90 hover:opacity-100"
            >
              <ChevronRightIcon size={24} />
            </button>

            {/* Left Arrow Button (RTL: Next Slide) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              aria-label="اسلاید بعدی"
              className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/85 hover:bg-background text-foreground shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer backdrop-blur-sm opacity-90 hover:opacity-100"
            >
              <ChevronLeftIcon size={24} />
            </button>
          </>
        )}

        {/* Dots Pagination */}
        {bannerCount > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/35 backdrop-blur-md px-3 py-1.5 rounded-full">
            {bannerList.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                aria-label={`رفتن به اسلاید ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === idx
                    ? "w-7 bg-primary"
                    : "w-2.5 bg-white/60 hover:bg-white"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
