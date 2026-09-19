"use client";

import React from "react";
import {
  Type,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Quote,
  List,
  Table as TableIcon,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  PlusCircle,
  X,
} from "lucide-react";
import { BlogContentBlock } from "@/types/blog";
import { ImagePicker } from "@/components/admin/ImagePicker";

interface BlogBlockEditorProps {
  value: BlogContentBlock[];
  onChange: (blocks: BlogContentBlock[]) => void;
}

export function BlogBlockEditor({ value, onChange }: BlogBlockEditorProps) {
  const blocks = value || [];

  // Block manipulations
  const addBlock = (block: BlogContentBlock) => {
    onChange([...blocks, block]);
  };

  const updateBlock = (index: number, updatedBlock: BlogContentBlock) => {
    const next = [...blocks];
    next[index] = updatedBlock;
    onChange(next);
  };

  const removeBlock = (index: number) => {
    const next = blocks.filter((_, i) => i !== index);
    onChange(next);
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    onChange(next);
  };

  // Table manipulation helpers
  const addTableRow = (blockIdx: number) => {
    const block = blocks[blockIdx];
    if (block.type !== "table") return;
    const colsCount = block.headers.length || 1;
    const newRow = Array(colsCount).fill("");
    updateBlock(blockIdx, {
      ...block,
      rows: [...block.rows, newRow],
    });
  };

  const removeTableRow = (blockIdx: number, rowIdx: number) => {
    const block = blocks[blockIdx];
    if (block.type !== "table") return;
    const newRows = block.rows.filter((_, i) => i !== rowIdx);
    updateBlock(blockIdx, {
      ...block,
      rows: newRows,
    });
  };

  const addTableColumn = (blockIdx: number) => {
    const block = blocks[blockIdx];
    if (block.type !== "table") return;
    const newHeaders = [...block.headers, `ستون ${block.headers.length + 1}`];
    const newRows = block.rows.map((r) => [...r, ""]);
    updateBlock(blockIdx, {
      ...block,
      headers: newHeaders,
      rows: newRows,
    });
  };

  const removeTableColumn = (blockIdx: number, colIdx: number) => {
    const block = blocks[blockIdx];
    if (block.type !== "table" || block.headers.length <= 1) return;
    const newHeaders = block.headers.filter((_, i) => i !== colIdx);
    const newRows = block.rows.map((r) => r.filter((_, i) => i !== colIdx));
    updateBlock(blockIdx, {
      ...block,
      headers: newHeaders,
      rows: newRows,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <label className="block text-xs font-bold text-foreground">
          محتوای مقاله (بخش‌بندی شده)
        </label>
        <span className="text-[11px] text-muted-foreground">
          تعداد بخش‌ها: {blocks.length}
        </span>
      </div>

      {/* BLOCKS LIST */}
      <div className="space-y-4">
        {blocks.map((block, idx) => (
          <div
            key={idx}
            className="p-4 bg-surface-subtle border border-border rounded-xl space-y-3 relative group"
          >
            {/* Block Header & Controls */}
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                {block.type === "paragraph" && <Type className="w-3.5 h-3.5" />}
                {block.type === "heading" && block.level === 2 && <Heading2 className="w-3.5 h-3.5" />}
                {block.type === "heading" && block.level === 3 && <Heading3 className="w-3.5 h-3.5" />}
                {block.type === "image" && <ImageIcon className="w-3.5 h-3.5" />}
                {block.type === "quote" && <Quote className="w-3.5 h-3.5" />}
                {block.type === "list" && <List className="w-3.5 h-3.5" />}
                {block.type === "table" && <TableIcon className="w-3.5 h-3.5" />}
                <span>
                  {block.type === "paragraph" && "پاراگراف"}
                  {block.type === "heading" && `عنوان (H${block.level})`}
                  {block.type === "image" && "تصویر داخل مقاله"}
                  {block.type === "quote" && "نقل‌قول"}
                  {block.type === "list" && (block.ordered ? "لیست شماره‌دار" : "لیست نقطه‌ای")}
                  {block.type === "table" && "جدول داده‌ها"}
                </span>
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveBlock(idx, "up")}
                  disabled={idx === 0}
                  className="p-1 rounded hover:bg-background text-muted-foreground disabled:opacity-30 cursor-pointer"
                  title="انتقال به بالا"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveBlock(idx, "down")}
                  disabled={idx === blocks.length - 1}
                  className="p-1 rounded hover:bg-background text-muted-foreground disabled:opacity-30 cursor-pointer"
                  title="انتقال به پایین"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeBlock(idx)}
                  className="p-1 rounded hover:bg-error/10 text-muted-foreground hover:text-error transition-colors cursor-pointer"
                  title="حذف این بخش"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* BLOCK EDITORS */}

            {/* 1. Paragraph Block */}
            {block.type === "paragraph" && (
              <textarea
                rows={3}
                value={block.text}
                onChange={(e) => updateBlock(idx, { ...block, text: e.target.value })}
                placeholder="متن پاراگراف را وارد کنید..."
                className="w-full p-3 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary leading-relaxed"
              />
            )}

            {/* 2. Heading Block */}
            {block.type === "heading" && (
              <div className="flex gap-2">
                <select
                  value={block.level}
                  onChange={(e) =>
                    updateBlock(idx, {
                      ...block,
                      level: parseInt(e.target.value, 10) as 2 | 3,
                    })
                  }
                  className="h-9 px-2 bg-background border border-border rounded-lg text-xs font-bold text-foreground"
                >
                  <option value={2}>H2 (اصلی)</option>
                  <option value={3}>H3 (فرعی)</option>
                </select>
                <input
                  type="text"
                  value={block.text}
                  onChange={(e) => updateBlock(idx, { ...block, text: e.target.value })}
                  placeholder="عنوان بخش..."
                  className="flex-1 h-9 px-3 bg-background border border-border rounded-lg text-xs font-bold text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            )}

            {/* 3. Image Block */}
            {block.type === "image" && (
              <div className="space-y-3">
                <ImagePicker
                  value={block.src}
                  onChange={(url) => updateBlock(idx, { ...block, src: url })}
                  label="تصویر بخش"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={block.alt}
                    onChange={(e) => updateBlock(idx, { ...block, alt: e.target.value })}
                    placeholder="متن جایگزین (Alt)"
                    className="h-9 px-3 bg-background border border-border rounded-lg text-xs text-foreground"
                  />
                  <input
                    type="text"
                    value={block.caption || ""}
                    onChange={(e) => updateBlock(idx, { ...block, caption: e.target.value })}
                    placeholder="زیرنویس/توضیح تصویر (اختیاری)"
                    className="h-9 px-3 bg-background border border-border rounded-lg text-xs text-foreground"
                  />
                </div>
              </div>
            )}

            {/* 4. Quote Block */}
            {block.type === "quote" && (
              <textarea
                rows={2}
                value={block.text}
                onChange={(e) => updateBlock(idx, { ...block, text: e.target.value })}
                placeholder="متن نقل‌قول..."
                className="w-full p-3 bg-background border border-border rounded-lg text-xs italic font-medium text-foreground focus:outline-none focus:border-primary"
              />
            )}

            {/* 5. List Block */}
            {block.type === "list" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <label className="text-[11px] font-bold text-foreground">نوع لیست:</label>
                  <button
                    type="button"
                    onClick={() => updateBlock(idx, { ...block, ordered: false })}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                      !block.ordered ? "bg-primary text-primary-foreground" : "bg-background border border-border"
                    }`}
                  >
                    نقطه‌ای (Unordered)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateBlock(idx, { ...block, ordered: true })}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                      block.ordered ? "bg-primary text-primary-foreground" : "bg-background border border-border"
                    }`}
                  >
                    شماره‌دار (Ordered)
                  </button>
                </div>

                {block.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-4 text-center">
                      {block.ordered ? `${itemIdx + 1}.` : "•"}
                    </span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const newItems = [...block.items];
                        newItems[itemIdx] = e.target.value;
                        updateBlock(idx, { ...block, items: newItems });
                      }}
                      placeholder={`آیتم ${itemIdx + 1}`}
                      className="flex-1 h-8 px-3 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newItems = block.items.filter((_, i) => i !== itemIdx);
                        updateBlock(idx, { ...block, items: newItems });
                      }}
                      className="p-1 text-muted-foreground hover:text-error"
                      title="حذف این آیتم"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    updateBlock(idx, {
                      ...block,
                      items: [...block.items, ""],
                    })
                  }
                  className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 pt-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>افزودن آیتم جدید</span>
                </button>
              </div>
            )}

            {/* 6. Table Block */}
            {block.type === "table" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-foreground">
                  <span>جدول داده‌ها</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => addTableColumn(idx)}
                      className="px-2 py-1 rounded bg-background border border-border hover:border-primary text-primary font-bold"
                    >
                      + افزودن ستون
                    </button>
                    <button
                      type="button"
                      onClick={() => addTableRow(idx)}
                      className="px-2 py-1 rounded bg-background border border-border hover:border-primary text-primary font-bold"
                    >
                      + افزودن ردیف
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto border border-border rounded-lg bg-background p-2 space-y-2">
                  {/* Headers row */}
                  <div className="flex gap-2 pb-2 border-b border-border font-bold">
                    {block.headers.map((h, hIdx) => (
                      <div key={hIdx} className="flex-1 min-w-[120px] flex items-center gap-1">
                        <input
                          type="text"
                          value={h}
                          onChange={(e) => {
                            const newHeaders = [...block.headers];
                            newHeaders[hIdx] = e.target.value;
                            updateBlock(idx, { ...block, headers: newHeaders });
                          }}
                          placeholder={`سرستون ${hIdx + 1}`}
                          className="w-full h-8 px-2 bg-surface-subtle border border-border rounded text-xs font-bold text-foreground"
                        />
                        {block.headers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTableColumn(idx, hIdx)}
                            className="text-muted-foreground hover:text-error p-1"
                            title="حذف ستون"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Rows */}
                  {block.rows.map((row, rIdx) => (
                    <div key={rIdx} className="flex gap-2 items-center">
                      {row.map((cell, cIdx) => (
                        <div key={cIdx} className="flex-1 min-w-[120px]">
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) => {
                              const newRows = [...block.rows];
                              const newRow = [...newRows[rIdx]];
                              newRow[cIdx] = e.target.value;
                              newRows[rIdx] = newRow;
                              updateBlock(idx, { ...block, rows: newRows });
                            }}
                            placeholder="مقدار..."
                            className="w-full h-8 px-2 bg-background border border-border rounded text-xs text-foreground"
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => removeTableRow(idx, rIdx)}
                        className="text-muted-foreground hover:text-error p-1"
                        title="حذف ردیف"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ADD NEW BLOCK BUTTONS */}
      <div className="p-4 bg-surface-subtle/50 border-2 border-dashed border-border rounded-xl space-y-2">
        <span className="block text-xs font-bold text-foreground text-center mb-2">
          + افزودن بخش جدید به مقاله
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => addBlock({ type: "paragraph", text: "" })}
            className="h-8 px-3 rounded-lg bg-background border border-border hover:border-primary text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Type className="w-3.5 h-3.5 text-primary" />
            <span>پاراگراف</span>
          </button>

          <button
            type="button"
            onClick={() => addBlock({ type: "heading", level: 2, text: "" })}
            className="h-8 px-3 rounded-lg bg-background border border-border hover:border-primary text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Heading2 className="w-3.5 h-3.5 text-primary" />
            <span>عنوان (H2)</span>
          </button>

          <button
            type="button"
            onClick={() =>
              addBlock({ type: "image", src: "", alt: "", caption: "" })
            }
            className="h-8 px-3 rounded-lg bg-background border border-border hover:border-primary text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5 text-primary" />
            <span>تصویر</span>
          </button>

          <button
            type="button"
            onClick={() => addBlock({ type: "quote", text: "" })}
            className="h-8 px-3 rounded-lg bg-background border border-border hover:border-primary text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Quote className="w-3.5 h-3.5 text-primary" />
            <span>نقل‌قول</span>
          </button>

          <button
            type="button"
            onClick={() =>
              addBlock({ type: "list", ordered: false, items: [""] })
            }
            className="h-8 px-3 rounded-lg bg-background border border-border hover:border-primary text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <List className="w-3.5 h-3.5 text-primary" />
            <span>لیست</span>
          </button>

          <button
            type="button"
            onClick={() =>
              addBlock({
                type: "table",
                headers: ["عنوان ۱", "عنوان ۲"],
                rows: [["مقدار ۱", "مقدار ۲"]],
              })
            }
            className="h-8 px-3 rounded-lg bg-background border border-border hover:border-primary text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <TableIcon className="w-3.5 h-3.5 text-primary" />
            <span>جدول</span>
          </button>
        </div>
      </div>
    </div>
  );
}
