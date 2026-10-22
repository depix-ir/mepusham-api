"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Order } from "@/types/account";
import { reviewService } from "@/lib/product/reviewService";
import { uploadStoreReviewMediaFile } from "@/lib/media/uploadService";
import { useToast } from "@/components/ui/Toast";
import {
  Star,
  Camera,
  CheckCircle2,
  Send,
  X,
  MessageSquarePlus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface OrderReviewSectionProps {
  order: Order;
}

export function OrderReviewSection({ order }: OrderReviewSectionProps) {
  const { showToast } = useToast();
  const [selectedProductId, setSelectedProductId] = useState<string>(
    order.items[0]?.productId || ""
  );
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // If order is not delivered, do not show review section
  if (order.status !== "delivered") {
    return null;
  }

  const selectedItem = order.items.find((i) => i.productId === selectedProductId) || order.items[0];
  const existingReviewForSelected = selectedProductId
    ? reviewService.getReviewForOrderItem(order.id, selectedProductId)
    : undefined;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 3) {
      showToast("حداکثر می‌توانید ۳ تصویر اضافه کنید.", "error");
      return;
    }

    setIsUploading(true);
    try {
      const newImageUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await uploadStoreReviewMediaFile(file);
        if (result.url) {
          newImageUrls.push(result.url);
        }
      }
      setImages((prev) => [...prev, ...newImageUrls]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "خطا در بارگذاری تصویر.";
      showToast(errorMessage, "error");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;
    if (!comment.trim()) {
      showToast("لطفاً نظر خود را بنویسید.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      reviewService.submitReview({
        orderId: order.id,
        productId: selectedProductId,
        authorName: order.shippingAddress.recipientName || "خریدار مپوشــــم",
        rating,
        comment,
        images,
      });

      showToast("دیدگاه شما با موفقیت ثبت شد و در صفحه محصول قرار گرفت.", "success");
      setComment("");
      setImages([]);
      setRating(5);
    } catch {
      showToast("خطا در ثبت نظر.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const allItemsReviewed = order.items.every(
    (item) => !!reviewService.getReviewForOrderItem(order.id, item.productId)
  );

  return (
    <div className="bg-gradient-to-br from-amber-500/5 via-background to-primary/5 border border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
      {/* Header Bar */}
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <MessageSquarePlus className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
              <span>ثبت نظر و امتیاز تجربه خرید</span>
              {allItemsReviewed && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  تکمیل شد
                </span>
              )}
            </h2>
            <p className="text-[11px] text-muted-foreground">
              نظر شما به خریداران دیگر کمک می‌کند. نظرات و عکس‌های شما در صفحه محصول نمایش داده می‌شوند.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="text-muted-foreground hover:text-foreground p-1"
          aria-label={isExpanded ? "بستن" : "باز کردن"}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="pt-2 border-t border-border-subtle/80 space-y-4">
          {/* Select Product Tabs if order has multiple items */}
          {order.items.length > 1 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground block">
                انتخاب کالا برای ثبت نظر:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {order.items.map((item) => {
                  const hasRev = !!reviewService.getReviewForOrderItem(order.id, item.productId);
                  const isSelected = item.productId === selectedProductId;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedProductId(item.productId);
                        const existing = reviewService.getReviewForOrderItem(order.id, item.productId);
                        if (existing) {
                          setRating(existing.rating);
                          setComment(existing.comment);
                          setImages(existing.images || []);
                        } else {
                          setRating(5);
                          setComment("");
                          setImages([]);
                        }
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold shrink-0 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                          : "bg-surface-subtle text-foreground border-border-subtle hover:border-primary/50"
                      }`}
                    >
                      <div className="relative w-4 h-4 rounded overflow-hidden shrink-0 bg-surface-muted">
                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                      </div>
                      <span className="max-w-[120px] truncate">{item.title}</span>
                      {hasRev && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* If selected item already reviewed */}
          {existingReviewForSelected ? (
            <div className="bg-background/80 border border-emerald-500/30 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-emerald-700 font-bold">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>دیدگاه شما برای این کالا ثبت شده است</span>
                </div>
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= existingReviewForSelected.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted/30 fill-muted/20"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-foreground/90 text-xs leading-relaxed">
                {existingReviewForSelected.comment}
              </p>

              {existingReviewForSelected.images && existingReviewForSelected.images.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  {existingReviewForSelected.images.map((img, idx) => (
                    <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-border">
                      <Image src={img} alt="عکس ثبت شده" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setComment(existingReviewForSelected.comment);
                  setRating(existingReviewForSelected.rating);
                  setImages(existingReviewForSelected.images || []);
                }}
                className="text-[11px] font-bold text-primary hover:underline block pt-1"
              >
                ویرایش یا به‌روزرسانی نظر
              </button>
            </div>
          ) : (
            /* Review Submission Form */
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Product Info Indicator */}
              {selectedItem && (
                <div className="flex items-center gap-2 text-xs text-foreground font-bold bg-background p-2.5 rounded-xl border border-border-subtle">
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-surface-muted">
                    <Image src={selectedItem.image} alt={selectedItem.title} fill className="object-cover" />
                  </div>
                  <span className="truncate">{selectedItem.title}</span>
                </div>
              )}

              {/* Star Rating Select */}
              <div className="flex items-center justify-between bg-background p-3 rounded-xl border border-border-subtle">
                <span className="text-xs font-bold text-foreground">امتیاز شما به این محصول:</span>
                <div className="flex items-center gap-1 dir-ltr">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= (hoverRating || rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted/30 fill-muted/20"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea comment */}
              <div>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="نظرتان درباره جنس، کیفیت، سایز و ارزش خرید محصول را بنویسید..."
                  className="w-full text-xs p-3 rounded-xl bg-background border border-border-subtle focus:border-primary focus:outline-none transition-colors resize-none text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Image Upload Area */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Image Previews */}
                {images.map((imgUrl, idx) => (
                  <div key={idx} className="relative w-14 h-14 rounded-xl overflow-hidden border border-border shrink-0 group">
                    <Image src={imgUrl} alt="تصویر نظر" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center cursor-pointer shadow-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Upload Button */}
                {images.length < 3 && (
                  <label className="w-14 h-14 rounded-xl border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 transition-colors flex flex-col items-center justify-center text-primary cursor-pointer shrink-0">
                    <Camera className="w-4 h-4" />
                    <span className="text-[9px] font-bold mt-0.5">افزودن عکس</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                )}

                <span className="text-[10px] text-muted-foreground mr-auto">
                  {images.length}/3 عکس خریدار
                </span>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading || !comment.trim()}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5 rtl:rotate-180" />
                  <span>{isSubmitting ? "در حال ثبت..." : "ثبت و انتشار نظر"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
