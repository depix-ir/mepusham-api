"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Banner } from "@/types/product";
import { ChevronRightIcon, ChevronLeftIcon } from "@/components/icons";

interface HeroSectionProps {
  banners: Banner[];
  autoPlayInterval?: number;
  id?: string;
}

export function HeroSection({
  banners,
  autoPlayInterval = 4500,
  id = "main",
}: HeroSectionProps) {
  const bannerList = banners || [];
  const bannerCount = bannerList.length;

  if (bannerCount === 0) return null;

  const prevClass = `hero-swiper-button-prev-${id}`;
  const nextClass = `hero-swiper-button-next-${id}`;
  const paginationClass = `hero-swiper-pagination-${id}`;

  return (
    <section className="w-full max-w-full h-[180px] md:h-[400px] select-none overflow-hidden p-0 m-0 rounded-none border-none relative group">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        loop={bannerCount > 1}
        autoplay={
          bannerCount > 1
            ? {
                delay: autoPlayInterval,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false
        }
        pagination={{
          clickable: true,
          el: `.${paginationClass}`,
        }}
        navigation={{
          prevEl: `.${prevClass}`,
          nextEl: `.${nextClass}`,
        }}
        className="w-full h-full rounded-none"
      >
        {bannerList.map((banner, index) => {
          const desktopImage = banner.desktopImageUrl || banner.imageUrl;
          const mobileImage = banner.mobileImageUrl || banner.imageUrl;

          return (
            <SwiperSlide key={banner.id || index} className="w-full h-full">
              <div className="w-full h-full relative rounded-none overflow-hidden">
                <Link
                  href={banner.linkUrl}
                  className="relative block w-full h-full cursor-pointer"
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
            </SwiperSlide>
          );
        })}

        {/* Navigation Buttons */}
        {bannerCount > 1 && (
          <>
            <button
              type="button"
              aria-label="اسلاید قبلی"
              className={`${prevClass} hidden absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/85 hover:bg-background text-foreground shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer backdrop-blur-sm opacity-90 hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              <ChevronRightIcon size={24} />
            </button>

            <button
              type="button"
              aria-label="اسلاید بعدی"
              className={`${nextClass} hidden absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/85 hover:bg-background text-foreground shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer backdrop-blur-sm opacity-90 hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              <ChevronLeftIcon size={24} />
            </button>
          </>
        )}

        {/* Pagination Dots */}
        {bannerCount > 1 && (
          <div className="absolute bottom-3 md:bottom-4 inset-x-0 z-20 flex justify-center items-center pointer-events-none">
            <div className={`${paginationClass} pointer-events-auto flex items-center justify-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full !w-auto !relative !inset-auto !transform-none [&_.swiper-pagination-bullet]:w-2.5 [&_.swiper-pagination-bullet]:h-2.5 [&_.swiper-pagination-bullet]:rounded-full [&_.swiper-pagination-bullet]:bg-white/60 [&_.swiper-pagination-bullet]:opacity-100 [&_.swiper-pagination-bullet]:transition-all [&_.swiper-pagination-bullet]:duration-300 [&_.swiper-pagination-bullet]:cursor-pointer [&_.swiper-pagination-bullet-active]:!w-7 [&_.swiper-pagination-bullet-active]:!bg-primary [&_.swiper-pagination-bullet-active]:!rounded-full`} />
          </div>
        )}
      </Swiper>
    </section>
  );
}
