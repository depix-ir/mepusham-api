"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Plus,
  LayoutGrid,
  Edit3,
  RefreshCw,
  Trash2,
  BookmarkPlus,
  Info,
  CheckCircle2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import {
  SizeGuide,
  SizeGuideData,
  SizeGuideTemplate,
} from "@/types/product";
import {
  normalizeSizeGuide,
  getSizeGuideTemplateById,
  saveSizeGuideAsTemplate,
} from "@/lib/sizeguide/sizeGuideService";
import { SizeGuideTemplatePickerModal } from "./SizeGuideTemplatePickerModal";
import { SizeGuideBuilderModal } from "./SizeGuideBuilderModal";
import { useToast } from "@/components/ui/Toast";

export interface SizeGuideSectionProps {
  sizeGuide?: SizeGuide | SizeGuideData | null;
  onChange: (sizeGuide: SizeGuide | null) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function SizeGuideSection({
  sizeGuide,
  onChange,
  isOpen = true,
  onToggle,
}: SizeGuideSectionProps) {
  const { showToast } = useToast();

  // Normalize input size guide to structured SizeGuide object
  const normalizedSg = normalizeSizeGuide(sizeGuide || undefined);

  // Modals state
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // Internal collapse toggle if onToggle not provided
  const [internalOpen, setInternalOpen] = useState(true);
  const isExpanded = onToggle ? isOpen : internalOpen;
  const toggleCollapse = onToggle ? onToggle : () => setInternalOpen((prev) => !prev);

  // Source template info if available
  const sourceTemplate = normalizedSg?.sourceTemplateId
    ? getSizeGuideTemplateById(normalizedSg.sourceTemplateId)
    : null;

  // Handlers
  const handleRemoveSizeGuide = () => {
    onChange(null);
    setIsConfirmDeleteOpen(false);
    showToast("راهنمای سایز از محصول حذف شد.", "info");
  };

  const handleSaveAsTemplate = () => {
    if (!normalizedSg) return;
    const tplName = prompt("نام قالب جدید را وارد کنید:", `${normalizedSg.title} - قالب`);
    if (!tplName || !tplName.trim()) return;

    const newTpl = saveSizeGuideAsTemplate(normalizedSg, tplName.trim());
    showToast(`قالب «${newTpl.name}» با موفقیت ساخته شد.`, "success");
  };

  return (
    <div className="bg-background border border-border rounded-xl overflow-hidden shadow-xs text-xs">
      {/* Header Bar */}
      <button
        type="button"
        onClick={toggleCollapse}
        className="w-full flex items-center justify-between p-4 bg-surface-subtle border-b border-border text-right"
      >
        <div className="flex items-center gap-2 font-bold text-sm text-foreground">
          <FileSpreadsheet className="w-4 h-4 text-primary" />
          <span>راهنمای سایز (Size Guide)</span>
          {normalizedSg && (
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
              فعال
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Expanded Section Content */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4">
          {!normalizedSg ? (
            /* STATE A: NO SIZE GUIDE ATTACHED */
            <div className="space-y-4">
              <p className="text-muted-foreground text-xs leading-relaxed">
                برای این محصول هنوز راهنمای سایز تعریف نشده است. افزودن راهنمای سایز اختیاری است اما به مشتریان در خرید آگاهانه کمک می‌کند.
              </p>

              {/* 3 Choices */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Choice 1: No size guide */}
                <div className="p-4 rounded-xl border-2 border-primary/20 bg-surface-subtle/40 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <span className="font-bold text-foreground text-xs block">
                      بدون راهنمای سایز
                    </span>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      محصول بدون جدول راهنمای سایز ذخیره می‌شود.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-primary text-[11px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>انتخاب‌شده</span>
                  </div>
                </div>

                {/* Choice 2: Template Picker */}
                <button
                  type="button"
                  onClick={() => setIsTemplatePickerOpen(true)}
                  className="group p-4 rounded-xl border-2 border-border hover:border-primary/60 bg-background hover:bg-surface-subtle/50 text-right transition-all flex flex-col justify-between space-y-3 cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-xs group-hover:text-primary transition-colors">
                        استفاده از قالب آماده
                      </span>
                      <LayoutGrid className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      انتخاب از بین قالب‌های استانداردی که قبلاً ساخته شده‌اند.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-primary flex items-center gap-1">
                    <span>مشاهده قالب‌ها</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                </button>

                {/* Choice 3: Custom Builder */}
                <button
                  type="button"
                  onClick={() => setIsBuilderOpen(true)}
                  className="group p-4 rounded-xl border-2 border-border hover:border-primary/60 bg-background hover:bg-surface-subtle/50 text-right transition-all flex flex-col justify-between space-y-3 cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-xs group-hover:text-primary transition-colors">
                        ساخت راهنمای سایز
                      </span>
                      <Plus className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      ایجاد جدول جدید با ستون‌ها و ردیف‌های سفارشی از صفر.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-primary flex items-center gap-1">
                    <span>باز کردن جدول‌ساز</span>
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* STATE B: PRODUCT HAS SIZE GUIDE ATTACHED */
            <div className="space-y-4">
              {/* Template Origin Banner */}
              <div className="p-3.5 rounded-xl bg-surface-subtle border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-xs">
                      {normalizedSg.title}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {sourceTemplate ? (
                        <>
                          این راهنمای سایز از قالب «
                          <span className="font-semibold text-foreground">
                            {sourceTemplate.name}
                          </span>
                          » ساخته شده است.
                        </>
                      ) : (
                        "راهنمای سایز اختصاصی محصول"
                      )}
                    </p>
                  </div>
                </div>

                {/* Toolbar Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsBuilderOpen(true)}
                    className="h-8 px-3 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary-hover flex items-center gap-1 transition-colors shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>ویرایش جدول</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsTemplatePickerOpen(true)}
                    className="h-8 px-3 rounded-lg bg-background border border-border hover:border-primary text-foreground font-semibold flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-primary" />
                    <span>تعویض قالب</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAsTemplate}
                    className="h-8 px-3 rounded-lg bg-background border border-border hover:border-primary text-foreground font-semibold flex items-center gap-1 transition-colors"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5 text-primary" />
                    <span>ذخیره به عنوان قالب جدید</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsConfirmDeleteOpen(true)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-error hover:bg-error/10 transition-colors"
                    title="حذف راهنمای سایز"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {normalizedSg.description && (
                <p className="text-xs text-muted-foreground px-1">
                  {normalizedSg.description}
                </p>
              )}

              {/* Table Preview & Optional Supplementary Image */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div
                  className={`border border-border rounded-xl overflow-hidden bg-background shadow-2xs ${
                    normalizedSg.imageUrl ? "lg:col-span-8" : "lg:col-span-12"
                  }`}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse text-xs">
                      <thead>
                        <tr className="bg-surface-subtle border-b border-border text-foreground font-bold">
                          {normalizedSg.columns.map((col) => (
                            <th key={col.id} className="py-2.5 px-3 border-l border-border/60 last:border-0">
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {normalizedSg.rows.map((row) => (
                          <tr key={row.id} className="hover:bg-surface-subtle/30">
                            {normalizedSg.columns.map((col) => (
                              <td
                                key={col.id}
                                className="py-2.5 px-3 text-foreground font-medium border-l border-border/40 last:border-0"
                              >
                                {row.cells[col.id] || "-"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {normalizedSg.imageUrl && (
                  <div className="lg:col-span-4 p-3 border border-border rounded-xl bg-surface-subtle/40 flex flex-col items-center justify-center space-y-2 text-center">
                    <span className="font-bold text-[11px] text-foreground">
                      تصویر نحوه اندازه‌گیری:
                    </span>
                    <div className="relative w-full h-36 rounded-lg border border-border overflow-hidden bg-background">
                      <Image
                        src={normalizedSg.imageUrl}
                        alt="Size guide diagram"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>

              {normalizedSg.notes && (
                <div className="p-3 rounded-xl bg-surface-subtle/60 border border-border text-[11px] text-muted-foreground leading-relaxed">
                  💡 <span className="font-bold text-foreground">نکته راهنما:</span>{" "}
                  {normalizedSg.notes}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TEMPLATE PICKER MODAL */}
      <SizeGuideTemplatePickerModal
        isOpen={isTemplatePickerOpen}
        onClose={() => setIsTemplatePickerOpen(false)}
        onSelectTemplate={(snapshot) => onChange(snapshot)}
        onCreateNewTemplateClick={() => setIsBuilderOpen(true)}
      />

      {/* TABLE BUILDER MODAL */}
      <SizeGuideBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        initialSizeGuide={normalizedSg}
        onSaveProductSizeGuide={(updatedSg) => onChange(updatedSg)}
      />

      {/* DELETE CONFIRMATION MODAL */}
      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setIsConfirmDeleteOpen(false)}
          />
          <div className="relative bg-background border border-border rounded-2xl shadow-2xl w-full max-w-sm p-5 z-10 space-y-4 text-xs">
            <div className="flex items-center gap-2.5 text-error font-bold text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>حذف راهنمای سایز</span>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              آیا از حذف راهنمای سایز این محصول اطمینان دارید؟ این عمل جدول راهنمای سایز اختصاص داده شده به محصول را پاک می‌کند.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setIsConfirmDeleteOpen(false)}
                className="h-9 px-4 rounded-lg bg-surface-subtle border border-border font-bold text-foreground"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleRemoveSizeGuide}
                className="h-9 px-4 rounded-lg bg-error text-error-foreground font-bold hover:opacity-90"
              >
                حذف راهنمای سایز
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
