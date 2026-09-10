"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Banner } from "@/types/product";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
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
      className="w-full my-3 md:my-6 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (isPointerDown.current) handlePointerEnd();
      }}
    >
      <Container>
        <div
          ref={sliderRef}
          className="relative w-full rounded-2xl overflow-hidden bg-surface-subtle shadow-md group touch-pan-y"
          onMouseDown={(e) => handlePointerDown(e.clientX)}
          onMouseMove={(e) => handlePointerMove(e.clientX)}
          onMouseUp={handlePointerEnd}
          onTouchStart={(e) => handlePointerDown(e.touches[0].clientX)}
          onTouchMove={(e) => handlePointerMove(e.touches[0].clientX)}
          onTouchEnd={handlePointerEnd}
        >
          {/* Slides Track */}
          <div
            className={`flex ${
              isDragging ? "transition-none cursor-grabbing" : "transition-transform duration-500 ease-out cursor-grab"
            }`}
            style={{
              transform: `translateX(calc(${currentIndex * 100}% + ${dragOffset}px))`,
            }}
          >
            {bannerList.map((banner, index) => (
              <div
                key={banner.id || index}
                className="w-full shrink-0 relative min-h-[240px] sm:min-h-[340px] md:min-h-[440px] flex items-center overflow-hidden"
              >
                {/* Background Banner Link */}
                <Link
                  href={banner.linkUrl}
                  onClick={handleSlideClick}
                  className="absolute inset-0 z-0 block w-full h-full cursor-pointer"
                  draggable={false}
                >
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 1440px) 100vw, 1440px"
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-102"
                    draggable={false}
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
                </Link>

                {/* Banner Text Overlay Content */}
                <div className="relative z-10 p-6 sm:p-10 md:p-16 max-w-xl text-white flex flex-col gap-2 md:gap-4 pointer-events-none">
                  <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight drop-shadow-sm">
                    {banner.title}
                  </h1>
                  {banner.subtitle && (
                    <p className="text-xs sm:text-base md:text-lg text-white/90 drop-shadow-sm">
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.buttonText && (
                    <div className="pt-2 pointer-events-auto">
                      <Link
                        href={banner.linkUrl}
                        onClick={handleSlideClick}
                        className="inline-block"
                      >
                        <Button
                          variant="primary"
                          size="md"
                          className="rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform"
                        >
                          {banner.buttonText}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
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
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/85 hover:bg-background text-foreground shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer backdrop-blur-sm opacity-90 hover:opacity-100"
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
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/85 hover:bg-background text-foreground shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer backdrop-blur-sm opacity-90 hover:opacity-100"
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
      </Container>
    </section>
  );
}
