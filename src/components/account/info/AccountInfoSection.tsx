"use client";

import React, { useState } from "react";
import { User } from "@/types/auth";
import { toPersianDigits } from "@/lib/formatting/currency";
import { EditProfileModal } from "./EditProfileModal";
import { User as UserIcon, Phone, Edit2 } from "lucide-react";

interface AccountInfoSectionProps {
  user: User;
  onUpdateProfile: (updates: { firstName: string; lastName: string }) => Promise<User>;
}

export function AccountInfoSection({
  user,
  onUpdateProfile,
}: AccountInfoSectionProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-primary" />
          <span>اطلاعات حساب</span>
        </h2>

        <button
          type="button"
          onClick={() => setIsEditOpen(true)}
          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>ویرایش اطلاعات</span>
        </button>
      </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-surface-subtle/60 rounded-xl space-y-0.5 border border-border-subtle/50">
            <span className="text-muted-foreground text-[11px]">نام و نام خانوادگی</span>
            <p className="font-bold text-foreground text-sm">
              {user.firstName} {user.lastName}
            </p>
          </div>

          <div className="p-3 bg-surface-subtle/60 rounded-xl space-y-0.5 border border-border-subtle/50">
            <span className="text-muted-foreground text-[11px] flex items-center gap-1">
              <Phone className="w-3 h-3 text-primary" />
              <span>شماره همراه</span>
            </span>
            <p className="font-bold text-foreground text-sm font-mono" dir="ltr">
              {toPersianDigits(user.phone)}
            </p>
          </div>
        </div>


      <EditProfileModal
        user={user}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={onUpdateProfile}
      />
    </div>
  );
}
