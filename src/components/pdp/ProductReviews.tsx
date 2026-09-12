"use client";

import React from "react";
import { ProductRating, ProductReview } from "@/types/product";
import { Star, Check } from "lucide-react";

export interface ProductReviewsProps {
  rating?: ProductRating;
  reviews?: ProductReview[];
}

export function ProductReviews({ rating, reviews = [] }: ProductReviewsProps) {
  if (!rating) return null;

  return (
    <div id="reviews-section" className="flex flex-col gap-6 pt-6 border-t border-border-product">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-xl font-bold text-foreground">
          دیدگاه و امتیاز کاربران ({rating.count})
        </h2>
      </div>

      {/* Summary Rating Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 rounded-2xl bg-surface-subtle border border-border-product">
        {/* Score Column */}
        <div className="flex flex-col items-center justify-center text-center gap-1">
          <span className="text-4xl sm:text-5xl font-black text-foreground">
            {rating.average.toFixed(1)}
          </span>
          <div className="flex items-center gap-1 text-amber-400 my-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(rating.average)
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted/30 fill-muted/20"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-muted">
            بر اساس {rating.count} نظر ثبت‌شده
          </span>
        </div>

        {/* Distribution Bars */}
        <div className="md:col-span-2 flex flex-col justify-center gap-2">
          {[5, 4, 3, 2, 1].map((starNum) => {
            const starKey = starNum as 1 | 2 | 3 | 4 | 5;
            const count = rating.starDistribution[starKey] || 0;
            const percent = rating.count > 0 ? Math.round((count / rating.count) * 100) : 0;

            return (
              <div key={starNum} className="flex items-center gap-2 text-xs">
                <span className="w-8 shrink-0 font-medium text-foreground flex items-center gap-1">
                  {starNum} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1 h-2 rounded-full bg-border-product/60 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-10 text-left shrink-0 text-muted font-mono">{percent}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="flex flex-col gap-4">
        {reviews.length === 0 ? (
          <div className="p-8 text-center text-xs sm:text-sm text-muted bg-surface-subtle/50 rounded-xl border border-dashed border-border-product">
            هیچ دیدگاهی ثبت نشده است.
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="flex flex-col gap-3 p-4 rounded-2xl border border-border-product bg-background shadow-xs"
            >
              {/* Review Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm text-foreground">
                    {rev.authorName}
                  </span>
                  {rev.verifiedPurchase && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <Check className="w-3 h-3" /> خریدار بااصالت
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-muted font-mono">{rev.date}</span>
              </div>

              {/* Stars & Rating */}
              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= rev.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted/30 fill-muted/20"
                    }`}
                  />
                ))}
              </div>

              {/* Review Comment */}
              <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed">
                {rev.comment}
              </p>

              {/* Store Response if present */}
              {rev.storeResponse && (
                <div className="mt-2 p-3 rounded-xl bg-surface-subtle border-r-4 border-primary text-xs flex flex-col gap-1">
                  <div className="flex items-center justify-between font-bold text-primary">
                    <span>{rev.storeResponse.author}</span>
                    <span className="text-[10px] text-muted font-mono">{rev.storeResponse.date}</span>
                  </div>
                  <p className="text-foreground/80 leading-relaxed">
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
