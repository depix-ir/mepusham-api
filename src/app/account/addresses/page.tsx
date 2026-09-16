"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/store/auth/auth.store";
import { accountService } from "@/lib/account/accountService";
import { UserAddress } from "@/types/account";
import { Container } from "@/components/ui/Container";
import { AccountPageHeader } from "@/components/account/AccountPageHeader";
import { AddressesSection } from "@/components/account/addresses/AddressesSection";
import { useToast } from "@/components/ui/Toast";
import { MapPin } from "lucide-react";

export default function AccountAddressesPage() {
  const { isAuthLoading, isAuthenticated } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    setAddresses(accountService.getAddresses());
  }, []);

  const handleSaveAddress = useCallback(
    (addrData: Omit<UserAddress, "id"> & { id?: string }) => {
      const isEdit = Boolean(addrData.id);
      const updated = accountService.saveAddress(addrData);
      setAddresses(updated);
      showToast(
        isEdit ? "آدرس با موفقیت بروزرسانی شد." : "آدرس جدید با موفقیت اضافه شد.",
        "success"
      );
    },
    [showToast]
  );

  const handleDeleteAddress = useCallback(
    (id: string) => {
      const updated = accountService.deleteAddress(id);
      setAddresses(updated);
      showToast("آدرس با موفقیت حذف شد.", "info");
    },
    [showToast]
  );

  const handleSetDefaultAddress = useCallback(
    (id: string) => {
      const updated = accountService.setDefaultAddress(id);
      setAddresses(updated);
      showToast("آدرس پیش‌فرض با موفقیت تغییر کرد.", "success");
    },
    [showToast]
  );

  if (isAuthLoading) {
    return (
      <div className="py-20 text-center min-h-[60vh] flex items-center justify-center">
        <Container>
          <div className="w-10 h-10 rounded-full border-3 border-primary/30 border-t-primary animate-spin mx-auto" />
        </Container>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Container className="max-w-md mx-auto space-y-4">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto" />
          <h1 className="text-lg font-bold text-foreground">
            برای مشاهده و مدیریت آدرس‌ها باید وارد حساب کاربری شوید.
          </h1>
          <p className="text-xs text-muted-foreground">
            لطفاً ابتدا با شماره موبایل خود وارد حساب کاربری شوید.
          </p>
          <Link
            href="/account"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary-hover transition-colors shadow-xs"
          >
            ورود به حساب کاربری
          </Link>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-10 max-w-[800px] mx-auto bg-background min-h-screen pb-24 md:pb-12">
      <Container className="max-w-3xl space-y-6">
        {/* Page Header matching orders, returns, support */}
        <AccountPageHeader
          title="آدرس‌های من"
          description="مدیریت و ویرایش آدرس‌های ارسال و دریافت سفارش‌ها"
          icon={MapPin}
          backUrl="/account"
          backLabel="بازگشت به حساب کاربری"
          badgeText={addresses.length > 0 ? `${addresses.length} آدرس` : undefined}
        />

        {/* Addresses Section Body */}
        <div className="bg-background border border-border/70 rounded-2xl p-4 sm:p-6 shadow-2xs">
          <AddressesSection
            addresses={addresses}
            onSaveAddress={handleSaveAddress}
            onDeleteAddress={handleDeleteAddress}
            onSetDefault={handleSetDefaultAddress}
          />
        </div>
      </Container>
    </div>
  );
}
