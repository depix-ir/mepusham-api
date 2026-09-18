"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Search,
  Check,
  LayoutGrid,
  Sparkles,
  Plus,
  Trash2,
  Layers,
  FileSpreadsheet,
  Table,
  Eye,
} from "lucide-react";
import {
  SizeGuideTemplate,
  SizeGuide,
} from "@/types/product";
import {
  getSizeGuideTemplates,
  cloneTemplateToSizeGuide,
  archiveSizeGuideTemplate,
} from "@/lib/sizeguide/sizeGuideService";
import { useToast } from "@/components/ui/Toast";

export interface SizeGuideTemplatePickerViewProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (sizeGuideSnapshot: SizeGuide) => void;
  onCreateNewTemplateClick?: () => void;
}

export function SizeGuideTemplatePickerView({
  isOpen,
  onClose,
  onSelectTemplate,
  onCreateNewTemplateClick,
}: SizeGuideTemplatePickerViewProps) {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<SizeGuideTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"list" | "preview">("list");

  // Load templates on open
  useEffect(() => {
    if (isOpen) {
      const list = getSizeGuideTemplates(false);
      setTemplates(list);
      if (list.length > 0 && !selectedTemplateId) {
        setSelectedTemplateId(list[0].id);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeSelectedTemplate =
    templates.find((t) => t.id === selectedTemplateId) || filteredTemplates[0] || null;

  const handleApplyTemplate = (template: SizeGuideTemplate) => {
    try {
      const snapshot = cloneTemplateToSizeGuide(template);
      onSelectTemplate(snapshot);
      showToast(`قالب «${template.name}» با موفقیت برای محصول اعمال شد.`, "success");
      onClose();
    } catch (err: any) {
      showToast(err.message || "خطا در اعمال قالب.", "error");
    }
  };

  const handleArchiveTemplate = (e: React.MouseEvent, templateId: string, templateName: string) => {
    e.stopPropagation();
    if (confirm(`آیا از آرشیو کردن قالب «${templateName}» اطمینان دارید؟`)) {
      archiveSizeGuideTemplate(templateId);
      const updated = getSizeGuideTemplates(false);
      setTemplates(updated);
      showToast(`قالب «${templateName}» آرشیو شد.`, "info");
      if (selectedTemplateId === templateId) {
        setSelectedTemplateId(updated[0]?.id || null);
      }
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
              <LayoutGrid className="w-4 h-4 text-primary shrink-0" />
              <span>انتخاب قالب آماده راهنمای سایز</span>
            </h1>
          </div>
        </div>

        {activeSelectedTemplate && (
          <button
            type="button"
            onClick={() => handleApplyTemplate(activeSelectedTemplate)}
            className="h-9 sm:h-10 px-4 sm:px-5 bg-primary text-primary-foreground hover:bg-primary-hover font-extrabold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors text-xs shrink-0"
          >
            <span>اعمال قالب</span>
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        )}
      </header>

      {/* TOP CONTROLS & SEARCH BAR */}
      <div className="bg-surface-subtle/50 border-b border-border px-4 sm:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="جستجو در قالب‌ها (مثلاً: پیراهن، کفش)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pr-10 pl-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-primary font-medium text-xs shadow-2xs"
          />
        </div>

        {/* Mobile View Toggle Tabs */}
        <div className="flex md:hidden items-center p-1 bg-surface-subtle border border-border rounded-xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setMobileTab("list")}
            className={`flex-1 sm:flex-none h-8 px-4 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors ${
              mobileTab === "list"
                ? "bg-background text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Table className="w-3.5 h-3.5 text-primary" />
            <span>فهرست قالب‌ها ({filteredTemplates.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("preview")}
            className={`flex-1 sm:flex-none h-8 px-4 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors ${
              mobileTab === "preview"
                ? "bg-background text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-primary" />
            <span>پیش‌نمایش</span>
          </button>
        </div>

        {onCreateNewTemplateClick && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onCreateNewTemplateClick();
            }}
            className="h-10 px-4 bg-background border border-border hover:border-primary/60 text-foreground font-bold rounded-xl flex items-center gap-2 transition-colors shrink-0 w-full sm:w-auto justify-center shadow-2xs"
          >
            <Plus className="w-4 h-4 text-primary" />
            <span>ایجاد قالب جدید از صفر</span>
          </button>
        )}
      </div>

      {/* BODY MAIN SPLIT VIEW */}
      <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-border">
        {/* TEMPLATES LIST COLUMN */}
        <div
          className={`md:col-span-5 lg:col-span-4 p-4 sm:p-6 overflow-y-auto space-y-3 bg-background ${
            mobileTab === "preview" ? "hidden md:block" : "block"
          }`}
        >
          <div className="flex items-center justify-between pb-1">
            <span className="font-bold text-foreground text-xs">
              قالب‌های دسترسی‌پذیر ({filteredTemplates.length})
            </span>
            <span className="text-[11px] text-muted-foreground">
              کلیک کنید تا پیش‌نمایش آن در مقابل قرار گیرد
            </span>
          </div>

          {filteredTemplates.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground space-y-3 border border-dashed border-border rounded-2xl bg-surface-subtle/30 my-4">
              <FileSpreadsheet className="w-10 h-10 mx-auto text-muted-foreground/40" />
              <p className="font-bold text-xs">هیچ قالبی مطابق جستجوی شما یافت نشد.</p>
            </div>
          ) : (
            filteredTemplates.map((tpl) => {
              const isSelected = activeSelectedTemplate?.id === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => {
                    setSelectedTemplateId(tpl.id);
                    setMobileTab("preview");
                  }}
                  className={`group relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-xs"
                      : "border-border/80 bg-surface-subtle/40 hover:border-primary/40 hover:bg-surface-subtle"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-lg shrink-0 ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-surface-subtle text-muted-foreground group-hover:text-primary"
                        }`}
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-foreground text-xs sm:text-sm leading-snug">
                        {tpl.name}
                      </h3>
                    </div>

                    {isSelected && (
                      <span className="p-1 rounded-full bg-primary text-primary-foreground shrink-0 shadow-2xs">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  {tpl.description && (
                    <p className="text-muted-foreground text-[11px] leading-relaxed line-clamp-2 mb-3 pr-7">
                      {tpl.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2.5 border-t border-border/60">
                    <div className="flex items-center gap-2 font-medium">
                      <span className="px-2.5 py-0.5 rounded-md bg-background border border-border">
                        {tpl.columns.length} ستون
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-background border border-border">
                        {tpl.rows.length} ردیف
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleArchiveTemplate(e, tpl.id, tpl.name)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-error/10 text-muted-foreground hover:text-error"
                      title="آرشیو قالب"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* PREVIEW COLUMN */}
        <div
          className={`md:col-span-7 lg:col-span-8 p-4 sm:p-8 bg-surface-subtle/20 overflow-y-auto flex flex-col justify-between space-y-6 ${
            mobileTab === "list" ? "hidden md:flex" : "flex"
          }`}
        >
          {activeSelectedTemplate ? (
            <div className="space-y-6 max-w-4xl w-full mx-auto">
              {/* Header Preview Info */}
              <div className="p-5 bg-background border border-border rounded-2xl shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider block mb-1">
                      جزئیات و پیش‌نمایش قالب
                    </span>
                    <h2 className="text-base sm:text-lg font-black text-foreground">
                      {activeSelectedTemplate.name}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApplyTemplate(activeSelectedTemplate)}
                    className="h-10 px-5 bg-primary text-primary-foreground hover:bg-primary-hover font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors text-xs shrink-0"
                  >
                    <span>انتخاب و اعمال این قالب</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>

                {activeSelectedTemplate.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/60 pt-3">
                    {activeSelectedTemplate.description}
                  </p>
                )}
              </div>

              {/* Table Render */}
              <div className="border border-border rounded-2xl overflow-hidden bg-background shadow-xs">
                <div className="p-3 bg-surface-subtle/80 border-b border-border flex items-center justify-between">
                  <span className="font-bold text-foreground text-xs flex items-center gap-2">
                    <Table className="w-4 h-4 text-primary" />
                    <span>جدول اندازه‌گیری کالا</span>
                  </span>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {activeSelectedTemplate.columns.length} ستون × {activeSelectedTemplate.rows.length} ردیف
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse text-xs">
                    <thead>
                      <tr className="bg-surface-subtle border-b border-border text-foreground font-bold">
                        {activeSelectedTemplate.columns.map((col) => (
                          <th key={col.id} className="py-3 px-4 border-l border-border/60 last:border-0">
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {activeSelectedTemplate.rows.map((row) => (
                        <tr key={row.id} className="hover:bg-surface-subtle/40 transition-colors">
                          {activeSelectedTemplate.columns.map((col) => (
                            <td
                              key={col.id}
                              className="py-3 px-4 text-foreground font-semibold border-l border-border/40 last:border-0"
                            >
                              {row.cells[col.id] || "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {activeSelectedTemplate.notes && (
                <div className="p-4 rounded-2xl bg-surface-subtle border border-border text-xs text-muted-foreground leading-relaxed shadow-2xs">
                  💡 <span className="font-bold text-foreground">نکته کاربردی:</span>{" "}
                  {activeSelectedTemplate.notes}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-muted-foreground space-y-3">
              <Layers className="w-12 h-12 text-muted-foreground/30" />
              <p className="font-bold text-sm">یک قالب انتخاب کنید تا پیش‌نمایش جدول آن نمایش داده شود.</p>
            </div>
          )}

          {/* Sticky Mobile / Desktop Action Bar */}
          {activeSelectedTemplate && (
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-background p-4 rounded-2xl border shadow-xs">
              <span className="text-xs text-muted-foreground text-center sm:text-right">
                با انتخاب قالب، یک کپی مستقل اختصاصی برای این محصول ایجاد خواهد شد.
              </span>
              <button
                type="button"
                onClick={() => handleApplyTemplate(activeSelectedTemplate)}
                className="w-full sm:w-auto h-10 px-6 bg-primary text-primary-foreground font-bold rounded-xl shadow-xs hover:bg-primary-hover flex items-center justify-center gap-2"
              >
                <span>تأیید و اعمال روی محصول</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
