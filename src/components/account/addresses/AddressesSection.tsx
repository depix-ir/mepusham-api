"use client";

import React, { useState } from "react";
import { UserAddress } from "@/types/account";
import { AddressModal } from "./AddressModal";
import { MapPin, Plus, Edit2, Trash2, CheckCircle2 } from "lucide-react";

interface AddressesSectionProps {
  addresses: UserAddress[];
  onSaveAddress: (address: Omit<UserAddress, "id"> & { id?: string }) => void;
  onDeleteAddress: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export function AddressesSection({
  addresses,
  onSaveAddress,
  onDeleteAddress,
  onSetDefault,
}: AddressesSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr: UserAddress) => {
    setEditingAddress(addr);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span>آدرس‌های من</span>
        </h2>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن آدرس جدید</span>
        </button>
      </div>

      {/* Address List */}
      {addresses.length > 0 ? (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-4 rounded-2xl border transition-all ${
                addr.isDefault
                  ? "bg-primary/5 border-primary/40 shadow-2xs"
                  : "bg-background border-border/80 hover:border-border"
              }`}
            >
              <div className="flex items-center justify-between gap-2 border-b border-border-subtle pb-2.5 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-foreground">
                    {addr.title}
                  </span>
                  {addr.isDefault && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>پیش‌فرض</span>
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {!addr.isDefault && (
                    <button
                      type="button"
                      onClick={() => onSetDefault(addr.id)}
                      className="text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                    >
                      انتخاب به عنوان پیش‌فرض
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(addr)}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    aria-label="ویرایش آدرس"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteAddress(addr.id)}
                    className="p-1 text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer"
                    aria-label="حذف آدرس"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Address Details */}
              <div className="space-y-1 text-xs text-foreground/80 leading-relaxed">
                <p className="font-medium">
                  {addr.province}، {addr.city}، {addr.address}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-[11px]">
                  <span>گیرنده: <strong className="text-foreground">{addr.recipientName}</strong></span>
                  <span>شماره تماس: <strong className="text-foreground" dir="ltr">{addr.phone}</strong></span>
                  <span>کد پستی: <strong className="text-foreground" dir="ltr">{addr.postalCode}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 border border-dashed border-border rounded-2xl text-center space-y-3 bg-surface-subtle/30">
          <p className="text-xs text-muted-foreground">هنوز آدرسی ثبت نکرده‌اید.</p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-hover transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت اولین آدرس</span>
          </button>
        </div>
      )}

      {/* Address Edit/Add Modal */}
      <AddressModal
        address={editingAddress}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveAddress}
      />
    </div>
  );
}
