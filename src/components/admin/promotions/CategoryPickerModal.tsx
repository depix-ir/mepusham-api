"use client";

import React, { useState, useMemo } from "react";
import { catalogRepository } from "@/lib/repositories/catalogRepository";
import { Search, X, Check } from "lucide-react";

interface CategoryPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategoryIds: string[];
  onConfirm: (categoryIds: string[]) => void;
}

export function CategoryPickerModal({
  isOpen,
  onClose,
  selectedCategoryIds,
  onConfirm,
}: CategoryPickerModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedCategoryIds);
  const [prevSelectedCategoryIds, setPrevSelectedCategoryIds] = useState(selectedCategoryIds);
  const [searchQuery, setSearchQuery] = useState("");

  if (isOpen && selectedCategoryIds !== prevSelectedCategoryIds) {
    setPrevSelectedCategoryIds(selectedCategoryIds);
    setSelectedIds(selectedCategoryIds);
  }

  const filteredCategories = useMemo(() => {
    const allCategories = catalogRepository.getCategories();
    if (!searchQuery.trim()) return allCategories;
    const q = searchQuery.toLowerCase().trim();
    return allCategories.filter((c) => c.name.toLowerCase().includes(q));
  }, [searchQuery]);

  const toggleCategory = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    onConfirm(selectedIds);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-background border border-border rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl overflow-hidden dir-rtl">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between shrink-0 bg-surface-subtle">
          <div>
            <h3 className="font-bold text-base text-foreground">
              انتخاب دسته‌بندی‌ها
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedIds.length.toLocaleString("fa-IR")} دسته‌بندی انتخاب شده
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-muted rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-border bg-background shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="جستجو نام دسته‌بندی..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pr-9 pl-3 text-xs md:text-sm bg-surface-subtle border border-border rounded-lg focus:outline-none focus:border-primary text-foreground"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 no-scrollbar">
          {filteredCategories.map((cat) => {
            const isSelected = selectedIds.includes(cat.id);
            return (
              <div
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-border-subtle bg-background"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-border-subtle bg-background"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {cat.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-surface-subtle flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="text-xs text-rose-600 font-medium hover:underline px-2 py-1"
          >
            پاک کردن
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-foreground bg-background border border-border rounded-xl hover:bg-surface-muted transition-colors"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-colors"
            >
              تایید انتخاب
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
