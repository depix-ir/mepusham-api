"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  MoveRight,
  MoveLeft,
  MoveUp,
  MoveDown,
  Copy,
  FileSpreadsheet,
  Save,
  BookmarkPlus,
  ArrowRight,
  Sparkles,
  Layers,
  HelpCircle,
} from "lucide-react";
import {
  SizeGuide,
  SizeGuideColumn,
  SizeGuideDataRow,
  SizeGuideTemplate,
} from "@/types/product";
import {
  validateSizeGuide,
  saveSizeGuideAsTemplate,
} from "@/lib/sizeguide/sizeGuideService";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { useToast } from "@/components/ui/Toast";

export interface SizeGuideBuilderViewProps {
  isOpen: boolean;
  onClose: () => void;
  initialSizeGuide?: SizeGuide | null;
  onSaveProductSizeGuide: (sizeGuide: SizeGuide) => void;
  onSaveAsTemplateSuccess?: (template: SizeGuideTemplate) => void;
}

export function SizeGuideBuilderView({
  isOpen,
  onClose,
  initialSizeGuide,
  onSaveProductSizeGuide,
  onSaveAsTemplateSuccess,
}: SizeGuideBuilderViewProps) {
  const { showToast } = useToast();

  // Builder State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [columns, setColumns] = useState<SizeGuideColumn[]>([]);
  const [rows, setRows] = useState<SizeGuideDataRow[]>([]);
  const [sourceTemplateId, setSourceTemplateId] = useState<string | undefined>(undefined);

  // Column Add State
  const [newColumnLabel, setNewColumnLabel] = useState("");
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);

  // Template Save Modal State
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [templateNameInput, setTemplateNameInput] = useState("");
  const [templateDescInput, setTemplateDescInput] = useState("");

  // Populate or Reset form state on open
  useEffect(() => {
    if (isOpen) {
      if (initialSizeGuide) {
        setTitle(initialSizeGuide.title || "");
        setDescription(initialSizeGuide.description || "");
        setNotes(initialSizeGuide.notes || "");
        setImageUrl(initialSizeGuide.imageUrl || "");
        setColumns(initialSizeGuide.columns ? initialSizeGuide.columns.map((c) => ({ ...c })) : []);
        setRows(
          initialSizeGuide.rows
            ? initialSizeGuide.rows.map((r) => ({
                ...r,
                cells: { ...r.cells },
              }))
            : []
        );
        setSourceTemplateId(initialSizeGuide.sourceTemplateId);
      } else {
        // Default fresh builder setup
        setTitle("راهنمای سایز پوشاک");
        setDescription("اندازه‌ها بر حسب سانتی‌متر هستند.");
        setNotes("برای راحتی بیشتر، در صورت تردید بین دو سایز، سایز بزرگ‌تر را انتخاب کنید.");
        setImageUrl("");
        setColumns([
          { id: "col-1", label: "سایز", order: 1 },
          { id: "col-2", label: "دور سینه (cm)", order: 2 },
          { id: "col-3", label: "دور کمر (cm)", order: 3 },
          { id: "col-4", label: "دور باسن (cm)", order: 4 },
        ]);
        setRows([
          {
            id: "row-1",
            cells: { "col-1": "S", "col-2": "82-86", "col-3": "64-68", "col-4": "88-92" },
            order: 1,
          },
          {
            id: "row-2",
            cells: { "col-1": "M", "col-2": "86-90", "col-3": "68-72", "col-4": "92-96" },
            order: 2,
          },
          {
            id: "row-3",
            cells: { "col-1": "L", "col-2": "90-94", "col-3": "72-76", "col-4": "96-100" },
            order: 3,
          },
        ]);
        setSourceTemplateId(undefined);
      }
    }
  }, [isOpen, initialSizeGuide]);

  if (!isOpen) return null;

  // Build current SizeGuide object snapshot
  const buildCurrentSizeGuide = (): SizeGuide => {
    return {
      id: initialSizeGuide?.id || `sg-${Date.now()}`,
      productId: initialSizeGuide?.productId,
      title: title.trim(),
      description: description.trim() || undefined,
      notes: notes.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      columns: columns.map((col, idx) => ({ ...col, order: idx + 1 })),
      rows: rows.map((row, idx) => ({
        ...row,
        order: idx + 1,
        cells: { ...row.cells },
      })),
      sourceTemplateId,
      createdAt: initialSizeGuide?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  // --- Column Actions ---
  const handleAddColumn = () => {
    if (!newColumnLabel.trim()) return;
    const colId = `col-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newCol: SizeGuideColumn = {
      id: colId,
      label: newColumnLabel.trim(),
      order: columns.length + 1,
    };
    setColumns((prev) => [...prev, newCol]);
    setNewColumnLabel("");
    setIsAddColumnOpen(false);
  };

  const handleRenameColumn = (colId: string, newLabel: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.id === colId ? { ...c, label: newLabel } : c))
    );
  };

  const handleDeleteColumn = (colId: string) => {
    if (columns.length <= 1) {
      showToast("جدول باید حداقل یک ستون داشته باشد.", "warning");
      return;
    }
    setColumns((prev) => prev.filter((c) => c.id !== colId));
    setRows((prev) =>
      prev.map((r) => {
        const newCells = { ...r.cells };
        delete newCells[colId];
        return { ...r, cells: newCells };
      })
    );
  };

  const handleMoveColumn = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "right" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= columns.length) return;

    const newCols = [...columns];
    const temp = newCols[index];
    newCols[index] = newCols[targetIndex];
    newCols[targetIndex] = temp;
    setColumns(newCols);
  };

  // --- Row Actions ---
  const handleAddRow = () => {
    const rowId = `row-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newCells: Record<string, string> = {};
    columns.forEach((c) => {
      newCells[c.id] = "";
    });

    const newRow: SizeGuideDataRow = {
      id: rowId,
      cells: newCells,
      order: rows.length + 1,
    };
    setRows((prev) => [...prev, newRow]);
  };

  const handleDuplicateRow = (index: number) => {
    const sourceRow = rows[index];
    const rowId = `row-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const duplicatedRow: SizeGuideDataRow = {
      id: rowId,
      cells: { ...sourceRow.cells },
      order: index + 2,
    };

    const updatedRows = [...rows];
    updatedRows.splice(index + 1, 0, duplicatedRow);
    setRows(updatedRows);
  };

  const handleDeleteRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveRow = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rows.length) return;

    const newRows = [...rows];
    const temp = newRows[index];
    newRows[index] = newRows[targetIndex];
    newRows[targetIndex] = temp;
    setRows(newRows);
  };

  const handleCellChange = (rowId: string, colId: string, value: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        return {
          ...r,
          cells: {
            ...r.cells,
            [colId]: value,
          },
        };
      })
    );
  };

  // --- Save Actions ---
  const handleSaveForProduct = () => {
    const sg = buildCurrentSizeGuide();
    const val = validateSizeGuide(sg);
    if (!val.isValid) {
      showToast(val.errors[0], "error");
      return;
    }

    onSaveProductSizeGuide(sg);
    showToast("راهنمای سایز با موفقیت برای این محصول ثبت شد.", "success");
    onClose();
  };

  const handleOpenSaveTemplateModal = () => {
    const sg = buildCurrentSizeGuide();
    const val = validateSizeGuide(sg);
    if (!val.isValid) {
      showToast(val.errors[0], "error");
      return;
    }
    setTemplateNameInput(`${title} - قالب جدید`);
    setTemplateDescInput(description);
    setIsSaveTemplateModalOpen(true);
  };

  const handleConfirmSaveAsTemplate = () => {
    if (!templateNameInput.trim()) {
      showToast("لطفاً نام قالب را وارد کنید.", "warning");
      return;
    }

    const sg = buildCurrentSizeGuide();
    const newTemplate = saveSizeGuideAsTemplate(
      sg,
      templateNameInput.trim(),
      templateDescInput.trim()
    );

    showToast(`قالب «${newTemplate.name}» با موفقیت ذخیره شد.`, "success");
    setIsSaveTemplateModalOpen(false);

    if (onSaveAsTemplateSuccess) {
      onSaveAsTemplateSuccess(newTemplate);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col w-full h-full overflow-hidden text-xs animate-fade-in">
      {/* FULL-PAGE HEADER BAR */}
      <header className="sticky top-0 z-20 bg-background border-b border-border px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-3 rounded-xl bg-surface-subtle hover:bg-surface-muted text-foreground border border-border flex items-center gap-1.5 transition-colors font-bold text-xs"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت</span>
          </button>

          <div className="h-5 w-px bg-border hidden sm:block" />

          <div>
            <h1 className="text-xs sm:text-base font-black text-foreground tracking-tight flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-primary shrink-0" />
              <span>جدول‌ساز راهنمای سایز</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenSaveTemplateModal}
            className="h-9 sm:h-10 px-3.5 bg-surface-subtle border border-border hover:bg-surface-muted text-foreground font-bold rounded-xl flex items-center gap-1.5 transition-colors text-xs hidden sm:flex"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-primary" />
            <span>ذخیره قالب</span>
          </button>

          <button
            type="button"
            onClick={handleSaveForProduct}
            className="h-9 sm:h-10 px-4 sm:px-5 bg-primary text-primary-foreground hover:bg-primary-hover font-extrabold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors text-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>ذخیره روی محصول</span>
          </button>
        </div>
      </header>

      {/* SCROLLABLE BODY CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 max-w-6xl mx-auto w-full">
        {/* SECTION 1: METADATA INFORMATION */}
        <div className="bg-background border border-border rounded-2xl p-4 sm:p-6 space-y-4 shadow-xs">
          <h2 className="text-sm font-extrabold text-foreground border-b border-border pb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span>مشخصات و عنوان راهنمای سایز</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 space-y-3.5">
              <div>
                <label className="block font-bold text-foreground mb-1.5 text-xs">
                  عنوان راهنمای سایز *
                </label>
                <input
                  type="text"
                  placeholder="مثلاً: راهنمای سایز مانتو و سارافون زنانه"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-11 px-4 bg-surface-subtle border border-border rounded-xl text-foreground focus:outline-none focus:border-primary font-bold text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1.5 text-xs">
                  توضیحات تکمیلی (اختیاری)
                </label>
                <input
                  type="text"
                  placeholder="مثلاً: تمامی اندازه‌ها بر حسب سانتی‌متر می‌باشد."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-10 px-3.5 bg-surface-subtle border border-border rounded-xl text-foreground focus:outline-none focus:border-primary font-medium text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1.5 text-xs">
                  نکات راهنما / توصیه به مشتری (اختیاری)
                </label>
                <input
                  type="text"
                  placeholder="مثلاً: در صورت تردید بین دو سایز، سایز بزرگ‌تر توصیه می‌شود."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-10 px-3.5 bg-surface-subtle border border-border rounded-xl text-foreground focus:outline-none focus:border-primary font-medium text-xs"
                />
              </div>
            </div>

            {/* Diagram / Image Picker */}
            <div className="lg:col-span-5 bg-surface-subtle/40 border border-border rounded-2xl p-4 space-y-2 flex flex-col justify-between">
              <div>
                <label className="block font-bold text-foreground mb-1 text-xs">
                  تصویر نحوه اندازه‌گیری (اختیاری)
                </label>
                <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
                  می‌توانید دیاگرام یا نقشه راهنمای اندازه‌گیری را جهت راهنمایی دقیق‌تر مشتری آپلود کنید.
                </p>
              </div>

              <ImagePicker
                multiple={false}
                value={imageUrl}
                onChange={setImageUrl}
                label="آپلود یا انتخاب دیاگرام اندازه‌گیری"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: EDITABLE TABLE BUILDER */}
        <div className="bg-background border border-border rounded-2xl p-4 sm:p-6 space-y-4 shadow-xs">
          {/* Toolbar Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border">
            <div>
              <h2 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>ساختار جدول اندازه‌ها</span>
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                تعداد {columns.length} ستون و {rows.length} ردیف فعال می‌باشد.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsAddColumnOpen(true)}
                className="flex-1 sm:flex-none h-9 px-3.5 bg-primary/10 text-primary hover:bg-primary/20 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن ستون</span>
              </button>

              <button
                type="button"
                onClick={handleAddRow}
                className="flex-1 sm:flex-none h-9 px-4 bg-primary text-primary-foreground hover:bg-primary-hover font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن ردیف</span>
              </button>
            </div>
          </div>

          {/* Add Column Interactive Form */}
          {isAddColumnOpen && (
            <div className="p-3.5 bg-surface-subtle border border-primary/40 rounded-xl flex flex-col sm:flex-row items-center gap-2 animate-fade-in shadow-2xs">
              <input
                type="text"
                placeholder="عنوان ستون جدید (مثلاً: قد لباس، عرض شانه)..."
                value={newColumnLabel}
                onChange={(e) => setNewColumnLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddColumn();
                  }
                }}
                autoFocus
                className="w-full sm:flex-1 h-10 px-3.5 bg-background border border-border rounded-lg text-foreground font-bold text-xs"
              />
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleAddColumn}
                  className="flex-1 sm:flex-none h-10 px-5 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary-hover shadow-xs"
                >
                  افزودن
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddColumnOpen(false)}
                  className="flex-1 sm:flex-none h-10 px-3.5 bg-background border border-border font-bold rounded-lg text-muted-foreground hover:text-foreground"
                >
                  انصراف
                </button>
              </div>
            </div>
          )}

          {/* Spreadsheet Responsive Table Container */}
          <div className="border border-border rounded-xl overflow-hidden bg-background shadow-xs">
            <div className="overflow-x-auto max-w-full">
              <table className="w-full min-w-[650px] text-right border-collapse">
                <thead>
                  <tr className="bg-surface-subtle border-b border-border text-foreground">
                    <th className="py-2.5 px-3 text-center text-muted-foreground w-12 border-l border-border font-bold text-xs">
                      #
                    </th>
                    {columns.map((col, cIdx) => (
                      <th
                        key={col.id}
                        className="py-3 px-3 border-l border-border min-w-[150px] group bg-surface-subtle/80"
                      >
                        <div className="flex flex-col space-y-1.5">
                          <input
                            type="text"
                            value={col.label}
                            onChange={(e) => handleRenameColumn(col.id, e.target.value)}
                            className="w-full h-8 px-2.5 bg-background border border-border focus:border-primary rounded-md text-xs font-bold text-foreground"
                            placeholder="نام ستون..."
                          />

                          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveColumn(cIdx, "right")}
                                disabled={cIdx === 0}
                                className="p-1 hover:text-foreground disabled:opacity-20"
                                title="انتقال به راست"
                              >
                                <MoveRight className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveColumn(cIdx, "left")}
                                disabled={cIdx === columns.length - 1}
                                className="p-1 hover:text-foreground disabled:opacity-20"
                                title="انتقال به چپ"
                              >
                                <MoveLeft className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteColumn(col.id)}
                              className="p-1 hover:text-error text-muted-foreground transition-colors"
                              title="حذف ستون"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </th>
                    ))}
                    <th className="py-2.5 px-3 text-center w-24 font-bold text-muted-foreground text-xs">
                      عملیات
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columns.length + 2}
                        className="py-12 text-center text-muted-foreground space-y-3"
                      >
                        <p className="font-bold text-xs">هیچ ردیفی در جدول وجود ندارد!</p>
                        <button
                          type="button"
                          onClick={handleAddRow}
                          className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-bold hover:bg-primary/20 text-xs transition-colors inline-block"
                        >
                          + افزودن اولین ردیف
                        </button>
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, rIdx) => (
                      <tr
                        key={row.id}
                        className="hover:bg-surface-subtle/30 transition-colors"
                      >
                        <td className="py-2.5 px-2 text-center text-muted-foreground border-l border-border font-medium">
                          <div className="flex flex-col items-center justify-center gap-0.5">
                            <span className="text-[11px] font-extrabold text-foreground">
                              {rIdx + 1}
                            </span>
                            <div className="flex items-center gap-0.5 text-muted-foreground">
                              <button
                                type="button"
                                onClick={() => handleMoveRow(rIdx, "up")}
                                disabled={rIdx === 0}
                                className="hover:text-foreground disabled:opacity-20 p-0.5"
                                title="انتقال به بالا"
                              >
                                <MoveUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveRow(rIdx, "down")}
                                disabled={rIdx === rows.length - 1}
                                className="hover:text-foreground disabled:opacity-20 p-0.5"
                                title="انتقال به پایین"
                              >
                                <MoveDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </td>

                        {columns.map((col) => (
                          <td key={col.id} className="p-1.5 border-l border-border">
                            <input
                              type="text"
                              value={row.cells[col.id] || ""}
                              onChange={(e) =>
                                handleCellChange(row.id, col.id, e.target.value)
                              }
                              placeholder="—"
                              className="w-full h-9 px-2.5 bg-background border border-border/70 focus:border-primary rounded-lg text-xs font-semibold text-foreground dir-auto"
                            />
                          </td>
                        ))}

                        <td className="p-1.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDuplicateRow(rIdx)}
                              className="p-1.5 rounded-lg hover:bg-surface-subtle text-muted-foreground hover:text-foreground transition-colors"
                              title="تکثیر ردیف"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(rIdx)}
                              className="p-1.5 rounded-lg hover:bg-error/10 text-muted-foreground hover:text-error transition-colors"
                              title="حذف ردیف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-muted-foreground pt-1">
            <span>💡 پس از تکمیل خانه سلول‌ها، دکمه ذخیره روی محصول را فشار دهید.</span>
            <button
              type="button"
              onClick={handleAddRow}
              className="font-bold text-primary hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ افزودن ردیف جدید</span>
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS BAR FOR MOBILE & DESKTOP */}
      <footer className="sticky bottom-0 z-20 bg-background border-t border-border px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <button
          type="button"
          onClick={handleOpenSaveTemplateModal}
          className="h-10 px-4 bg-surface-subtle border border-border hover:bg-surface-muted text-foreground font-bold rounded-xl flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
        >
          <BookmarkPlus className="w-4 h-4 text-primary" />
          <span>ذخیره به عنوان قالب جدید</span>
        </button>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 bg-surface-subtle border border-border text-muted-foreground hover:text-foreground font-bold rounded-xl transition-colors flex-1 sm:flex-none"
          >
            انصراف
          </button>

          <button
            type="button"
            onClick={handleSaveForProduct}
            className="h-10 px-6 bg-primary text-primary-foreground hover:bg-primary-hover font-extrabold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors text-xs flex-1 sm:flex-none"
          >
            <Save className="w-4 h-4" />
            <span>ثبت و ذخیره روی محصول</span>
          </button>
        </div>
      </footer>

      {/* SAVE AS TEMPLATE MODAL */}
      {isSaveTemplateModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setIsSaveTemplateModalOpen(false)}
          />
          <div className="relative bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 z-10 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <BookmarkPlus className="w-4 h-4 text-primary" />
                <span>ذخیره جدول به عنوان قالب عمومی</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsSaveTemplateModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-foreground mb-1.5">
                  نام قالب جدید *
                </label>
                <input
                  type="text"
                  value={templateNameInput}
                  onChange={(e) => setTemplateNameInput(e.target.value)}
                  className="w-full h-10 px-3.5 bg-surface-subtle border border-border rounded-xl text-foreground focus:outline-none focus:border-primary font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1.5">
                  توضیحات کوتاه قالب
                </label>
                <textarea
                  rows={3}
                  value={templateDescInput}
                  onChange={(e) => setTemplateDescInput(e.target.value)}
                  className="w-full p-3 bg-surface-subtle border border-border rounded-xl text-foreground focus:outline-none focus:border-primary font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setIsSaveTemplateModalOpen(false)}
                className="h-9 px-4 rounded-xl bg-surface-subtle border border-border font-bold text-muted-foreground hover:text-foreground"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleConfirmSaveAsTemplate}
                className="h-9 px-5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary-hover shadow-xs"
              >
                ذخیره قالب
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
