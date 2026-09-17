"use client";

import React, { useState } from "react";
import { X, User, Phone } from "lucide-react";

interface EditCustomerModalProps {
  isOpen: boolean;
  customerId: string;
  initialFirstName: string;
  initialLastName: string;
  initialPhone: string;
  onClose: () => void;
  onSave: (payload: { firstName: string; lastName: string; phone: string }) => void;
}

export function EditCustomerModal({
  isOpen,
  initialFirstName,
  initialLastName,
  initialPhone,
  onClose,
  onSave,
}: EditCustomerModalProps) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [phone, setPhone] = useState(initialPhone);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError("لطفاً نام و نام خانوادگی مشتری را وارد کنید.");
      return;
    }
    if (!phone.trim()) {
      setError("شماره موبایل نمی‌تواند خالی باشد.");
      return;
    }

    onSave({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-surface border border-border rounded-2xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-customer-modal-title"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 font-bold text-base text-foreground" id="edit-customer-modal-title">
            <User className="w-5 h-5 text-primary" />
            <span>ویرایش اطلاعات مشتری</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors cursor-pointer"
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-muted-foreground font-bold">نام</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                setError("");
              }}
              className="w-full h-10 bg-surface-subtle border border-border rounded-xl px-3 text-xs text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-muted-foreground font-bold">نام خانوادگی</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                setError("");
              }}
              className="w-full h-10 bg-surface-subtle border border-border rounded-xl px-3 text-xs text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-muted-foreground font-bold">شماره موبایل</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError("");
                }}
                className="w-full h-10 bg-surface-subtle border border-border rounded-xl px-3 pl-9 text-xs text-foreground font-mono dir-ltr focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-foreground bg-surface-subtle hover:bg-surface-muted rounded-xl transition-colors cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition-colors cursor-pointer"
            >
              ذخیره تغییرات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
