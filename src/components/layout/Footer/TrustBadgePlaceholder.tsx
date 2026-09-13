import React from "react";
import Image from "next/image";
import { ShieldIcon } from "@/components/icons";
import { TrustBadge } from "./footer.data";

interface TrustBadgePlaceholderProps {
  badge: TrustBadge;
}

export function TrustBadgePlaceholder({ badge }: TrustBadgePlaceholderProps) {
  if (badge.type === "image" && badge.image) {
    const ImageContent = (
      <div className="relative w-20 h-20 md:w-24 md:h-24 overflow-hidden rounded-md border border-neutral-100 flex items-center justify-center p-2 bg-white">
        <Image
          src={badge.image}
          alt={badge.ariaLabel || badge.title}
          fill
          className="object-contain"
        />
      </div>
    );

    if (badge.href) {
      return (
        <a
          href={badge.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={badge.ariaLabel || badge.title}
          className="hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md transition-opacity inline-block"
        >
          {ImageContent}
        </a>
      );
    }
    return ImageContent;
  }

  // Minimal clean placeholder matching requirements
  return (
    <div
      tabIndex={0}
      role="img"
      aria-label={badge.ariaLabel || badge.title}
      className="w-20 h-24 md:w-24 md:h-28 rounded border border-dashed border-neutral-200 bg-neutral-50/50 flex flex-col items-center justify-center p-2 text-center text-neutral-400 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <ShieldIcon size={22} className="text-neutral-400 mb-1 shrink-0" />
      <span className="text-[11px] leading-tight font-medium text-neutral-500">
        اینماد / مجوز
      </span>
      <span className="text-[9px] text-neutral-400 mt-0.5">
        (جایگاه نماد)
      </span>
    </div>
  );
}
