"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth/auth.store";
import { useToast } from "@/components/ui/Toast";
import { routes } from "@/lib/routes";
import { UserIcon } from "@/components/icons";
import { accountService } from "@/lib/account/accountService";
import {
  User,
  ShoppingBag,
  Headphones,
  LogOut,
  LogIn,
  ChevronLeft,
} from "lucide-react";

export function AccountDropdown() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Stats calculation
  const [undeliveredCount, setUndeliveredCount] = useState(0);
  const [ticketUpdatesCount, setTicketUpdatesCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user) {
      try {
        const orders = accountService.getOrders({
          customerId: user.id,
          customerPhone: user.phone,
        });
        const undelivered = orders.filter(
          (o) =>
            o.status !== "delivered" &&
            o.status !== "cancelled" &&
            o.status !== "returned"
        );
        setUndeliveredCount(undelivered.length);

        const tickets = accountService.getTickets();
        const updatedTickets = tickets.filter((t) => {
          if (t.status === "closed") return false;
          if (t.status === "waiting-user") return true;
          const lastMsg = t.messages[t.messages.length - 1];
          return lastMsg && lastMsg.sender === "support";
        });
        setTicketUpdatesCount(updatedTickets.length);
      } catch (err) {
        console.error("Error loading account dropdown stats:", err);
      }
    } else {
      setUndeliveredCount(0);
      setTicketUpdatesCount(0);
    }
  }, [isAuthenticated, user, isOpen]);

  // Handle mouse enter for hover support (desktop only)
  const handleMouseEnter = () => {
    if (window.innerWidth < 768) return;
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  // Handle mouse leave with small delay for smooth user experience (desktop only)
  const handleMouseLeave = () => {
    if (window.innerWidth < 768) return;
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  // Handle trigger button click
  const handleClickToggle = (e: React.MouseEvent) => {
    // On mobile screens (<768px), directly navigate to /account without opening dropdown
    if (window.innerWidth < 768) {
      router.push(routes.account.root);
      return;
    }

    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  // Handle Logout action
  const handleLogout = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    try {
      await logout();
      showToast("از حساب کاربری خود خارج شدید", "info");
      router.push(routes.home);
    } catch {
      showToast("خطا در خروج از حساب", "error");
    }
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Close on Escape key press
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  }, []);

  // Determine user title string
  const userDisplayName = user
    ? user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName
      ? user.firstName
      : user.phone
    : "";

  const totalBadges = undeliveredCount + ticketUpdatesCount;

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleClickToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="حساب کاربری"
        className={`hidden md:flex items-center justify-center relative rounded-full
          md:w-auto md:h-10 md:px-2.5
          text-sm font-medium text-foreground
          hover:bg-surface-subtle transition-all
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-primary focus-visible:ring-offset-2
          shrink-0 cursor-pointer
          ${isOpen ? "bg-surface-subtle text-primary" : ""}`}
      >
        <UserIcon size={22} className="shrink-0" />
        {isAuthenticated && totalBadges > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-background animate-pulse" />
        )}
      </button>

      {/* Popover Menu Dropdown - Desktop Only */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="account-menu-button"
          className="hidden md:block absolute left-0 rtl:left-0 rtl:right-auto md:rtl:right-0 md:rtl:left-auto mt-2 w-64 rounded-2xl bg-background border border-border-subtle shadow-xl p-2 z-50 transition-all duration-150 animate-in fade-in slide-in-from-top-2"
        >
          {isAuthenticated && user ? (
            <>
              {/* Authenticated User Header (Name and Phone linking to /account) */}
              <Link
                href={routes.account.root}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between p-2.5  mb-1.5 hover:bg-surface-subtle rounded-xl transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                    {user.firstName ? user.firstName[0] : <User className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      {userDisplayName}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate dir-ltr text-right mt-0.5">
                      {user.phone}
                    </p>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </Link>

              {/* Authenticated Menu Items */}
              <div className="px-1 space-y-1">
                {/* 1. سفارشات */}
                <Link
                  href={routes.account.orders.list}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-3 py-2 text-xs font-medium text-foreground rounded-xl hover:bg-surface-subtle transition-colors group cursor-pointer"
                  role="menuitem"
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    <span>سفارشات</span>
                  </div>
                  {undeliveredCount > 0 ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {undeliveredCount} جاری
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground group-hover:text-foreground">
                      مشاهده
                    </span>
                  )}
                </Link>

                {/* 2. پشتیبانی */}
                <Link
                  href={routes.account.support.list()}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-3 py-2 text-xs font-medium text-foreground rounded-xl hover:bg-surface-subtle transition-colors group cursor-pointer"
                  role="menuitem"
                >
                  <div className="flex items-center gap-2.5">
                    <Headphones className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    <span>پشتیبانی</span>
                  </div>
                  {ticketUpdatesCount > 0 ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <span>{ticketUpdatesCount} پاسخ جدید</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground group-hover:text-foreground">
                      تیکت‌ها
                    </span>
                  )}
                </Link>

                {/* Divider */}
                <div className="my-1 " />

                {/* 3. خروج از حساب */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer text-right"
                  role="menuitem"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>خروج از حساب</span>
                </button>
              </div>
            </>
          ) : (
            /* Unauthenticated State */
            <div className="p-3 text-center space-y-3">
              <div className="p-2.5 rounded-xl bg-surface-subtle border border-border-subtle">
                <p className="text-xs font-bold text-foreground">وارد حساب خود شوید</p>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                  برای مشاهده سفارش‌ها و مدیریت حساب کاربری وارد شوید.
                </p>
              </div>
              <Link
                href={routes.account.root}
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary-hover transition-colors cursor-pointer shadow-xs"
                role="menuitem"
              >
                <LogIn className="w-4 h-4" />
                <span>ورود / ثبت‌نام</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
