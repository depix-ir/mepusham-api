"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";

import { Banner } from "@/types/product";

interface ProductBannerSliderProps {
  banners: Banner[];
  autoPlayInterval?: number;
  className?: string;
}

export function ProductBannerSlider({
  banners,
  autoPlayInterval = 3500,
  className = "",
}: ProductBannerSliderProps) {
  const list = banners || [];
  if (list.length === 0) return null;

  return (
    <section
      className={`w-full max-w-full h-[100px] md:h-[200px] select-none overflow-hidden p-0 m-0 rounded-none border-none relative ${className}`.trim()}
    >
      <Swiper
        modules={[Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        loop={list.length > 1}
        allowTouchMove={false}
        speed={800}
        autoplay={
          list.length > 1
            ? {
                delay: autoPlayInterval,
                disableOnInteraction: false,
                pauseOnMouseEnter: false,
              }
            : false
        }
        className="w-full h-full rounded-none"
      >
        {list.map((banner, index) => {
          const desktopImage = banner.desktopImageUrl || banner.imageUrl;
          const mobileImage = banner.mobileImageUrl || banner.imageUrl;

          return (
            <SwiperSlide key={banner.id || index} className="w-full h-full">
              <div className="w-full h-full relative rounded-none overflow-hidden">
                <Link
                  href={banner.linkUrl}
                  className="relative block w-full h-full cursor-pointer pointer-events-auto"
                >
                  {/* Desktop Image */}
                  <Image
                    src={desktopImage}
                    alt={banner.title || `بنر ${index + 1}`}
                    fill
                    priority={index === 0}
                    sizes="100vw"
                    className="hidden md:block object-cover object-center"
                    draggable={false}
                  />

                  {/* Mobile Image */}
                  <Image
                    src={mobileImage}
                    alt={banner.title || `بنر ${index + 1}`}
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
      </Swiper>
    </section>
  );
}
