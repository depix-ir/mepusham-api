"use client";

import React from "react";
import Image from "next/image";
import { ProductRating, ProductReview } from "@/types/product";
import { Star, Check, Camera, Image as ImageIcon } from "lucide-react";

export interface ProductReviewsProps {
  rating?: ProductRating;
  reviews?: ProductReview[];
  onOpenCustomerGallery?: () => void;
}

export function ProductReviews({ rating, reviews = [], onOpenCustomerGallery }: ProductReviewsProps) {
  if (!rating) return null;

  return (
    <div id="reviews-section" className="flex flex-col gap-5 pt-6 border-t border-border-product/60">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-foreground">
          دیدگاه کاربران ({rating.count})
        </h2>
      </div>

      {/* Summary Rating Box - Compact & Clean */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-4 rounded-xl bg-surface-subtle/30 border border-border-product/60">
        {/* Score Column */}
        <div className="flex flex-col items-center justify-center text-center gap-0.5">
          <span className="text-3xl sm:text-4xl font-extrabold text-foreground">
            {rating.average.toFixed(1)}
          </span>
          <div className="flex items-center gap-0.5 text-amber-400 my-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= Math.round(rating.average)
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted/30 fill-muted/20"
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-muted">
            بر اساس {rating.count} نظر
          </span>
        </div>

        {/* Distribution Bars */}
        <div className="md:col-span-2 flex flex-col justify-center gap-1.5">
          {[5, 4, 3, 2, 1].map((starNum) => {
            const starKey = starNum as 1 | 2 | 3 | 4 | 5;
            const count = rating.starDistribution[starKey] || 0;
            const percent = rating.count > 0 ? Math.round((count / rating.count) * 100) : 0;

            return (
              <div key={starNum} className="flex items-center gap-2 text-xs">
                <span className="w-7 shrink-0 font-medium text-foreground flex items-center gap-0.5 text-[11px]">
                  {starNum} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-border-product/60 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-8 text-left shrink-0 text-muted font-mono text-[10px]">{percent}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="flex flex-col gap-3">
        {reviews.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted bg-surface-subtle/30 rounded-lg border border-dashed border-border-product/60">
            هیچ دیدگاهی برای این محصول ثبت نشده است.
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="flex flex-col gap-2 p-3.5 rounded-xl border border-border-product/60 bg-background"
            >
              {/* Review Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm text-foreground">
                    {rev.authorName}
                  </span>
                  {rev.verifiedPurchase && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      <Check className="w-3 h-3" /> خریدار
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-muted font-mono">{rev.date}</span>
              </div>

              {/* Stars & Rating */}
              <div className="flex items-center gap-0.5 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3 h-3 ${
                      s <= rev.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted/30 fill-muted/20"
                    }`}
                  />
                ))}
              </div>

              {/* Review Comment */}
              <p className="text-xs text-foreground/85 leading-relaxed">
                {rev.comment}
              </p>

              {/* Review Attached Images */}
              {rev.images && rev.images.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  {rev.images.map((imgUrl, imgIdx) => (
                    <div
                      key={imgIdx}
                      className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-border shrink-0 bg-surface-muted"
                    >
                      <Image
                        src={imgUrl}
                        alt={`عکس ارسالی توسط ${rev.authorName}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Store Response if present */}
              {rev.storeResponse && (
                <div className="mt-1.5 p-2.5 rounded-lg bg-surface-subtle/50 border-r-2 border-primary text-xs flex flex-col gap-0.5">
                  <div className="flex items-center justify-between font-bold text-primary text-[11px]">
                    <span>{rev.storeResponse.author}</span>
                    <span className="text-[10px] text-muted font-mono">{rev.storeResponse.date}</span>
                  </div>
                  <p className="text-foreground/80 leading-relaxed text-[11px]">
                    {rev.storeResponse.text}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
