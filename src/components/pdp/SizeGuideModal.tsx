"use client";

import React from "react";
import { SizeGuideData } from "@/types/product";
import { X } from "lucide-react";

export interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: SizeGuideData;
}

export function SizeGuideModal({ isOpen, onClose, data }: SizeGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-background border border-border-product rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col p-5 sm:p-6 relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border-product">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              {data.title}
            </h2>
            {data.description && (
              <p className="text-xs text-muted mt-1 leading-relaxed">
                {data.description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="w-8 h-8 rounded-full bg-surface-subtle hover:bg-border-product text-foreground flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Size Chart Table */}
        <div className="py-4 overflow-x-auto">
          <table className="w-full text-xs sm:text-sm text-right border-collapse">
            <thead>
              <tr className="bg-surface-subtle text-foreground font-semibold border-b border-border-product">
                {data.columns.map((col) => (
                  <th key={col.key} className="py-2.5 px-3">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-product/60">
              {data.rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-surface-subtle/50 transition-colors">
                  {data.columns.map((col) => (
                    <td key={col.key} className="py-2.5 px-3 font-medium text-foreground">
                      {row[col.key] || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tip / Footer */}
        <div className="pt-3 border-t border-border-product bg-surface-subtle/50 rounded-xl p-3 text-xs text-muted leading-relaxed">
          💡 <span className="font-semibold text-foreground">نکته:</span> اگر بین دو سایز تردید دارید، پیشنهاد می‌کنیم برای راحتی بیشتر سایز بزرگ‌تر را انتخاب کنید.
        </div>
      </div>
    </div>
  );
}
