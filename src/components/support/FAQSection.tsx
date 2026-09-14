"use client";

import React, { useState, useMemo } from "react";
import { faqCategories, faqList, FAQItem } from "@/data/supportData";
import { Search, ChevronDown, HelpCircle, Sparkles } from "lucide-react";

export function FAQSection() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqId, setOpenFaqId] = useState<string | null>("faq-1");

  const filteredFaqs = useMemo(() => {
    return faqList.filter((item) => {
      const matchesCategory =
        activeCategory === "all" || item.category === activeCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-3 h-3 text-primary" />
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            پرسش‌های متداول
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          پاسخ سریع به رایج‌ترین سوالات شما درباره ثبت سفارش، نحوه پرداخت و خدمات پس از فروش
        </p>
      </div>

      {/* Search Input & Category Pills Bar */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در سوالات متداول..."
            className="w-full h-11 pr-10 pl-4 bg-surface border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              پاک‌کردن
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {faqCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                    : "bg-surface border border-border text-muted-foreground hover:text-foreground hover:bg-surface-subtle"
                }`}
              >
                {cat.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((item) => {
            const isOpen = openFaqId === item.id;
            return (
              <div
                key={item.id}
                className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "border-primary/40 bg-surface shadow-2xs"
                    : "border-border bg-surface hover:border-border/80"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(item.id)}
                  className="w-full p-4 text-right flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <span className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    {item.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? "bg-primary/10 text-primary rotate-180"
                        : "bg-surface-subtle text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-muted-foreground border-t border-border/40 leading-relaxed animate-in fade-in duration-200">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-8 border border-dashed border-border rounded-2xl text-center space-y-2 bg-surface-subtle/30">
            <p className="text-xs font-bold text-foreground">
              سؤالی مطابق با عبارت جستجوشده یافت نشد.
            </p>
            <p className="text-[11px] text-muted-foreground">
              می‌توانید عبارات دیگری را جستجو کنید یا مستقیم با پشتیبانی پیام دهید.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
