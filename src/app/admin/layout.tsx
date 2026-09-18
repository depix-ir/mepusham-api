"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar, NavItem } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { ProductProvider } from "@/context/ProductContext";
import { AdminAuthProvider, useAdminAuth } from "@/store/admin-auth/adminAuth.store";
import { ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

function AdminLayoutGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isHydrated, isLoading, canAccessRoute } = useAdminAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { showToast } = useToast();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isHydrated || isLoading) return;

    if (isLoginPage) {
      if (isAuthenticated) {
        router.replace("/admin/dashboard");
      }
    } else {
      if (!isAuthenticated) {
        const target = encodeURIComponent(pathname);
        router.replace(`/admin/login?redirect=${target}`);
      }
    }
  }, [isHydrated, isLoading, isAuthenticated, isLoginPage, pathname, router]);

  // If on login page, render children directly without admin header/sidebar
  if (isLoginPage) {
    return <div className="min-h-screen bg-surface-muted dir-rtl font-sans antialiased">{children}</div>;
  }

  // Show hydration loading state
  if (!isHydrated || (isLoading && !isAuthenticated)) {
    return (
      <div className="min-h-screen bg-surface-muted flex items-center justify-center dir-rtl font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">در حال بررسی دسترسی...</p>
        </div>
      </div>
    );
  }

  // Unauthenticated guard fallback while redirecting
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface-muted flex items-center justify-center dir-rtl font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">انتقال به صفحه ورود...</p>
        </div>
      </div>
    );
  }

  // Authorization check for the current route
  const isAuthorized = canAccessRoute(pathname);

  const handleNavItemClick = (item: NavItem) => {
    if (
      item.href !== "/admin/dashboard" &&
      !item.href.startsWith("/admin/products") &&
      !item.href.startsWith("/admin/inventory") &&
      !item.href.startsWith("/admin/returns") &&
      !item.href.startsWith("/admin/discounts") &&
      !item.href.startsWith("/admin/shipping") &&
      !item.href.startsWith("/admin/support") &&
      !item.href.startsWith("/admin/customers") &&
      !item.href.startsWith("/admin/users") &&
      !item.href.startsWith("/admin/settings")
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

        {/* Page Content or Access Denied UI */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          {isAuthorized ? (
            children
          ) : (
            <div className="bg-background border border-border rounded-xl p-8 text-center max-w-lg mx-auto mt-12 shadow-sm space-y-4">
              <div className="w-14 h-14 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-foreground">دسترسی غیرمجاز (۴۰۳)</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                حساب کاربری شما مجوز دسترسی به بخش «{pathname}» را ندارد. در صورت نیاز با مدیر ارشد سیستم تماس بگیرید.
              </p>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/admin/dashboard")}
                >
                  بازگشت به داشبورد
                </Button>
              </div>
            </div>
          )}
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
      <AdminAuthProvider>
        <ProductProvider>
          <AdminLayoutGuard>{children}</AdminLayoutGuard>
        </ProductProvider>
      </AdminAuthProvider>
    </ToastProvider>
  );
}
