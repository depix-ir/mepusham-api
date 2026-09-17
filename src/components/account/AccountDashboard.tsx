"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { User } from "@/types/auth";
import { Order, UserAddress, SupportTicket } from "@/types/account";
import { accountService } from "@/lib/account/accountService";
import { returnService } from "@/lib/returns/returnService";
import { useWishlist } from "@/store/wishlist/wishlist.store";
import { toPersianDigits } from "@/lib/formatting/currency";
import { routes } from "@/lib/routes";
import { EditProfileModal } from "./info/EditProfileModal";
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

  // Stats calculations
  const activeOrdersCount = orders.filter(
    (o) => o.status === "pending" || o.status === "confirmed" || o.status === "processing" || o.status === "shipped"
  ).length;

  const activeTicketsCount = tickets.filter(
    (t) => t.status === "open" || t.status === "waiting-support"
  ).length;

  return (
    <div className="py-6 sm:py-10 bg-surface-subtle/40 min-h-screen pb-24 md:pb-12">
      <div className="max-w-[800px] px-3 mx-auto">
        <div className="space-y-4 sm:space-y-6">
          {/* Top User Info Card */}
          <div className="bg-primary border border-border/0 rounded-2xl p-3.5 sm:p-5 shadow-2xs">
            <div className="flex flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-primary-foreground text-primary flex items-center justify-center font-bold text-sm sm:text-xl shrink-0">
                  {user.firstName ? user.firstName.charAt(0) : <UserIcon className=" sm:w-7 sm:h-7 text-primary" />}
                </div>
                <div className="space-y-0.5 sm:space-y-1 min-w-0">
                  <h1 className="text-xs sm:text-xl font-bold text-primary-foreground flex items-center gap-2 truncate">
                    <span className="truncate">{user.firstName ? `${user.firstName} ${user.lastName || ""}` : "کاربر گرامی"}</span>
                  </h1>
                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-primary-foreground/90 font-mono" dir="ltr">
                    <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary-foreground shrink-0" />
                    <span>{toPersianDigits(user.phone || "")}</span>
                  </div>
                </div>
              </div>

              {/* Edit Profile Button */}
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-primary-foreground/30 text-primary-foreground text-[11px] sm:text-xs font-bold hover:bg-primary-foreground/10 transition-colors cursor-pointer shrink-0"
              >
                <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>اطلاعات</span>
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5" />
              </button>
            </div>
          </div>

          {/* Minimal Quick Menu List Cards */}
          <div className="bg-background border border-border/80 rounded-2xl divide-y divide-border/60 shadow-2xs overflow-hidden">
            {/* 1. Orders Card */}
            <Link
              href={routes.account.orders.list}
              className="group flex items-center justify-between py-2.5 px-3 sm:p-3.5 hover:bg-surface-subtle/50 transition-colors"
            >
              <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-3 h-3 sm:w-5.5 sm:h-5.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <h2 className="text-xs sm:text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      سفارش‌ها
                    </h2>
                    {activeOrdersCount > 0 && (
                      <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] sm:text-[11px] font-bold shrink-0">
                        {toPersianDigits(activeOrdersCount)} جاری
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <span className="text-xs font-bold text-primary hidden sm:inline-block">مشاهده</span>
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground/60 group-hover:text-primary transition-colors" />
              </div>
            </Link>

            {/* 2. Returns & Exchanges Card */}
            <Link
              href={routes.account.returns.list}
              className="group flex items-center justify-between py-2.5 px-3 sm:p-3.5 hover:bg-surface-subtle/50 transition-colors"
            >
              <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-3 h-3 sm:w-5.5 sm:h-5.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <h2 className="text-xs sm:text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      مرجوعی‌ها و تعویض
                    </h2>
                    {returnCount > 0 && (
                      <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] sm:text-[11px] font-bold shrink-0">
                        {toPersianDigits(returnCount)} درخواست
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <span className="text-xs font-bold text-primary hidden sm:inline-block">مشاهده</span>
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground/60 group-hover:text-primary transition-colors" />
              </div>
            </Link>

            {/* 3. Support & Tickets Card */}
            <Link
              href={routes.account.support.list()}
              className="group flex items-center justify-between py-2.5 px-3 sm:p-3.5 hover:bg-surface-subtle/50 transition-colors"
            >
              <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                  <Headphones className="w-3 h-3 sm:w-5.5 sm:h-5.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <h2 className="text-xs sm:text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      پشتیبانی و تیکت‌ها
                    </h2>
                    {tickets.length > 0 && (
                      <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] sm:text-[11px] font-bold shrink-0">
                        {toPersianDigits(tickets.length)} پیام
                        {activeTicketsCount > 0 ? ` (${toPersianDigits(activeTicketsCount)} جاری)` : ""}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <span className="text-xs font-bold text-primary hidden sm:inline-block">مشاهده</span>
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground/60 group-hover:text-primary transition-colors" />
              </div>
            </Link>

            {/* 4. Addresses Management Card - Link to /account/addresses */}
            <Link
              href={routes.account.addresses}
              className="group flex items-center justify-between py-2.5 px-3 sm:p-3.5 hover:bg-surface-subtle/50 transition-colors"
            >
              <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-3 h-3 sm:w-5.5 sm:h-5.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <h2 className="text-xs sm:text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      آدرس‌های من
                    </h2>
                    {addresses.length > 0 && (
                      <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] sm:text-[11px] font-bold shrink-0">
                        {toPersianDigits(addresses.length)} آدرس
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <span className="text-xs font-bold text-primary hidden sm:inline-block">مشاهده</span>
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground/60 group-hover:text-primary transition-colors" />
              </div>
            </Link>

            {/* 5. Wishlist Card */}
            <Link
              href={routes.account.wishlist}
              className="group flex items-center justify-between py-2.5 px-3 sm:p-3.5 hover:bg-surface-subtle/50 transition-colors"
            >
              <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                  <Heart className="w-3 h-3 sm:w-5.5 sm:h-5.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <h2 className="text-xs sm:text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      علاقه‌مندی‌ها
                    </h2>
                    {wishlistCount > 0 && (
                      <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] sm:text-[11px] font-bold shrink-0">
                        {toPersianDigits(wishlistCount)} کالا
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <span className="text-xs font-bold text-primary hidden sm:inline-block">مشاهده</span>
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground/60 group-hover:text-primary transition-colors" />
              </div>
            </Link>
          </div>

          {/* Logout Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsLogoutOpen(true)}
              className="w-full py-2.5 sm:py-3.5 px-4 rounded-2xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/70 text-rose-700 text-[11px] sm:text-sm font-bold transition-colors flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>خروج از حساب کاربری</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        user={user}
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={onUpdateProfile}
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
