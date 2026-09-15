"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Trash2,
  Check,
  X,
  Sliders,
  Sparkles,
  Edit2,
  CheckSquare,
  Square,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  ProductOption,
  ProductOptionValue,
  ProductVariant,
  ProductVariantStatus,
} from "@/types/product";
import {
  generateLiveVariants,
  ColorSelection,
  checkVariantCollision,
  getCombinationKey,
} from "@/lib/variant/variantGenerator";
import { useToast } from "@/components/ui/Toast";

// Data-driven available sizes catalog
const DEFAULT_AVAILABLE_SIZES = ["S", "M", "L", "XL", "XXL", "36", "37", "38", "39", "40", "فري سايز"];

// Preset colors catalog
const PRESET_COLORS = [
  { label: "مشکی", hex: "#000000" },
  { label: "سفید", hex: "#FFFFFF" },
  { label: "قهوه‌ای", hex: "#654321" },
  { label: "کرم", hex: "#FFFDD0" },
  { label: "عسلی", hex: "#D2B48C" },
  { label: "سورمه‌ای", hex: "#000080" },
  { label: "طوسی", hex: "#808080" },
  { label: "صورتی", hex: "#FFC0CB" },
  { label: "قرمز", hex: "#FF0000" },
  { label: "سبز", hex: "#008000" },
];

export interface ProductVariantBuilderProps {
  options: ProductOption[];
  setOptions: React.Dispatch<React.SetStateAction<ProductOption[]>>;
  variants: ProductVariant[];
  setVariants: React.Dispatch<React.SetStateAction<ProductVariant[]>>;
  defaultPrice?: number;
  defaultCompareAtPrice?: number;
  defaultStock?: number;
  skuPrefix?: string;
}

