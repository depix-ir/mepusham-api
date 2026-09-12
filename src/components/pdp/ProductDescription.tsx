"use client";

import React, { useState } from "react";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";

export interface ProductDescriptionProps {
  description?: string;
}

export function ProductDescription({ description }: ProductDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!description) return null;

  // Estimate if description might exceed 4 lines (~160 chars or contains multiple newlines)
  const isLongText = description.length > 180 || description.split("\n").length > 3;

  return (
    <div className="flex flex-col gap-2.5 p-4 bg-surface-subtle/30 rounded-2xl border border-border-product/60 my-1">
      <div className="flex items-center gap-2 text-foreground font-bold text-sm sm:text-base">
        <FileText className="w-4 h-4 text-primary shrink-0" />
        <span>توضیحات کامل محصول</span>
      </div>

      <div className="relative">
        <div
          className={`text-xs sm:text-sm text-foreground/80 leading-relaxed transition-all duration-300 ${
            !isExpanded && isLongText ? "line-clamp-4" : ""
          }`}
        >
          {description.split("\n").map((paragraph, index) => (
            <p key={index} className={index > 0 ? "mt-2" : ""}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {isLongText && (
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="self-start mt-1 text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 cursor-pointer transition-colors pt-1"
        >
          <span>{isExpanded ? "بستن توضیحات" : "مشاهده کامل توضیحات"}</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      )}
    </div>
  );
}
