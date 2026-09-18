"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  RotateCcw,
  Users,
  Headphones,
  Percent,
  Truck,
  ShieldCheck,
  Settings,
  ChevronRight,
  ChevronLeft,
  X,
  Store,
} from "lucide-react";

export interface NavItem {
  id: string;
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { id: "dashboard", title: "داشبورد", href: "/admin/dashboard", icon: LayoutDashboard },
  { id: "products", title: "محصولات", href: "/admin/products", icon: Package },
  { id: "inventory", title: "موجودی", href: "/admin/inventory", icon: Boxes },
  { id: "orders", title: "سفارش‌ها", href: "/admin/orders", icon: ShoppingBag },
  { id: "returns", title: "مرجوعی‌ها", href: "/admin/returns", icon: RotateCcw },
  { id: "customers", title: "مشتریان", href: "/admin/customers", icon: Users },
  { id: "support", title: "پشتیبانی", href: "/admin/support", icon: Headphones },
  { id: "discounts", title: "تخفیف‌ها", href: "/admin/discounts", icon: Percent },
  { id: "shipping", title: "روش‌های ارسال", href: "/admin/shipping", icon: Truck },
  { id: "users-roles", title: "کاربران و دسترسی‌ها", href: "/admin/users", icon: ShieldCheck },
  { id: "settings", title: "تنظیمات", href: "/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onNavItemClick?: (item: NavItem) => void;
}

export function AdminSidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
  onNavItemClick,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const handleLinkClick = (item: NavItem) => {
    if (onNavItemClick) {
      onNavItemClick(item);
    }
    onMobileClose();
  };

  const navContent = (
    <div className="flex flex-col h-full bg-background text-foreground border-l border-border select-none">
      {/* Brand / Logo Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold text-lg">
            A
          </div>
          {(!collapsed || mobileOpen) && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm truncate text-foreground">
                پنل مدیریت فروشگاه
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Button */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-subtle rounded-md transition-colors"
          title={collapsed ? "باز کردن منو" : "جمع کردن منو"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={onMobileClose}
          className="md:hidden p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-subtle rounded-md transition-colors"
          aria-label="Close sidebar drawer"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 no-scrollbar">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin/dashboard");

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => handleLinkClick(item)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors group relative ${
                isActive
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-foreground hover:bg-surface-subtle text-opacity-90"
              }`}
              title={collapsed && !mobileOpen ? item.title : undefined}
            >
              <Icon
                className={`w-3.5 h-3.5 shrink-0 ${
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                }`}
              />
              {(!collapsed || mobileOpen) && (
                <span className="truncate">{item.title}</span>
              )}
              {collapsed && !mobileOpen && (
                <div className="hidden md:block absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  {item.title}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer link back to Main Store */}
      <div className="p-3 border-t border-border mt-auto">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface-subtle transition-colors"
          title={collapsed && !mobileOpen ? "مشاهده فروشگاه" : undefined}
        >
          <Store className="w-3.5 h-3.5 shrink-0" />
          {(!collapsed || mobileOpen) && <span>مشاهده فروشگاه</span>}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside
        className={`hidden md:block fixed top-0 right-0 bottom-0 z-30 transition-all duration-200 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {navContent}
      </aside>

      {/* Mobile Drawer with Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />

          {/* Drawer content */}
          <aside className="fixed top-0 right-0 bottom-0 w-72 max-w-[80vw] bg-background shadow-xl z-50 animate-in slide-in-from-right duration-200">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
