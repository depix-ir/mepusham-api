"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { peydaFont } from "@/lib/fonts";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomBar } from "@/components/layout/MobileBottomBar";
import { CartProvider } from "@/store/cart/cart.store";
import { WishlistProvider } from "@/store/wishlist/wishlist.store";
import { AuthProvider } from "@/store/auth/auth.store";
import { ToastProvider } from "@/components/ui/Toast";
import { CartDrawer } from "@/components/cart/CartDrawer";
import "./globals.css";

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  if (isAdminPage) {
    return <main className="flex-1 w-full">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
      <MobileBottomBar />
      <CartDrawer />
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={peydaFont.variable}>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans flex flex-col pb-16 md:pb-0">
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <AppShell>{children}</AppShell>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
