"use client";

import React, { useState, useRef } from "react";
import { Order, TicketAttachment } from "@/types/account";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Paperclip, X, FileText, Image as ImageIcon, Send, ArrowRight } from "lucide-react";

interface TicketFormProps {
  orders: Order[];
  onCancel: () => void;
  onSubmit: (data: {
    subject: string;
    orderId?: string;
    orderNumber?: string;
    message: string;
    attachments?: TicketAttachment[];
  }) => void;
}

export function TicketForm({ orders, onCancel, onSubmit }: TicketFormProps) {
  const [subject, setSubject] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (!message.trim()) newErrors.message = "لطفاً متن توضیحات مشکل را بنویسید.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const matchedOrder = orders.find((o) => o.id === selectedOrderId);

    onSubmit({
      subject: subject.trim(),
      orderId: matchedOrder?.id,
      orderNumber: matchedOrder?.orderNumber,
      message: message.trim(),
      attachments: attachments.length > 0 ? attachments : undefined,
    });
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 sm:p-6 space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-lg bg-surface-subtle flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <h3 className="text-base sm:text-lg font-bold text-foreground">
            ثبت تیکت پشتیبانی جدید
          </h3>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="موضوع تیکت"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          error={errors.subject}
          placeholder="مثلاً: سوال درباره زمان ارسال یا مرجوعی"
          autoFocus
        />

        {/* Optional Order Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">
            سفارش مرتبط (اختیاری)
          </label>
          <select
            value={selectedOrderId}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            className="w-full h-11 bg-surface-subtle border border-border rounded-xl px-3 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary focus:bg-background transition-colors"
          >
            <option value="">بدون انتخاب سفارش خاص</option>
            {orders.map((ord) => (
              <option key={ord.id} value={ord.id}>
                سفارش #{ord.orderNumber} ({ord.createdAt}) - {ord.payableTotal.toLocaleString("fa-IR")} تومان
              </option>
            ))}
          </select>
        </div>

        {/* Message Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">متن پیام و توضیحات</label>
          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="توضیحات دقیق مشکل خود را بنویسید..."
            className={`w-full bg-surface-subtle border rounded-xl p-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:bg-background transition-colors ${
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
            <span>پیوست فایل / عکس مدارک (اختیاری)</span>
            <span className="text-[11px] font-normal text-muted-foreground">
              حداکثر ۵ مگابایت (PNG, JPG, PDF)
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
            <Paperclip className="w-3 h-3" />
            <span className="text-xs font-medium">برای بارگذاری فایل کلیک کنید</span>
          </button>

          {/* Attachments Preview List */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="px-3 py-2 bg-surface-subtle border border-border rounded-xl flex items-center gap-2 text-xs text-foreground group"
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
                    className="text-muted-foreground hover:text-error transition-colors ml-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl bg-surface-subtle text-foreground text-xs font-bold hover:bg-surface-muted transition-colors cursor-pointer"
          >
            انصراف
          </button>
          <Button type="submit" size="md" className="font-bold cursor-pointer">
            <Send className="w-4 h-4 ml-1.5" />
            ارسال تیکت
          </Button>
        </div>
      </form>
    </div>
  );
}
