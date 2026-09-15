"use client";

import React from "react";

export interface ProductCardSkeletonProps {
  className?: string;
  variant?: "default" | "compact" | "horizontal";
}

export function ProductCardSkeleton({
  className = "",
  variant = "default",
}: ProductCardSkeletonProps) {
  if (variant === "horizontal") {
    return (
      <div
        aria-hidden="true"
        className={`flex flex-row bg-background border border-border-product rounded-lg overflow-hidden h-full ${className}`.trim()}
      >
        {/* Media Container */}
        <div className="relative w-28 sm:w-36 aspect-square bg-surface-subtle overflow-hidden shrink-0 animate-pulse" />

        {/* Content Container */}
        <div className="flex flex-col flex-1 p-3 justify-between gap-2 bg-background">
          <div className="flex flex-col gap-1.5">
            <div className="h-2.5 bg-surface-muted rounded w-1/3 animate-pulse" />
            <div className="h-3.5 bg-surface-muted rounded w-full animate-pulse" />
            <div className="h-3.5 bg-surface-muted rounded w-2/3 animate-pulse" />
          </div>

          <div className="flex items-end justify-between gap-2 pt-2 border-t border-border-product/60 mt-auto">
            <div className="flex flex-col gap-1">
              <div className="h-2.5 bg-surface-muted rounded w-10 animate-pulse" />
              <div className="h-4 bg-surface-muted rounded w-16 animate-pulse" />
            </div>
            <div className="w-8 h-8 rounded-full bg-surface-muted animate-pulse shrink-0" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`relative flex flex-col bg-background border border-border-product rounded-lg overflow-hidden h-full ${className}`.trim()}
    >
      {/* Media / Image Container (aspect-square mirroring ProductCard) */}
      <div className="relative block w-full aspect-square bg-surface-subtle overflow-hidden animate-pulse">
        {/* Wishlist Heart Icon Placeholder */}
        <div className="absolute top-2 left-2 z-10 w-7 h-7 rounded-full bg-surface-muted/80 backdrop-blur-xs" />
        {/* Discount Badge Placeholder */}
        <div className="absolute top-2 right-2 z-10 w-10 h-5 rounded-full bg-surface-muted/80" />
      </div>

      {/* Content Container (p-3.5 mirroring ProductCard) */}
      <div className="flex flex-col flex-1 p-3.5 justify-between gap-3 bg-background">
        {/* Brand & Title */}
        <div className="flex flex-col gap-1.5">
          {/* Brand Name line */}
          <div className="h-3 bg-surface-muted rounded-xs w-1/3 animate-pulse" />
          {/* Title lines */}
          <div className="h-4 bg-surface-muted rounded-xs w-full animate-pulse mt-0.5" />
          <div className="h-4 bg-surface-muted rounded-xs w-2/3 animate-pulse" />
        </div>

        {/* Pricing & Cart Action */}
        <div className="flex items-end justify-between gap-2 pt-2 border-t border-border-product/60 mt-auto">
          {/* Price Block */}
          <div className="flex flex-col gap-1">
            <div className="h-2.5 bg-surface-muted rounded-xs w-10 animate-pulse" />
            <div className="h-4 sm:h-5 bg-surface-muted rounded-xs w-20 animate-pulse" />
          </div>

          {/* Cart Button */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-surface-muted animate-pulse shrink-0" />
        </div>
      </div>
    </div>
  );
}
