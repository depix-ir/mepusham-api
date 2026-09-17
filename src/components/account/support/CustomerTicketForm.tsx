"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Order, TicketAttachment } from "@/types/account";
import {
  SupportCategory,
  SupportPriority,
  supportCategoryLabels,
  supportPriorityLabels,
} from "@/types/support";
import { supportService } from "@/lib/support/supportService";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  ArrowRight,
  Send,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  Package,
} from "lucide-react";

interface CustomerTicketFormProps {
  orders: Order[];
  defaultOrderId?: string;
  defaultReturnId?: string;
  defaultCategory?: SupportCategory;
}

export function CustomerTicketForm({
  orders,
  defaultOrderId,
  defaultReturnId,
  defaultCategory,
}: CustomerTicketFormProps) {
  const router = useRouter();

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<SupportCategory>(
    defaultCategory || (defaultReturnId ? "return" : defaultOrderId ? "order" : "other")
  );
  const [priority, setPriority] = useState<SupportPriority>("normal");
  const [selectedOrderId, setSelectedOrderId] = useState<string>(defaultOrderId || "");
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: TicketAttachment[] = Array.from(files).map((file, idx) => ({
      id: `file-${Date.now()}-${idx}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!subject.trim()) newErrors.subject = "لطفاً موضوع تیکت را وارد کنید.";
    if (!message.trim()) newErrors.message = "لطفاً شرح کامل مسئله را بنویسید.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const matchedOrder = orders.find((o) => o.id === selectedOrderId || o.orderNumber === selectedOrderId);

      const createdTicket = supportService.createTicket({
        subject: subject.trim(),
        category,
        priority,
        orderId: matchedOrder?.id || (selectedOrderId ? selectedOrderId : undefined),
        orderNumber: matchedOrder?.orderNumber || (selectedOrderId ? selectedOrderId : undefined),
        returnId: defaultReturnId,
        message: message.trim(),
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      // Redirect directly to ticket detail
      router.push(`/account/support/${createdTicket.id}`);
    } catch (err) {
      console.error("Error creating ticket:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 space-y-6 shadow-2xs max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-surface-subtle border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-foreground">
              ثبت تیکت پشتیبانی جدید
            </h1>
            <p className="text-xs text-muted-foreground">
              پیام شما بررسی شده و بلافاصله تاییدیه ثبت دریافت می‌کنید
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Subject */}
        <Input
          label="موضوع تیکت"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          error={errors.subject}
          placeholder="مثلاً: درخواست پیگیری ارسال یا سوال درباره سایز"
          autoFocus
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">دسته‌بندی موضوع</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SupportCategory)}
              className="w-full h-11 bg-surface-subtle border border-border rounded-xl px-3 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              {(Object.keys(supportCategoryLabels) as SupportCategory[]).map((catKey) => (
                <option key={catKey} value={catKey}>
                  {supportCategoryLabels[catKey]}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">اولویت درخواست</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as SupportPriority)}
              className="w-full h-11 bg-surface-subtle border border-border rounded-xl px-3 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              {(Object.keys(supportPriorityLabels) as SupportPriority[]).map((pKey) => (
                <option key={pKey} value={pKey}>
                  {supportPriorityLabels[pKey]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Optional Order Select */}
        {orders.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>سفارش مرتبط (اختیاری)</span>
              {selectedOrderId && (
                <span className="text-[11px] text-primary font-mono font-bold">
                  سفارش انتخاب شد
                </span>
              )}
            </label>
            <div className="relative">
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="w-full h-11 bg-surface-subtle border border-border rounded-xl pl-3 pr-9 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option value="">بدون انتخاب سفارش خاص</option>
                {orders.map((ord) => (
                  <option key={ord.id} value={ord.id}>
                    سفارش #{ord.orderNumber} ({ord.createdAt}) - {ord.payableTotal.toLocaleString("fa-IR")} تومان
                  </option>
                ))}
              </select>
              <Package className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Return ID indicator if preset */}
        {defaultReturnId && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-800 flex items-center gap-2">
            <Package className="w-4 h-4 shrink-0" />
            <span>
              این تیکت به‌صورت خودکار به درخواست مرجوعی شماره{" "}
              <strong className="font-mono">{defaultReturnId}</strong> متصل شد.
            </span>
          </div>
        )}

        {/* Message Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">متن پیام و شرح کامل</label>
          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="توضیحات دقیق مسئله یا سوال خود را بنویسید..."
            className={`w-full bg-surface-subtle border rounded-xl p-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors ${
              errors.message ? "border-error focus:border-error" : "border-border"
            }`}
          />
          {errors.message && (
            <span className="text-xs text-error">{errors.message}</span>
          )}
        </div>

        {/* Attachment Upload Section */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground flex items-center justify-between">
            <span>پیوست تصویر یا فایل (اختیاری)</span>
            <span className="text-[11px] font-normal text-muted-foreground">
              تصویر کالا یا رسید پرداخت (PNG, JPG, PDF)
            </span>
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*,.pdf"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-20 border border-dashed border-border hover:border-primary rounded-xl flex flex-col items-center justify-center gap-1.5 bg-surface-subtle/40 hover:bg-surface-subtle transition-colors cursor-pointer text-muted-foreground hover:text-primary"
          >
            <Paperclip className="w-4 h-4" />
            <span className="text-xs font-medium">برای بارگذاری فایل کلیک کنید</span>
          </button>

          {/* Attachments Preview List */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="px-3 py-2 bg-surface-subtle border border-border rounded-xl flex items-center gap-2 text-xs text-foreground"
                >
                  {att.type.startsWith("image/") ? (
                    <ImageIcon className="w-4 h-4 text-primary shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                  )}
                  <span className="truncate max-w-[140px] font-mono text-[11px]">
                    {att.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(att.id)}
                    className="text-muted-foreground hover:text-error transition-colors mr-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Footer Actions */}
        <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2.5 rounded-xl bg-surface-subtle text-foreground text-xs font-bold hover:bg-surface-muted transition-colors cursor-pointer"
          >
            انصراف
          </button>
          <Button
            type="submit"
            size="md"
            className="font-bold cursor-pointer"
            disabled={isSubmitting}
          >
            <Send className="w-4 h-4 ml-1.5" />
            {isSubmitting ? "در حال ثبت..." : "ثبت و ارسال تیکت"}
          </Button>
        </div>
      </form>
    </div>
  );
}
