import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Banner } from "@/types/product";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

interface HeroSectionProps {
  banner: Banner;
}

export function HeroSection({ banner }: HeroSectionProps) {
  return (
    <section className="w-full my-4 md:my-6">
      <Container>
        <div className="relative w-full rounded-lg md:rounded-xl overflow-hidden bg-surface-subtle min-h-[220px] sm:min-h-[300px] md:min-h-[400px] flex items-center">
          <Image
            src={banner.imageUrl}
            alt={banner.title}
            fill
            priority
            sizes="(max-width: 1440px) 100vw, 1440px"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex items-center">
            <div className="p-6 md:p-12 max-w-lg text-white flex flex-col gap-2 md:gap-4">
              <h1 className="text-xl sm:text-2xl md:text-4xl font-black leading-tight">
                {banner.title}
              </h1>
              {banner.subtitle && (
                <p className="text-xs sm:text-sm md:text-base text-white/90">
                  {banner.subtitle}
                </p>
              )}
              {banner.buttonText && (
                <div className="pt-2">
                  <Link href={banner.linkUrl}>
                    <Button variant="primary" size="md" className="rounded-full shadow-md">
                      {banner.buttonText}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
