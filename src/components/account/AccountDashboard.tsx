"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { User } from "@/types/auth";
import { Order, UserAddress, SupportTicket } from "@/types/account";
import { accountService } from "@/lib/account/accountService";
import { returnService } from "@/lib/returns/returnService";
import { useWishlist } from "@/store/wishlist/wishlist.store";
import { Container } from "@/components/ui/Container";
import { toPersianDigits } from "@/lib/formatting/currency";
import { EditProfileModal } from "./info/EditProfileModal";
import { AddressesManageModal } from "./addresses/AddressesManageModal";
import { LogoutDialog } from "./logout/LogoutDialog";
import {
  ShoppingBag,
  RotateCcw,
  Headphones,
  MapPin,
  Heart,
  ChevronLeft,
  Edit2,
  LogOut,
  User as UserIcon,
  Phone,
} from "lucide-react";

interface AccountDashboardProps {
  user: User;
  onUpdateProfile: (updates: { firstName: string; lastName: string }) => Promise<User>;
  onLogout: () => Promise<void>;
}

export function AccountDashboard({
  user,
  onUpdateProfile,
  onLogout,
}: AccountDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [returnCount, setReturnCount] = useState<number>(0);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddressesModalOpen, setIsAddressesModalOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const { count: wishlistCount } = useWishlist();

  // Load account data on mount
  useEffect(() => {
    setOrders(accountService.getOrders());
    setAddresses(accountService.getAddresses());
    setTickets(accountService.getTickets());
    try {
      const returnsData = returnService.getReturnRequests();
      setReturnCount(returnsData.total || 0);
    } catch {
      setReturnCount(0);
    }
  }, []);

  // Handlers for Addresses
  const handleSaveAddress = useCallback(
    (addrData: Omit<UserAddress, "id"> & { id?: string }) => {
      const updated = accountService.saveAddress(addrData);
      setAddresses(updated);
    },
    []
  );

  const handleDeleteAddress = useCallback((id: string) => {
    const updated = accountService.deleteAddress(id);
    setAddresses(updated);
  }, []);

  const handleSetDefaultAddress = useCallback((id: string) => {
    const updated = accountService.setDefaultAddress(id);
    setAddresses(updated);
  }, []);

  // Stats calculations
  const totalOrdersCount = orders.length;
  const activeOrdersCount = orders.filter(
    (o) => o.status === "pending" || o.status === "confirmed" || o.status === "processing" || o.status === "shipped"
  ).length;

  const activeTicketsCount = tickets.filter(
    (t) => t.status === "open" || t.status === "waiting-support"
  ).length;

  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];

  return (
    <div className="py-6 sm:py-10 bg-surface-subtle/40 min-h-screen pb-24 md:pb-12">
      <Container className="max-w-3xl mx-auto">
        <div className="space-y-4 sm:space-y-6">
          {/* Top User Info Card (SnappFood Style Header) */}
          <div className="bg-background border border-border/80 rounded-2xl p-5 shadow-2xs">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xl shrink-0">
                  {user.firstName ? user.firstName.charAt(0) : <UserIcon className="w-7 h-7 text-primary" />}
                </div>
                <div className="space-y-1">
                  <h1 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                    <span>{user.firstName ? `${user.firstName} ${user.lastName || ""}` : "کاربر گرامی"}</span>
                  </h1>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono" dir="ltr">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground/70" />
                    <span>{toPersianDigits(user.phone || "")}</span>
                  </div>
                </div>
              </div>

              {/* Edit Profile Button */}
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-primary/30 text-primary text-xs font-bold hover:bg-primary/5 transition-colors cursor-pointer shrink-0"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>اطلاعات کاربری</span>
                <ChevronLeft className="w-4 h-4 mr-0.5" />
              </button>
            </div>
          </div>

          {/* Quick Menu List Cards (SnappFood Style Rows) */}
          <div className="bg-background border border-border/80 rounded-2xl divide-y divide-border/60 shadow-2xs overflow-hidden">
            {/* 1. Orders Card */}
            <Link
              href="/orders"
              className="group flex items-center justify-between p-4 sm:p-5 hover:bg-surface-subtle/50 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5.5 h-5.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      سفارش‌ها
                    </h2>
                    {activeOrdersCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold">
                        {toPersianDigits(activeOrdersCount)} جاری
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {totalOrdersCount > 0
                      ? `${toPersianDigits(totalOrdersCount)} سفارش ثبت شده • پیگیری و تاریخچه خریدها`
                      : "هنوز سفارشی ثبت نکرده‌اید"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary hidden sm:inline-block">مشاهده</span>
                <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all" />
              </div>
            </Link>

            {/* 2. Returns & Exchanges Card */}
            <Link
              href="/account/returns"
              className="group flex items-center justify-between p-4 sm:p-5 hover:bg-surface-subtle/50 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5.5 h-5.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      مرجوعی‌ها و تعویض
                    </h2>
                    {returnCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                        {toPersianDigits(returnCount)} درخواست
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    پیگیری مرجوعی، وضعیت کارشناسی و استرداد وجه
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary hidden sm:inline-block">مشاهده</span>
                <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all" />
              </div>
            </Link>

            {/* 3. Support & Tickets Card */}
            <Link
              href="/support"
              className="group flex items-center justify-between p-4 sm:p-5 hover:bg-surface-subtle/50 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                  <Headphones className="w-5.5 h-5.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      پشتیبانی و تیکت‌ها
                    </h2>
                    {tickets.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[11px] font-bold">
                        {toPersianDigits(tickets.length)} پیام
                        {activeTicketsCount > 0 ? ` (${toPersianDigits(activeTicketsCount)} در حال بررسی)` : ""}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ارسال تیکت پشتیبانی، سوالات متداول و راهنمای سفارش
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary hidden sm:inline-block">مشاهده</span>
                <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all" />
              </div>
            </Link>

            {/* 4. Addresses Management Card (Modal Trigger) */}
            <button
              type="button"
              onClick={() => setIsAddressesModalOpen(true)}
              className="w-full group flex items-center justify-between p-4 sm:p-5 hover:bg-surface-subtle/50 transition-colors text-right cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5.5 h-5.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      آدرس‌های من
                    </h2>
                    {addresses.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
                        {toPersianDigits(addresses.length)} آدرس
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs sm:max-w-md">
                    {defaultAddress
                      ? `پیش‌فرض: ${defaultAddress.city}، ${defaultAddress.title}`
                      : "مدیریت و افزودن آدرس‌های تحویل سفارش"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary hidden sm:inline-block">مدیریت</span>
                <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all" />
              </div>
            </button>

            {/* 5. Wishlist Card */}
            <Link
              href="/wishlist"
              className="group flex items-center justify-between p-4 sm:p-5 hover:bg-surface-subtle/50 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                  <Heart className="w-5.5 h-5.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      علاقه‌مندی‌ها
                    </h2>
                    {wishlistCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-bold">
                        {toPersianDigits(wishlistCount)} کالا
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    لیست کالاهای ذخیره‌شده و محبوب شما
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary hidden sm:inline-block">مشاهده</span>
                <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all" />
              </div>
            </Link>
          </div>

          {/* Logout Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsLogoutOpen(true)}
              className="w-full py-3.5 px-4 rounded-2xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/70 text-rose-700 text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج از حساب کاربری</span>
            </button>
          </div>
        </div>
      </Container>

      {/* Edit Profile Modal */}
      <EditProfileModal
        user={user}
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={onUpdateProfile}
      />

      {/* Addresses Manage Modal */}
      <AddressesManageModal
        isOpen={isAddressesModalOpen}
        onClose={() => setIsAddressesModalOpen(false)}
        addresses={addresses}
        onSaveAddress={handleSaveAddress}
        onDeleteAddress={handleDeleteAddress}
        onSetDefault={handleSetDefaultAddress}
      />

      {/* Logout Confirmation Dialog */}
      <LogoutDialog
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={async () => {
          setIsLogoutOpen(false);
          await onLogout();
        }}
      />
    </div>
  );
}
