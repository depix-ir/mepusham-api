"use client";

import React, { useState, useEffect } from "react";
import { Order } from "@/types/account";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { X, HelpCircle, Send } from "lucide-react";

interface CreateTicketModalProps {
  orders: Order[];
  prefilledOrder?: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { subject: string; orderId?: string; orderNumber?: string; message: string }) => void;
}

export function CreateTicketModal({
  orders,
  prefilledOrder,
  isOpen,
  onClose,
  onSubmit,
}: CreateTicketModalProps) {
  const [subject, setSubject] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;

    if (prefilledOrder) {
      setSelectedOrderId(prefilledOrder.id);
      setSubject(`پیگیری سفارش #${prefilledOrder.orderNumber}`);
    } else {
      setSelectedOrderId("");
      setSubject("");
    }
    setMessage("");
    setErrors({});
  }, [prefilledOrder, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!subject.trim()) newErrors.subject = "موضوع تیکت را وارد کنید";
    if (!message.trim()) newErrors.message = "متن پیام را وارد کنید";

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
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="create-ticket-title"
    >
      <div
        className="relative w-full max-w-lg bg-background border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle bg-surface-subtle/50">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h3 id="create-ticket-title" className="text-base font-bold text-foreground">
              ایجاد تیکت پشتیبانی جدید
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-surface-subtle transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          <Input
            label="موضوع تیکت"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            error={errors.subject}
            placeholder="مثلاً: سوال درباره ارسال یا کیفیت محصول"
            autoFocus
          />

          {/* Optional Order Select */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">
              سفارش مرتبط (اختیاری)
            </label>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="w-full h-11 bg-surface-subtle border border-transparent rounded-md px-3 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary focus:bg-background transition-colors"
            >
              <option value="">بدون انتخاب سفارش خاص</option>
              {orders.map((ord) => (
                <option key={ord.id} value={ord.id}>
                  سفارش #{ord.orderNumber} ({ord.createdAt})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">متن پیام</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="توضیحات کامل مشکل یا سوال خود را بنویسید..."
              className={`w-full bg-surface-subtle border border-transparent rounded-md p-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:bg-background transition-colors ${
                errors.message ? "border-error focus:border-error" : ""
              }`}
            />
            {errors.message && (
              <span className="text-xs text-error">{errors.message}</span>
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-border-subtle flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-subtle text-foreground text-xs font-bold hover:bg-surface-muted transition-colors cursor-pointer"
            >
              انصراف
            </button>
            <Button type="submit" size="md" className="font-bold cursor-pointer">
              <Send className="w-4 h-4 ml-1" />
              ارسال تیکت
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
