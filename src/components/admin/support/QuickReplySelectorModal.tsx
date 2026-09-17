"use client";

import React, { useState } from "react";
import { QuickReply, SupportCategory, supportCategoryLabels } from "@/types/support";
import { Search, Zap, X, Plus, Check } from "lucide-react";

interface QuickReplySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  quickReplies: QuickReply[];
  onSelectQuickReply: (messageText: string) => void;
  onOpenManageModal?: () => void;
}

export function QuickReplySelectorModal({
  isOpen,
  onClose,
  quickReplies,
  onSelectQuickReply,
  onOpenManageModal,
}: QuickReplySelectorModalProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SupportCategory | "all">("all");

  if (!isOpen) return null;

  const filtered = quickReplies.filter((qr) => {
    const matchCat =
      selectedCategory === "all" || !qr.category || qr.category === selectedCategory || qr.category === "other";
    const matchSearch =
      !search.trim() ||
      qr.title.toLowerCase().includes(search.toLowerCase()) ||
      qr.message.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-lg overflow-hidden shadow-xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface-subtle">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">انتخاب پیام آماده (Quick Reply)</h3>
              <p className="text-[11px] text-muted-foreground">
                متن انتخاب شده وارد کادر پاسخ خواهد شد تا قبل از ارسال بررسی و ویرایش کنید
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-3 border-b border-border space-y-2 bg-background">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در عنوان یا متن پیام‌های آماده..."
              className="w-full h-9 bg-surface-subtle border border-border rounded-xl pr-9 pl-3 text-xs text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              همه
            </button>
            {(Object.keys(supportCategoryLabels) as SupportCategory[]).map((catKey) => (
              <button
                key={catKey}
                type="button"
                onClick={() => setSelectedCategory(catKey)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === catKey
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {supportCategoryLabels[catKey]}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Replies List */}
        <div className="p-3 flex-1 overflow-y-auto space-y-2">
          {filtered.length > 0 ? (
            filtered.map((qr) => (
              <div
                key={qr.id}
                onClick={() => {
                  onSelectQuickReply(qr.message);
                  onClose();
                }}
                className="p-3 bg-surface border border-border hover:border-primary rounded-xl transition-all cursor-pointer group space-y-1 shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  <span>{qr.title}</span>
                  {qr.category && (
                    <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-surface-subtle text-muted-foreground border border-border-subtle">
                      {supportCategoryLabels[qr.category] || qr.category}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {qr.message}
                </p>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-muted-foreground">
              پیام آماده‌ای با این مشخصات پیدا نشد.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-surface-subtle flex items-center justify-between">
          {onOpenManageModal && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenManageModal();
              }}
              className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>مدیریت پیام‌های آماده</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-surface border border-border text-xs font-bold text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}
