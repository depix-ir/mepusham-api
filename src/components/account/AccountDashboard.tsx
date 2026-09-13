"use client";

import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/types/auth";
import { Order, UserAddress, SupportTicket } from "@/types/account";
import { accountService } from "@/lib/account/accountService";
import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { AccountOrdersSummary } from "./orders/AccountOrdersSummary";
import { AddressesSection } from "./addresses/AddressesSection";
import { SupportSection } from "./support/SupportSection";
import { AccountInfoSection } from "./info/AccountInfoSection";
import { LogoutDialog } from "./logout/LogoutDialog";
import { LogOut, Sparkles, ShoppingBag, PackageCheck, Truck, ArrowLeft } from "lucide-react";

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

  const [prefilledOrderForTicket, setPrefilledOrderForTicket] = useState<Order | null>(null);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  // Load account data on mount
  useEffect(() => {
    setOrders(accountService.getOrders());
    setAddresses(accountService.getAddresses());
    setTickets(accountService.getTickets());
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

  // Handlers for Tickets
  const handleCreateTicket = useCallback(
    (data: { subject: string; orderId?: string; orderNumber?: string; message: string }) => {
      accountService.createTicket(data);
      setTickets(accountService.getTickets());
    },
    []
  );

  const handleSendMessage = useCallback((ticketId: string, text: string) => {
    accountService.addTicketMessage(ticketId, text);
    setTickets(accountService.getTickets());
  }, []);

  // Stats calculation
  const totalOrdersCount = orders.length;
  const shippedOrdersCount = orders.filter((o) => o.status === "shipped").length;
  const deliveredOrdersCount = orders.filter((o) => o.status === "delivered").length;

  return (
    <div className="py-6 sm:py-10 bg-background min-h-screen pb-24 md:pb-12">
      <Container>
        <div className="space-y-6 sm:space-y-8">
          {/* Greeting & Account Summary Bar */}
          <div className="bg-surface-subtle/80 border border-border-subtle rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                {user.firstName ? user.firstName.charAt(0) : "م"}
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                  <span>سلام، {user.firstName || "کاربر گرامی"}</span>
                  <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  خوش آمدید • مدیریت سفارش‌ها و حساب کاربری
                </p>
              </div>
            </div>

            {/* Subtle Summary Pills */}
            <div className="flex items-center gap-2 sm:gap-3 text-xs overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-background border border-border-subtle shrink-0">
                <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                <span className="text-muted-foreground">کل سفارش‌ها:</span>
                <span className="font-bold text-foreground">{totalOrdersCount}</span>
              </div>

              {shippedOrdersCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
                  <Truck className="w-3.5 h-3.5 text-primary" />
                  <span className="text-primary font-bold">
                    {shippedOrdersCount} در حال ارسال
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-background border border-border-subtle shrink-0">
                <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-muted-foreground">تحویل شده:</span>
                <span className="font-bold text-foreground">{deliveredOrdersCount}</span>
              </div>
            </div>
          </div>

          {/* User Hub Grid Layout (8 cols left, 4 cols right on desktop) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Primary Column (8 Cols Desktop) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Compact Orders Summary */}
              <AccountOrdersSummary orders={orders} />

              {/* Addresses Section */}
              <div className="bg-background border border-border-subtle rounded-2xl p-4 sm:p-5 shadow-2xs">
                <AddressesSection
                  addresses={addresses}
                  onSaveAddress={handleSaveAddress}
                  onDeleteAddress={handleDeleteAddress}
                  onSetDefault={handleSetDefaultAddress}
                />
              </div>
            </div>

            {/* Secondary Column (4 Cols Desktop) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Personal Information Section */}
              <div className="bg-background border border-border-subtle rounded-2xl p-4 sm:p-5 shadow-2xs">
                <AccountInfoSection
                  user={user}
                  onUpdateProfile={onUpdateProfile}
                />
              </div>

              {/* Support & Tickets Section */}
              <div className="bg-background border border-border-subtle rounded-2xl p-4 sm:p-5 shadow-2xs">
                <SupportSection
                  tickets={tickets}
                  orders={orders}
                  onCreateTicket={handleCreateTicket}
                  onSendMessage={handleSendMessage}
                  prefilledOrderForTicket={prefilledOrderForTicket}
                  onClearPrefilledOrder={() => setPrefilledOrderForTicket(null)}
                />
              </div>

              {/* Logout Action Card */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsLogoutOpen(true)}
                  className="w-full py-3 px-4 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/60 text-rose-700 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>خروج از حساب کاربری</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Container>

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
