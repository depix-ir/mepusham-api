"use client";

import React, { useEffect } from "react";
import { UserAddress } from "@/types/account";
import { AddressesSection } from "./AddressesSection";
import { X, MapPin } from "lucide-react";

interface AddressesManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  addresses: UserAddress[];
  onSaveAddress: (address: Omit<UserAddress, "id"> & { id?: string }) => void;
  onDeleteAddress: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export function AddressesManageModal({
  isOpen,
  onClose,
  addresses,
  onSaveAddress,
  onDeleteAddress,
  onSetDefault,
}: AddressesManageModalProps) {
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="addresses-manage-title"
    >
      <div
        className="relative w-full max-w-2xl bg-background border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle bg-surface-subtle/50 shrink-0">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 id="addresses-manage-title" className="text-base font-bold text-foreground">
              مدیریت آدرس‌های ارسال
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1">
          <AddressesSection
            addresses={addresses}
            onSaveAddress={onSaveAddress}
            onDeleteAddress={onDeleteAddress}
            onSetDefault={onSetDefault}
          />
        </div>
      </div>
    </div>
  );
}
