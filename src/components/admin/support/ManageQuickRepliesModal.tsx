"use client";

import React, { useState } from "react";
import { QuickReply, SupportCategory, supportCategoryLabels } from "@/types/support";
import { supportService } from "@/lib/support/supportService";
import { X, Plus, Edit2, Trash2, Power, Check } from "lucide-react";

interface ManageQuickRepliesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function ManageQuickRepliesModal({
  isOpen,
  onClose,
  onUpdated,
}: ManageQuickRepliesModalProps) {
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>(() =>
    supportService.getAllQuickReplies()
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<SupportCategory>("other");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const refreshList = () => {
    const list = supportService.getAllQuickReplies();
    setQuickReplies(list);
    onUpdated();
  };

  const handleStartCreate = () => {
    setEditingId("new");
    setTitle("");
    setMessage("");
    setCategory("other");
    setError("");
  };

  const handleStartEdit = (qr: QuickReply) => {
    setEditingId(qr.id);
    setTitle(qr.title);
    setMessage(qr.message);
    setCategory(qr.category || "other");
    setError("");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError("لطفاً عنوان و متن پیام آماده را وارد کنید.");
      return;
    }

    if (editingId === "new") {
      supportService.createQuickReply({
        title: title.trim(),
        message: message.trim(),
        category,
      });
    } else if (editingId) {
      supportService.updateQuickReply(editingId, {
        title: title.trim(),
        message: message.trim(),
        category,
      });
    }

    setEditingId(null);
    refreshList();
  };

  const handleToggle = (id: string) => {
    supportService.toggleQuickReply(id);
    refreshList();
  };

  const handleDelete = (id: string) => {
    if (confirm("آیا از حذف این پیام آماده اطمینان دارید؟")) {
      supportService.deleteQuickReply(id);
      refreshList();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-xl overflow-hidden shadow-xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface-subtle">
          <div>
            <h3 className="text-sm font-bold text-foreground">مدیریت پیام‌های آماده (Quick Replies)</h3>
            <p className="text-[11px] text-muted-foreground">
              افزودن، ویرایش و فعال/غیرفعال‌سازی متن‌های پاسخ سریع ادمین
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {editingId ? (
            /* Form for Create / Edit */
            <form onSubmit={handleSave} className="bg-surface-subtle border border-border p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-foreground">
                {editingId === "new" ? "افزودن پیام آماده جدید" : "ویرایش پیام آماده"}
              </h4>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground">عنوان کوتاه</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثلاً: اعلام کد رهگیری پستی"
                  className="w-full h-9 bg-surface border border-border rounded-lg px-3 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground">دسته‌بندی مرتبط</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SupportCategory)}
                  className="w-full h-9 bg-surface border border-border rounded-lg px-3 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer"
                >
                  {(Object.keys(supportCategoryLabels) as SupportCategory[]).map((cKey) => (
                    <option key={cKey} value={cKey}>
                      {supportCategoryLabels[cKey]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground">متن پیام آماده</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="متن کامل پاسخ را بنویسید..."
                  className="w-full bg-surface border border-border rounded-lg p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              {error && <p className="text-[11px] text-error">{error}</p>}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-bold text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-hover transition-colors cursor-pointer"
                >
                  ذخیره
                </button>
              </div>
            </form>
          ) : (
            <>
              <button
                type="button"
                onClick={handleStartCreate}
                className="w-full py-2.5 rounded-xl border border-dashed border-primary text-primary hover:bg-primary/5 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن پیام آماده جدید</span>
              </button>

              <div className="space-y-2">
                {quickReplies.map((qr) => (
                  <div
                    key={qr.id}
                    className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${
                      qr.isActive
                        ? "bg-surface border-border"
                        : "bg-surface-subtle border-border-subtle opacity-60"
                    }`}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">{qr.title}</span>
                        {qr.category && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-surface-subtle border border-border text-muted-foreground">
                            {supportCategoryLabels[qr.category] || qr.category}
                          </span>
                        )}
                        {!qr.isActive && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 font-bold">
                            غیرفعال
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {qr.message}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggle(qr.id)}
                        className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                          qr.isActive
                            ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                            : "bg-surface text-muted-foreground border-border"
                        }`}
                        title={qr.isActive ? "غیرفعال کردن" : "فعال کردن"}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartEdit(qr)}
                        className="p-1.5 rounded-lg bg-surface border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="ویرایش"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(qr.id)}
                        className="p-1.5 rounded-lg bg-surface border border-border text-muted-foreground hover:text-error transition-colors cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-surface-subtle flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-surface border border-border text-xs font-bold text-foreground hover:bg-surface-muted transition-colors cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}
