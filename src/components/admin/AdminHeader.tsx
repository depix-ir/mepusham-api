"use client";

import React, { useState } from "react";
import {
  Menu,
  Bell,
  Search,
  User,
  ChevronDown,
  LogOut,
  Settings,
  X,
  CheckCircle2,
} from "lucide-react";

interface AdminHeaderProps {
  title?: string;
  onMobileMenuOpen: () => void;
  onSearch?: (query: string) => void;
}

export function AdminHeader({
  title = "داشبورد ادمین",
  onMobileMenuOpen,
  onSearch,
}: AdminHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const mockNotifications = [
    { id: 1, title: "سفارش جدید #۱۲۴۵۸ ثبت شد", time: "۵ دقیقه پیش", unread: true },
    { id: 2, title: "موجودی محصول 'کفش چرم' کم شده است", time: "۱ ساعت پیش", unread: true },
    { id: 3, title: "تیکت جدید از طرف سارا احمدی", time: "۳ ساعت پیش", unread: false },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border h-16 px-4 md:px-6 flex items-center justify-between gap-4">
      {/* Right side (RTL): Mobile menu trigger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuOpen}
          className="md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-surface-subtle rounded-md transition-colors"
          aria-label="Open mobile menu"
        >
          <Menu className="w-3 h-3" />
        </button>
        <h1 className="text-base md:text-lg font-bold text-foreground truncate select-none">
          {title}
        </h1>
      </div>

      {/* Middle: Quick Search (Hidden on small mobile screens) */}
      <div className="hidden sm:flex flex-1 max-w-md mx-4">
        <form onSubmit={handleSearchSubmit} className="w-full relative">
          <input
            type="text"
            placeholder="جستجوی سریع سفارش، محصول یا مشتری..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-8 pr-9 bg-surface-subtle border border-transparent rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:bg-background transition-all"
          />
          <Search className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* Left side (RTL): Notifications & User Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Notifications Dropdown Toggle */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setUserMenuOpen(false);
            }}
            className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-surface-subtle rounded-md transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-3 h-3" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error ring-2 ring-background" />
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <div className="absolute left-0 mt-2 w-80 bg-background border border-border rounded-md shadow-lg z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-border flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">اعلان‌ها</span>
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                  ۲ جدید
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-border/50">
                {mockNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 text-xs flex items-start gap-2.5 transition-colors hover:bg-surface-subtle cursor-pointer ${
                      notif.unread ? "bg-primary/5" : ""
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        notif.unread ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <div className="flex-1 space-y-1">
                      <p className="text-foreground leading-snug">{notif.title}</p>
                      <p className="text-[10px] text-muted-foreground">{notif.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-border text-center">
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="text-[11px] text-primary hover:underline font-medium"
                >
                  بستن
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-border mx-1" />

        {/* User Profile Dropdown Toggle */}
        <div className="relative">
          <button
            onClick={() => {
              setUserMenuOpen(!userMenuOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-md hover:bg-surface-subtle transition-colors text-right"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden lg:flex flex-col text-right min-w-0">
              <span className="text-xs font-bold text-foreground truncate">مدیر سیستم</span>
              <span className="text-[10px] text-muted-foreground">admin@store.ir</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden lg:block" />
          </button>

          {/* User Menu Dropdown Panel */}
          {userMenuOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-border lg:hidden">
                <p className="text-xs font-bold text-foreground">مدیر سیستم</p>
                <p className="text-[10px] text-muted-foreground">admin@store.ir</p>
              </div>
              <button
                onClick={() => setUserMenuOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-surface-subtle transition-colors"
              >
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span>تنظیمات حساب</span>
              </button>
              <div className="my-1 border-t border-border" />
              <button
                onClick={() => setUserMenuOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-error hover:bg-error/10 transition-colors"
              >
                <LogOut className="w-4 h-4 text-error" />
                <span>خروج از حساب</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
