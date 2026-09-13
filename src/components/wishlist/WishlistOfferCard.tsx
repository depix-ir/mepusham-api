"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export interface WishlistOfferConfig {
  title: string;
  description: string;
  type: string;
  enabled: boolean;
}

export const defaultWishlistOffer: WishlistOfferConfig = {
  title: "سبد پسندیده‌هات رو یکجا بخر",
  description: "با خرید یکجای محصولات موجود، از ارسال رایگان بهره‌مند شوید.",
  type: "free-shipping",
  enabled: true,
};

export function WishlistOfferCard({ offer = defaultWishlistOffer }: { offer?: WishlistOfferConfig }) {
  if (!offer || !offer.enabled) return null;

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5 flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles size={18} />
      </div>
      <div className="flex flex-col gap-0.5">
        <h4 className="text-xs sm:text-sm font-bold text-primary">{offer.title}</h4>
        <p className="text-[11px] sm:text-xs text-muted leading-relaxed">{offer.description}</p>
      </div>
    </div>
  );
}
