"use client";

import React from "react";
import { Product, ProductOption, SizeGuideData } from "@/types/product";
import { isOptionValueAvailable } from "@/lib/product/domain";
import { Check, Ruler } from "lucide-react";

export interface VariantSelectorProps {
  product: Product;
  selectedOptions: Record<string, string>;
  onSelectOption: (optionId: string, valueId: string) => void;
  sizeGuide?: SizeGuideData;
  onOpenSizeGuide?: () => void;
}

export function VariantSelector({
  product,
  selectedOptions,
  onSelectOption,
  sizeGuide,
  onOpenSizeGuide,
}: VariantSelectorProps) {
  if (product.options.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 py-2 border-y border-border-product/60">
      {product.options.map((option: ProductOption) => {
        const isColor = option.type === "color" || option.id === "color";
        const isSize = option.type === "size" || option.id === "size";
        const selectedValueId = selectedOptions[option.id];
        const selectedValueObj = option.values.find((v) => v.id === selectedValueId);

        return (
          <div key={option.id} className="flex flex-col gap-2">
            {/* Label and Selected Value Title */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-semibold text-foreground">
                {option.name}:{" "}
                {selectedValueObj ? (
                  <span className="font-bold text-primary mr-1">{selectedValueObj.label}</span>
                ) : (
                  <span className="text-muted mr-1">انتخاب کنید</span>
                )}
              </span>

              {/* Size Guide Link if size option */}
              {isSize && sizeGuide && onOpenSizeGuide && (
                <button
                  type="button"
                  onClick={onOpenSizeGuide}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>راهنمای سایز</span>
                </button>
              )}
            </div>

            {/* Option Values List */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {option.values.map((val) => {
                const isSelected = selectedValueId === val.id;
                const isAvailable = isOptionValueAvailable(
                  product,
                  option.id,
                  val.id,
                  selectedOptions
                );

                if (isColor) {
                  // Render Color Swatch
                  const colorHex = val.value.startsWith("#") ? val.value : "#000000";

                  return (
                    <button
                      key={val.id}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => {
                        if (isAvailable) {
                          onSelectOption(option.id, val.id);
                        }
                      }}
                      title={`${val.label}${!isAvailable ? " (ناموجود)" : ""}`}
                      aria-label={`${option.name}: ${val.label}${!isAvailable ? " (ناموجود)" : ""}`}
                      aria-pressed={isSelected}
                      className={`relative group flex items-center justify-center rounded-full transition-all ${
                        isAvailable ? "cursor-pointer" : "cursor-not-allowed opacity-40 grayscale"
                      } ${
                        isSelected
                          ? "ring-2 ring-primary ring-offset-2 scale-110 shadow-sm"
                          : isAvailable
                          ? "hover:scale-105"
                          : ""
                      }`}
                      style={{ width: 36, height: 36 }}
                    >
                      <span
                        className="w-full h-full rounded-full border border-border-product/80 shadow-inner flex items-center justify-center"
                        style={{ backgroundColor: colorHex }}
                      >
                        {isSelected && (
                          <Check
                            className={`w-4 h-4 ${
                              colorHex.toLowerCase() === "#ffffff" || colorHex.toLowerCase() === "#fff"
                                ? "text-black"
                                : "text-white"
                            }`}
                          />
                        )}
                      </span>

                      {/* Not available strikethrough line */}
                      {!isAvailable && (
                        <span className="absolute inset-0 m-auto w-full h-0.5 bg-red-500 rotate-45 pointer-events-none rounded" />
                      )}
                    </button>
                  );
                }

                // Render Size / Pill
                return (
                  <button
                    key={val.id}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => {
                      if (isAvailable) {
                        onSelectOption(option.id, val.id);
                      }
                    }}
                    aria-label={`${option.name}: ${val.label}${!isAvailable ? " (ناموجود)" : ""}`}
                    aria-pressed={isSelected}
                    className={`relative min-w-[44px] h-10 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border flex items-center justify-center ${
                      isAvailable ? "cursor-pointer" : "cursor-not-allowed opacity-40 border-dashed border-red-300/80 bg-red-50/20 text-muted"
                    } ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-sm scale-102"
                        : isAvailable
                        ? "bg-background text-foreground border-border-product hover:border-primary/50"
                        : ""
                    }`}
                  >
                    <span>{val.label}</span>
                    {!isAvailable && (
                      <span className="text-[10px] text-red-500 mr-1 font-normal">
                        (ناموجود)
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
