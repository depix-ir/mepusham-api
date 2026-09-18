"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  Check,
  LayoutGrid,
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
  Calendar,
  Layers,
  FileSpreadsheet,
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

export interface SizeGuideTemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (sizeGuideSnapshot: SizeGuide) => void;
  onCreateNewTemplateClick?: () => void;
}

export function SizeGuideTemplatePickerModal({
  isOpen,
  onClose,
  onSelectTemplate,
  onCreateNewTemplateClick,
}: SizeGuideTemplatePickerModalProps) {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState<SizeGuideTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

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

  const activeSelectedTemplate = templates.find((t) => t.id === selectedTemplateId) || filteredTemplates[0] || null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-background border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col z-10 overflow-hidden text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-subtle/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                انتخاب قالب آماده راهنمای سایز
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                یک قالب انتخاب کنید تا یک نسخه مستقل برای این محصول ساخته شود.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Toolbar */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-background">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="جستجو در نام یا توضیحات قالب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pr-9 pl-3 bg-surface-subtle border border-border rounded-lg text-foreground focus:outline-none focus:border-primary text-xs"
            />
          </div>

          {onCreateNewTemplateClick && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onCreateNewTemplateClick();
              }}
              className="h-9 px-3.5 bg-surface-subtle border border-border hover:bg-surface-muted text-foreground font-bold rounded-lg flex items-center gap-1.5 transition-colors shrink-0 w-full sm:w-auto justify-center"
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
              <span>ایجاد قالب جدید</span>
            </button>
          )}
        </div>

        {/* Content Body: Split View (Templates List + Interactive Preview) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 min-h-0 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-border">
          {/* Templates Column */}
          <div className="md:col-span-5 p-4 overflow-y-auto space-y-2.5 max-h-[400px] md:max-h-none">
            {filteredTemplates.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground space-y-2">
                <FileSpreadsheet className="w-8 h-8 mx-auto text-muted-foreground/40" />
                <p className="font-semibold text-xs">هیچ قالبی پیدا نشد!</p>
              </div>
            ) : (
              filteredTemplates.map((tpl) => {
                const isSelected = activeSelectedTemplate?.id === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`group relative p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-xs"
                        : "border-border bg-surface-subtle/50 hover:border-border/80 hover:bg-surface-subtle"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="font-bold text-foreground text-xs leading-snug">
                        {tpl.name}
                      </h3>
                      {isSelected && (
                        <span className="p-0.5 rounded-full bg-primary text-primary-foreground shrink-0">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    {tpl.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2.5">
                        {tpl.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-background border border-border font-medium">
                          {tpl.columns.length} ستون
                        </span>
                        <span className="px-2 py-0.5 rounded bg-background border border-border font-medium">
                          {tpl.rows.length} ردیف
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleArchiveTemplate(e, tpl.id, tpl.name)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-error"
                        title="آرشیو قالب"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Preview Column */}
          <div className="md:col-span-7 p-5 bg-surface-subtle/20 overflow-y-auto flex flex-col justify-between space-y-4">
            {activeSelectedTemplate ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-0.5">
                      پیش‌نمایش جدول قالب
                    </span>
                    <h3 className="text-sm font-extrabold text-foreground">
                      {activeSelectedTemplate.name}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApplyTemplate(activeSelectedTemplate)}
                    className="h-9 px-4 bg-primary text-primary-foreground hover:bg-primary-hover font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors text-xs"
                  >
                    <span>استفاده از این قالب</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>

                {activeSelectedTemplate.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {activeSelectedTemplate.description}
                  </p>
                )}

                {/* Structured Table Preview */}
                <div className="border border-border rounded-xl overflow-hidden bg-background shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse text-xs">
                      <thead>
                        <tr className="bg-surface-subtle border-b border-border text-foreground font-bold">
                          {activeSelectedTemplate.columns.map((col) => (
                            <th key={col.id} className="py-2.5 px-3">
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {activeSelectedTemplate.rows.map((row) => (
                          <tr key={row.id} className="hover:bg-surface-subtle/40">
                            {activeSelectedTemplate.columns.map((col) => (
                              <td key={col.id} className="py-2.5 px-3 text-foreground font-medium">
                                {row.cells[col.id] || "-"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {activeSelectedTemplate.notes && (
                  <div className="p-3 rounded-xl bg-surface-subtle border border-border text-[11px] text-muted-foreground leading-relaxed">
                    💡 <span className="font-bold text-foreground">نکته قالب:</span> {activeSelectedTemplate.notes}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-2">
                <Layers className="w-10 h-10 text-muted-foreground/30" />
                <p className="font-bold text-xs">یک قالب از لیست انتخاب کنید تا پیش‌نمایش آن نمایش داده شود.</p>
              </div>
            )}

            {/* Footer Notice */}
            <div className="pt-3 border-t border-border text-[11px] text-muted-foreground flex items-center justify-between">
              <span>
                با انتخاب قالب، یک کپی مستقل برای محصول ایجاد می‌شود.
              </span>
              {activeSelectedTemplate && (
                <button
                  type="button"
                  onClick={() => handleApplyTemplate(activeSelectedTemplate)}
                  className="font-bold text-primary hover:underline"
                >
                  تأیید و اعمال
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
