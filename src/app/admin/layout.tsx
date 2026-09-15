"use client";

import React, { useState } from "react";
import { AdminSidebar, NavItem } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { ProductProvider } from "@/context/ProductContext";

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { showToast } = useToast();

  const handleNavItemClick = (item: NavItem) => {
    // Exclude implemented pages from showing "coming soon" toast
    if (
      item.href !== "/admin/dashboard" &&
      !item.href.startsWith("/admin/products") &&
      !item.href.startsWith("/admin/inventory") &&
      !item.href.startsWith("/admin/returns")
    ) {
      showToast(`بخش «${item.title}» به زودی اضافه خواهد شد.`, "info");
    }
  };

  return (
    <div className="min-h-screen bg-surface-muted text-foreground flex flex-col dir-rtl font-sans antialiased">
      {/* Sidebar (Desktop & Mobile Drawer) */}
      <AdminSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        onNavItemClick={handleNavItemClick}
      />

      {/* Main Layout Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-200 ${
          collapsed ? "md:mr-16" : "md:mr-64"
        }`}
      >
        {/* Admin Sticky Header */}
        <AdminHeader
          title="پنل مدیریت فروشگاه"
          onMobileMenuOpen={() => setMobileOpen(true)}
          onSearch={(query) => {
            if (query.trim()) {
              showToast(`جستجو برای: ${query}`, "info");
            }
          }}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <ProductProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </ProductProvider>
    </ToastProvider>
  );
}