export function ProductVariantBuilder({
  options,
  setOptions,
  variants,
  setVariants,
  defaultPrice = 1500000,
  defaultCompareAtPrice,
  defaultStock = 10,
  skuPrefix = "PROD",
}: ProductVariantBuilderProps) {
  const { showToast } = useToast();

  // Color option and Size option derivation
  const colorOption = useMemo(
    () => options.find((o) => o.type === "color" || o.name === "رنگ") || null,
    [options]
  );
  const sizeOption = useMemo(
    () => options.find((o) => o.type === "size" || o.name === "سایز") || null,
    [options]
  );

  // Available size labels state (data-driven)
  const [availableSizes, setAvailableSizes] = useState<string[]>(DEFAULT_AVAILABLE_SIZES);

  // Color selections state (maps color -> selected size labels)
  const [colorSelections, setColorSelections] = useState<ColorSelection[]>([]);

  // Modals state
  const [isAddColorModalOpen, setIsAddColorModalOpen] = useState(false);
  const [newColorLabel, setNewColorLabel] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");

  const [isAddSizeModalOpen, setIsAddSizeModalOpen] = useState(false);
  const [newSizeLabel, setNewSizeLabel] = useState("");

  // Safety confirmation modal for removing color/variant
  const [deactivatingVariant, setDeactivatingVariant] = useState<ProductVariant | null>(null);

  // Inline editing state for variants table
  const [editingCell, setEditingCell] = useState<{
    variantId: string;
    field: "price" | "compareAtPrice" | "stock" | "sku";
  } | null>(null);
  const [inlineInputValue, setInlineInputValue] = useState("");

  // Bulk Variant selection
  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);
  const [bulkPrice, setBulkPrice] = useState<number | "">("");
  const [bulkStock, setBulkStock] = useState<number | "">("");

  // Hydrate colorSelections from existing options & variants on initial load
  useEffect(() => {
    if (colorOption) {
      const selections: ColorSelection[] = colorOption.values.map((colorVal) => {
        // Find sizes selected for this color in existing variants
        let sizesForThisColor: string[] = [];
        if (sizeOption) {
          sizesForThisColor = variants
            .filter((v) => {
              const hasColor = v.optionValues.some(
                (ov) => ov.optionId === colorOption.id && ov.valueId === colorVal.id
              );
              return hasColor && v.status === "active";
            })
            .map((v) => {
              const sizeOv = v.optionValues.find((ov) => ov.optionId === sizeOption.id);
              if (!sizeOv) return null;
              const sizeValObj = sizeOption.values.find((sv) => sv.id === sizeOv.valueId);
              return sizeValObj ? sizeValObj.label : null;
            })
            .filter(Boolean) as string[];
        }

        return {
          id: colorVal.id,
          label: colorVal.label,
          hex: colorVal.value || "#000000",
          sizes: sizesForThisColor,
        };
      });

      setColorSelections(selections);
    }
  }, []); // Run on mount

  // Sync Options & Live Variants whenever colorSelections change
  const syncLiveVariants = (newSelections: ColorSelection[]) => {
    // 1. Ensure Color Option exists in options
    let updatedOptions = [...options];

    // Build or update Color Option
    const colorValues: ProductOptionValue[] = newSelections.map((c, idx) => ({
      id: c.id,
      label: c.label,
      value: c.hex,
      sortOrder: idx,
    }));

    let currentColorOpt = updatedOptions.find(
      (o) => o.type === "color" || o.name === "رنگ"
    );
    if (!currentColorOpt && newSelections.length > 0) {
      currentColorOpt = {
        id: `opt-color-${Date.now()}`,
        name: "رنگ",
        type: "color",
        required: true,
        sortOrder: 0,
        values: colorValues,
      };
      updatedOptions.push(currentColorOpt);
    } else if (currentColorOpt) {
      updatedOptions = updatedOptions.map((o) =>
        o.id === currentColorOpt!.id ? { ...o, values: colorValues } : o
      );
    }

    // 2. Build or update Size Option
    const allUsedSizeLabels = Array.from(
      new Set(newSelections.flatMap((c) => c.sizes))
    );

    let currentSizeOpt = updatedOptions.find(
      (o) => o.type === "size" || o.name === "سایز"
    );

    if (allUsedSizeLabels.length > 0) {
      const sizeValues: ProductOptionValue[] = allUsedSizeLabels.map((sLabel, idx) => {
        const existingVal = currentSizeOpt?.values.find(
          (sv) => sv.label.trim().toLowerCase() === sLabel.trim().toLowerCase()
        );
        return {
          id: existingVal ? existingVal.id : `val-size-${idx}-${sLabel.toLowerCase()}`,
          label: sLabel,
          value: sLabel,
          sortOrder: idx,
        };
      });

      if (!currentSizeOpt) {
        currentSizeOpt = {
          id: `opt-size-${Date.now()}`,
          name: "سایز",
          type: "size",
          required: true,
          sortOrder: 1,
          values: sizeValues,
        };
        updatedOptions.push(currentSizeOpt);
      } else {
        updatedOptions = updatedOptions.map((o) =>
          o.id === currentSizeOpt!.id ? { ...o, values: sizeValues } : o
        );
      }
    }

    setOptions(updatedOptions);

    // 3. LIVE Deterministic Variants Generation
    const nextVariants = generateLiveVariants(
      currentColorOpt || null,
      currentSizeOpt || null,
      newSelections,
      variants,
      {
        defaultPrice,
        defaultCompareAtPrice,
        defaultStock,
        skuPrefix,
      }
    );

    setVariants(nextVariants);
  };

  // Toggle size for a color
  const handleToggleSizeForColor = (colorId: string, sizeLabel: string) => {
    const updatedSelections = colorSelections.map((c) => {
      if (c.id !== colorId) return c;
      const isSelected = c.sizes.includes(sizeLabel);
      const newSizes = isSelected
        ? c.sizes.filter((s) => s !== sizeLabel)
        : [...c.sizes, sizeLabel];
      return { ...c, sizes: newSizes };
    });

    setColorSelections(updatedSelections);
    syncLiveVariants(updatedSelections);
  };

  // Add New Color
  const handleAddColor = (label: string, hex: string) => {
    if (!label.trim()) return;
    const trimmed = label.trim();

    if (colorSelections.some((c) => c.label.toLowerCase() === trimmed.toLowerCase())) {
      showToast(`رنگ «${trimmed}» قبلاً اضافه شده است.`, "warning");
      return;
    }

    const newColorItem: ColorSelection = {
      id: `val-color-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      label: trimmed,
      hex: hex || "#000000",
      sizes: sizeOption ? availableSizes.slice(0, 3) : [], // default select first few sizes if size option exists
    };

    const updated = [...colorSelections, newColorItem];
    setColorSelections(updated);
    syncLiveVariants(updated);

    setIsAddColorModalOpen(false);
    setNewColorLabel("");
    showToast(`رنگ «${trimmed}» اضافه شد.`, "success");
  };

  // Remove Color Card
  const handleRemoveColor = (colorId: string) => {
    const colorItem = colorSelections.find((c) => c.id === colorId);
    if (!colorItem) return;

    const updated = colorSelections.filter((c) => c.id !== colorId);
    setColorSelections(updated);
    syncLiveVariants(updated);
    showToast(`رنگ «${colorItem.label}» حذف شد.`, "info");
  };

  // Add New Size Label
  const handleAddSizeLabel = () => {
    if (!newSizeLabel.trim()) return;
    const trimmed = newSizeLabel.trim();
    if (!availableSizes.includes(trimmed)) {
      setAvailableSizes((prev) => [...prev, trimmed]);
    }
    setNewSizeLabel("");
    setIsAddSizeModalOpen(false);
    showToast(`سایز «${trimmed}» به فهرست سایزها اضافه شد.`, "success");
  };

  // Helper to read option value label from variant
  const getOptionValueLabel = (optionId: string, valueId: string) => {
    const option = options.find((o) => o.id === optionId);
    if (!option) return valueId;
    const valObj = option.values.find((v) => v.id === valueId);
    return valObj ? valObj.label : valueId;
  };

  const getVariantLabel = (variant: ProductVariant) => {
    if (!variant.optionValues || variant.optionValues.length === 0) return "پیش‌فرض";
    return variant.optionValues
      .map((ov) => getOptionValueLabel(ov.optionId, ov.valueId))
      .join(" / ");
  };

  // Inline edit handlers
  const handleStartInlineEdit = (
    variantId: string,
    field: "price" | "compareAtPrice" | "stock" | "sku",
    currentVal: any
  ) => {
    setEditingCell({ variantId, field });
    setInlineInputValue(currentVal !== undefined && currentVal !== null ? String(currentVal) : "");
  };

  const handleSaveInlineEdit = () => {
    if (!editingCell) return;
    const { variantId, field } = editingCell;

    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== variantId) return v;
        if (field === "price") {
          return { ...v, pricing: { ...v.pricing, price: Number(inlineInputValue) || 0 } };
        }
        if (field === "compareAtPrice") {
          const num = inlineInputValue ? Number(inlineInputValue) : undefined;
          return { ...v, pricing: { ...v.pricing, compareAtPrice: num } };
        }
        if (field === "stock") {
          return { ...v, inventory: { ...v.inventory, stock: Number(inlineInputValue) || 0 } };
        }
        if (field === "sku") {
          return { ...v, sku: inlineInputValue.trim() };
        }
        return v;
      })
    );

    setEditingCell(null);
  };

  const handleToggleVariantStatus = (variantId: string) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId
          ? { ...v, status: v.status === "active" ? "inactive" : "active" }
          : v
      )
    );
  };

  // Bulk Actions
  const handleToggleSelectAll = () => {
    if (selectedVariantIds.length === activeVariants.length) {
      setSelectedVariantIds([]);
    } else {
      setSelectedVariantIds(activeVariants.map((v) => v.id));
    }
  };

  const handleApplyBulkPrice = () => {
    if (selectedVariantIds.length === 0 || bulkPrice === "") return;
    setVariants((prev) =>
      prev.map((v) =>
        selectedVariantIds.includes(v.id)
          ? { ...v, pricing: { ...v.pricing, price: Number(bulkPrice) } }
          : v
      )
    );
    showToast(`قیمت ${selectedVariantIds.length} واریانت بروزرسانی شد.`, "success");
  };

  const handleApplyBulkStock = () => {
    if (selectedVariantIds.length === 0 || bulkStock === "") return;
    setVariants((prev) =>
      prev.map((v) =>
        selectedVariantIds.includes(v.id)
          ? { ...v, inventory: { ...v.inventory, stock: Number(bulkStock) } }
          : v
      )
    );
    showToast(`موجودی ${selectedVariantIds.length} واریانت بروزرسانی شد.`, "success");
  };

  const activeVariants = useMemo(
    () => variants.filter((v) => v.status === "active"),
    [variants]
  );

  const inactiveVariants = useMemo(
    () => variants.filter((v) => v.status === "inactive"),
    [variants]
  );

  return (
    <div className="space-y-6 text-xs">
      {/* SECTION 1: COLOR CARDS WITH SIZE SELECTION */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-primary" />
              <span>انتخاب رنگ‌ها و سایزهای موجود</span>
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              ابتدا رنگ‌های محصول را انتخاب کرده، سپس برای هر رنگ سایزهای موجود را مشخص کنید. ترکیب‌ها به‌صورت زنده ساخته می‌شوند.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddColorModalOpen(true)}
              className="h-9 px-3.5 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary-hover flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ افزودن رنگ جدید</span>
            </button>
          </div>
        </div>

        {/* Preset Quick Colors Pill Bar */}
        <div className="p-3 bg-surface-subtle border border-border rounded-xl space-y-2">
          <span className="font-bold text-foreground text-[11px] block">
            افزودن سریع رنگ:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {PRESET_COLORS.map((preset) => {
              const isAdded = colorSelections.some(
                (c) => c.label.toLowerCase() === preset.label.toLowerCase()
              );
              return (
                <button
                  key={preset.label}
                  type="button"
                  disabled={isAdded}
                  onClick={() => handleAddColor(preset.label, preset.hex)}
                  className={`h-7 px-2.5 rounded-full border text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                    isAdded
                      ? "bg-surface-muted text-muted-foreground border-border opacity-60 cursor-not-allowed"
                      : "bg-background border-border hover:border-primary text-foreground"
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-black/20"
                    style={{ backgroundColor: preset.hex }}
                  />
                  <span>{preset.label}</span>
                  {isAdded ? (
                    <Check className="w-3 h-3 text-primary" />
                  ) : (
                    <Plus className="w-3 h-3 text-muted-foreground" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Cards List */}
        {colorSelections.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-surface-subtle/30 text-muted-foreground space-y-2">
            <Sliders className="w-8 h-8 mx-auto text-muted-foreground/50 mb-1" />
            <p className="font-bold text-xs text-foreground">هنوز هیچ رنگی تعریف نشده است.</p>
            <p className="text-[11px]">
              روی دکمه «+ افزودن رنگ جدید» یا رنگ‌های سریع بالا کلیک کنید تا وارد ساخت واریانت شوید.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {colorSelections.map((colorSel) => (
              <div
                key={colorSel.id}
                className="p-4 bg-background border border-border rounded-xl shadow-xs space-y-3 relative group"
              >
                {/* Header of Color Card */}
                <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border border-black/20 shadow-xs"
                      style={{ backgroundColor: colorSel.hex }}
                    />
                    <span className="font-bold text-sm text-foreground">
                      {colorSel.label}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground bg-surface-subtle px-2 py-0.5 rounded-full border border-border">
                      {colorSel.sizes.length} سایز انتخاب‌شده
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveColor(colorSel.id)}
                    className="p-1 rounded-md text-muted-foreground hover:text-error hover:bg-error/10 transition-colors"
                    title="حذف این رنگ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Size Pills Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-foreground">
                      سایزهای موجود برای «{colorSel.label}»:
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddSizeModalOpen(true)}
                      className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" />
                      <span>سایز جدید</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {availableSizes.map((sizeLabel) => {
                      const isSelected = colorSel.sizes.includes(sizeLabel);
                      return (
                        <button
                          key={sizeLabel}
                          type="button"
                          onClick={() => handleToggleSizeForColor(colorSel.id, sizeLabel)}
                          className={`h-8 px-3 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all border ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-xs"
                              : "bg-surface-subtle hover:bg-surface-muted text-foreground border-border"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                          <span>{sizeLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: LIVE FINAL VARIANT LIST TABLE */}
      {variants.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>فهرست زنده واریانت‌ها ({activeVariants.length} فعال)</span>
              </h3>
              <p className="text-[11px] text-muted-foreground">
                واریانت‌ها به صورت خودکار بر اساس انتخاب‌های شما تولید شده‌اند. برای ویرایش قیمت یا موجودی، روی سلول کلیک کنید.
              </p>
            </div>
          </div>

          {/* Bulk Action Controls */}
          <div className="p-3 bg-surface-subtle border border-border rounded-xl flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="flex items-center gap-1.5 font-bold text-foreground text-xs"
            >
              {selectedVariantIds.length === activeVariants.length && activeVariants.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-primary" />
              ) : (
                <Square className="w-4 h-4 text-muted-foreground" />
              )}
              <span>
                انتخاب همه ({selectedVariantIds.length} از {activeVariants.length})
              </span>
            </button>

            {selectedVariantIds.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    placeholder="قیمت دسته‌جمعی"
                    value={bulkPrice}
                    onChange={(e) => setBulkPrice(e.target.value ? Number(e.target.value) : "")}
                    className="w-28 h-8 px-2.5 bg-background border border-border rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleApplyBulkPrice}
                    className="h-8 px-3 bg-primary text-primary-foreground font-bold rounded-lg text-xs hover:bg-primary-hover"
                  >
                    اعمال قیمت
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    placeholder="موجودی"
                    value={bulkStock}
                    onChange={(e) => setBulkStock(e.target.value ? Number(e.target.value) : "")}
                    className="w-20 h-8 px-2.5 bg-background border border-border rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleApplyBulkStock}
                    className="h-8 px-3 bg-primary text-primary-foreground font-bold rounded-lg text-xs hover:bg-primary-hover"
                  >
                    اعمال موجودی
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Responsive Variants Spreadsheet Table */}
          <div className="border border-border rounded-xl overflow-x-auto bg-background shadow-xs">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-surface-subtle border-b border-border text-muted-foreground font-bold">
                  <th className="py-3 px-3 w-8 text-center"></th>
                  <th className="py-3 px-3">عنوان واریانت</th>
                  <th className="py-3 px-3">SKU</th>
                  <th className="py-3 px-3">قیمت (تومان)</th>
                  <th className="py-3 px-3">قیمت قبل تخفیف</th>
                  <th className="py-3 px-3">موجودی</th>
                  <th className="py-3 px-3">وضعیت</th>
                  <th className="py-3 px-3 text-left">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {activeVariants.map((v) => {
                  const isSelected = selectedVariantIds.includes(v.id);
                  const vLabel = getVariantLabel(v);

                  return (
                    <tr
                      key={v.id}
                      className={`hover:bg-surface-subtle/50 transition-colors ${
                        isSelected ? "bg-primary/5" : ""
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedVariantIds((prev) =>
                              prev.includes(v.id)
                                ? prev.filter((i) => i !== v.id)
                                : [...prev, v.id]
                            )
                          }
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-primary" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      <td className="py-2.5 px-3 font-bold text-foreground">{vLabel}</td>

                      {/* SKU Cell */}
                      <td className="py-2.5 px-3">
                        {editingCell?.variantId === v.id && editingCell.field === "sku" ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={inlineInputValue}
                              onChange={(e) => setInlineInputValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveInlineEdit();
                                if (e.key === "Escape") setEditingCell(null);
                              }}
                              autoFocus
                              className="w-28 h-8 px-2 bg-surface-subtle border border-primary rounded font-mono text-xs dir-ltr text-right"
                            />
                            <button
                              type="button"
                              onClick={handleSaveInlineEdit}
                              className="p-1 rounded text-primary hover:bg-primary/10"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => handleStartInlineEdit(v.id, "sku", v.sku)}
                            className="cursor-pointer font-mono text-muted-foreground hover:text-foreground hover:underline"
                          >
                            {v.sku || "—"}
                          </div>
                        )}
                      </td>

                      {/* Price Cell */}
                      <td className="py-2.5 px-3">
                        {editingCell?.variantId === v.id && editingCell.field === "price" ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={inlineInputValue}
                              onChange={(e) => setInlineInputValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveInlineEdit();
                                if (e.key === "Escape") setEditingCell(null);
                              }}
                              autoFocus
                              className="w-28 h-8 px-2 bg-surface-subtle border border-primary rounded font-bold text-xs"
                            />
                            <button
                              type="button"
                              onClick={handleSaveInlineEdit}
                              className="p-1 rounded text-primary hover:bg-primary/10"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() =>
                              handleStartInlineEdit(v.id, "price", v.pricing?.price)
                            }
                            className="cursor-pointer font-bold text-foreground hover:text-primary hover:underline"
                          >
                            {(v.pricing?.price || 0).toLocaleString("fa-IR")} تومان
                          </div>
                        )}
                      </td>

                      {/* Compare At Price Cell */}
                      <td className="py-2.5 px-3">
                        {editingCell?.variantId === v.id &&
                        editingCell.field === "compareAtPrice" ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={inlineInputValue}
                              onChange={(e) => setInlineInputValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveInlineEdit();
                                if (e.key === "Escape") setEditingCell(null);
                              }}
                              autoFocus
                              placeholder="قیمت قبل"
                              className="w-28 h-8 px-2 bg-surface-subtle border border-primary rounded text-xs"
                            />
                            <button
                              type="button"
                              onClick={handleSaveInlineEdit}
                              className="p-1 rounded text-primary hover:bg-primary/10"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() =>
                              handleStartInlineEdit(
                                v.id,
                                "compareAtPrice",
                                v.pricing?.compareAtPrice
                              )
                            }
                            className="cursor-pointer text-muted-foreground hover:text-foreground hover:underline"
                          >
                            {v.pricing?.compareAtPrice
                              ? `${v.pricing.compareAtPrice.toLocaleString("fa-IR")} تومان`
                              : "—"}
                          </div>
                        )}
                      </td>

                      {/* Stock Cell */}
                      <td className="py-2.5 px-3">
                        {editingCell?.variantId === v.id && editingCell.field === "stock" ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={inlineInputValue}
                              onChange={(e) => setInlineInputValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveInlineEdit();
                                if (e.key === "Escape") setEditingCell(null);
                              }}
                              autoFocus
                              className="w-20 h-8 px-2 bg-surface-subtle border border-primary rounded font-bold text-xs"
                            />
                            <button
                              type="button"
                              onClick={handleSaveInlineEdit}
                              className="p-1 rounded text-primary hover:bg-primary/10"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() =>
                              handleStartInlineEdit(v.id, "stock", v.inventory?.stock)
                            }
                            className={`cursor-pointer font-bold ${
                              (v.inventory?.stock || 0) > 0
                                ? "text-emerald-600"
                                : "text-error"
                            } hover:underline`}
                          >
                            {v.inventory?.stock ?? 0}
                          </div>
                        )}
                      </td>

                      {/* Status Cell */}
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          فعال
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-left">
                        <button
                          type="button"
                          onClick={() => handleToggleVariantStatus(v.id)}
                          className="p-1.5 rounded text-muted-foreground hover:text-error hover:bg-error/10 transition-colors"
                          title="غیرفعال‌سازی این واریانت"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Inactive / Archived Variants Section */}
          {inactiveVariants.length > 0 && (
            <div className="p-3 bg-surface-subtle border border-border rounded-xl space-y-2">
              <span className="font-bold text-muted-foreground text-[11px] block">
                واریانت‌های غیرفعال / آرشیوشده ({inactiveVariants.length}):
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {inactiveVariants.map((iv) => (
                  <span
                    key={iv.id}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-background border border-border rounded-lg text-muted-foreground text-[11px]"
                  >
                    <span>{getVariantLabel(iv)}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleVariantStatus(iv.id)}
                      className="text-primary font-bold hover:underline"
                    >
                      فعال‌سازی
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD COLOR */}
      {isAddColorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsAddColorModalOpen(false)}
          />
          <div className="relative bg-background border border-border rounded-2xl p-5 w-full max-w-xs space-y-4 z-10 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-foreground">افزودن رنگ جدید</h3>
              <button
                type="button"
                onClick={() => setIsAddColorModalOpen(false)}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">
                نام رنگ <span className="text-error">*</span>
              </label>
              <input
                type="text"
                placeholder="مثلاً: بنفش یا سبز پسته‌ای"
                value={newColorLabel}
                onChange={(e) => setNewColorLabel(e.target.value)}
                className="w-full h-9 px-3 bg-surface-subtle border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="font-bold text-foreground">انتخاب نماد رنگ (Color Swatch):</label>
              <input
                type="color"
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                className="w-9 h-9 rounded-lg border border-border cursor-pointer"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setIsAddColorModalOpen(false)}
                className="h-9 px-4 rounded-lg bg-surface-subtle font-bold text-foreground"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => handleAddColor(newColorLabel, newColorHex)}
                disabled={!newColorLabel.trim()}
                className="h-9 px-5 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary-hover disabled:opacity-50"
              >
                افزودن رنگ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD SIZE */}
      {isAddSizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsAddSizeModalOpen(false)}
          />
          <div className="relative bg-background border border-border rounded-2xl p-5 w-full max-w-xs space-y-4 z-10 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-foreground">افزودن سایز جدید</h3>
              <button
                type="button"
                onClick={() => setIsAddSizeModalOpen(false)}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">
                عنوان سایز <span className="text-error">*</span>
              </label>
              <input
                type="text"
                placeholder="مثلاً: 42 یا S/M یا XXL"
                value={newSizeLabel}
                onChange={(e) => setNewSizeLabel(e.target.value)}
                className="w-full h-9 px-3 bg-surface-subtle border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setIsAddSizeModalOpen(false)}
                className="h-9 px-4 rounded-lg bg-surface-subtle font-bold text-foreground"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleAddSizeLabel}
                disabled={!newSizeLabel.trim()}
                className="h-9 px-5 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary-hover disabled:opacity-50"
              >
                افزودن سایز
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
