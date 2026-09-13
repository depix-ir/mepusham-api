"use client";

import React, { useState } from "react";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";

export interface ProductDescriptionProps {
  description?: string;
}

export function ProductDescription({ description }: ProductDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!description) return null;

  const isLongText = description.length > 160 || description.split("\n").length > 3;

  return (
    <div className="flex flex-col gap-1.5 py-2 border-t border-border-product/60">
      <div className="flex items-center gap-1.5 text-foreground font-semibold text-xs sm:text-sm">
        <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
        <span>توضیحات محصول</span>
      </div>

      <div className="relative">
        <div
          className={`text-xs text-foreground/80 leading-relaxed transition-all duration-300 ${
            !isExpanded && isLongText ? "line-clamp-3" : ""
          }`}
        >
          {description.split("\n").map((paragraph, index) => (
            <p key={index} className={index > 0 ? "mt-1.5" : ""}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {isLongText && (
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="self-start text-[11px] font-semibold text-primary hover:text-primary/80 flex items-center gap-0.5 cursor-pointer pt-0.5"
        >
          <span>{isExpanded ? "بستن توضیحات" : "مشاهده بیشتر"}</span>
          {isExpanded ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>
      )}
    </div>
  );
}
