"use client";

import React, { useState } from "react";
import { Campaign } from "@/types/promotion";
import { getCampaigns } from "@/lib/promotions/promotionService";
import { X, Check, Calendar, Tag } from "lucide-react";
import { formatPrice } from "@/lib/formatting/currency";

interface CampaignPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCampaignId?: string;
  onConfirm: (campaignId: string) => void;
}

export function CampaignPickerModal({
  isOpen,
  onClose,
  selectedCampaignId,
  onConfirm,
}: CampaignPickerModalProps) {
  const [selectedId, setSelectedId] = useState<string | undefined>(
    selectedCampaignId
  );
  const campaigns = getCampaigns();

  React.useEffect(() => {
    if (isOpen) {
      setSelectedId(selectedCampaignId);
    }
  }, [isOpen, selectedCampaignId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-background border border-border rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl overflow-hidden dir-rtl">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between shrink-0 bg-surface-subtle">
          <h3 className="font-bold text-base text-foreground">انتخاب کمپین</h3>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Campaign List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 no-scrollbar">
          {campaigns.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              هیچ کمپینی ثبت نشده است.
            </div>
          ) : (
            campaigns.map((camp) => {
              const isSelected = selectedId === camp.id;
              return (
                <div
                  key={camp.id}
                  onClick={() => setSelectedId(camp.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-2xs"
                      : "border-border hover:border-border-subtle bg-background"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-border-subtle"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="font-bold text-sm text-foreground">
                        {camp.title}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {camp.productIds.length.toLocaleString("fa-IR")} محصول
                    </span>
                  </div>

                  {camp.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {camp.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                    {camp.minPurchaseAmount && (
                      <span>
                        حداقل خرید: {formatPrice(camp.minPurchaseAmount)} تومان
                      </span>
                    )}
                    <span>
                      استفاده: {camp.usedCount.toLocaleString("fa-IR")}{" "}
                      {camp.usageLimit ? `/ ${camp.usageLimit.toLocaleString("fa-IR")}` : ""}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-surface-subtle flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-foreground bg-background border border-border rounded-xl hover:bg-surface-muted transition-colors"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={() => {
              if (selectedId) onConfirm(selectedId);
              onClose();
            }}
            disabled={!selectedId}
            className="px-5 py-2 text-xs font-bold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            تایید
          </button>
        </div>
      </div>
    </div>
  );
}
