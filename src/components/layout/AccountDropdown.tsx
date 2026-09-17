"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/auth/auth.store";
import { useToast } from "@/components/ui/Toast";
import { routes } from "@/lib/routes";
import { UserIcon } from "@/components/icons";
import { User, ShoppingBag, Headphones, LogOut, ChevronDown, LogIn } from "lucide-react";

export function AccountDropdown() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
  className={`hidden md:flex items-center justify-center rounded-full
    md:w-auto md:h-10 md:px-2.5
    text-sm font-medium text-foreground
    hover:bg-surface-subtle transition-all
    focus-visible:outline-none focus-visible:ring-2
    focus-visible:ring-primary focus-visible:ring-offset-2
    shrink-0
    ${isOpen ? "bg-surface-subtle text-primary" : ""}`}
>
  <UserIcon size={22} className="shrink-0" />
</button> 


      {/* Popover Menu Dropdown - Desktop Only */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="account-menu-button"
          className="hidden md:block absolute left-0 rtl:left-0 rtl:right-auto md:rtl:right-0 md:rtl:left-auto mt-2 w-60 rounded-2xl bg-background border border-border-subtle shadow-xl p-2 z-50 transition-all duration-150 animate-in fade-in slide-in-from-top-2"
        >
          {isAuthenticated && user ? (
            <>
              {/* Authenticated User Header (Name and Phone linking to /account) */}
              <Link
                href={routes.account.root}
                onClick={() => setIsOpen(false)}
                className="block px-2 py-2 border-b border-border-subtle mb-1  hover:bg-primary/5 rounded-t-2xl transition-colors group cursor-pointer"
              >
                <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                  {userDisplayName}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate dir-ltr text-right">
                  {user.phone}
                </p>
              </Link>

              {/* Authenticated Menu Items */}
              <div className="px-1.5 space-y-0.5">
                {/* 1. سفارشات */}
                <Link
                  href={routes.account.orders.list}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground rounded-xl hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                  role="menuitem"
                >
                  <ShoppingBag className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>سفارشات</span>
                </Link>

                {/* 2. پشتیبانی */}
                <Link
                  href={routes.account.support.list()}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-foreground rounded-xl hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                  role="menuitem"
                >
                  <Headphones className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>پشتیبانی</span>
                </Link>

                {/* Divider */}
                <div className="my-1 border-t border-border-subtle" />

                {/* 3. خروج از حساب */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors cursor-pointer text-right"
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
