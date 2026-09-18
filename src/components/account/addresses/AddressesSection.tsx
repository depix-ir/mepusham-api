"use client";

import React, { useState } from "react";
import { UserAddress } from "@/types/account";
import { AddressModal } from "./AddressModal";
import { toPersianDigits } from "@/lib/formatting/currency";
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
    <div className="space-y-5">
      {/* Section Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <MapPin className=" text-primary shrink-0" />
          <h2 className="text-sm sm:text-base font-bold text-foreground">
            فهرست آدرس‌ها
          </h2>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن آدرس جدید</span>
        </button>
      </div>

      {/* Address List */}
      {addresses.length > 0 ? (
        <div className="space-y-3.5">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                addr.isDefault
                  ? "bg-primary/[0.03] border-primary/40 shadow-2xs"
                  : "bg-background border-border/80 hover:border-border"
              }`}
            >
              <div className="flex items-center justify-between gap-2  pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-foreground">
                    {addr.title}
                  </span>
                  {addr.isDefault && (
                    <span className="text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>پیش‌فرض</span>
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {!addr.isDefault && (
                    <button
                      type="button"
                      onClick={() => onSetDefault(addr.id)}
                      className="text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer font-medium"
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
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteAddress(addr.id)}
                    className="p-1 text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer"
                    aria-label="حذف آدرس"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Address Details */}
              <div className="space-y-2 text-xs sm:text-sm text-foreground/85 leading-relaxed">
                <p className="font-medium">
                  {addr.province}، {addr.city}، {addr.address}
                </p>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-muted-foreground text-[11px] sm:text-xs">
                  <span>
                    گیرنده: <strong className="text-foreground font-semibold">{addr.recipientName}</strong>
                  </span>
                  <span>
                    شماره تماس: <strong className="text-foreground font-semibold" dir="ltr">{toPersianDigits(addr.phone)}</strong>
                  </span>
                  <span>
                    کد پستی: <strong className="text-foreground font-semibold" dir="ltr">{toPersianDigits(addr.postalCode)}</strong>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 px-4 border border-dashed border-border rounded-2xl text-center space-y-3 bg-surface-subtle/30">
          <div className="w-12 h-12 rounded-full bg-surface-muted text-muted-foreground mx-auto flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs sm:text-sm font-bold text-foreground">
              هنوز آدرسی ثبت نکرده‌اید
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              برای ثبت سفارش و تحویل سریع‌تر، آدرس خود را وارد کنید.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary-hover transition-colors cursor-pointer shadow-xs"
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
