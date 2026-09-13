import type { Metadata, Viewport } from "next";
import { peydaFont } from "@/lib/fonts";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomBar } from "@/components/layout/MobileBottomBar";
import { CartProvider } from "@/store/cart/cart.store";
import { WishlistProvider } from "@/store/wishlist/wishlist.store";
import { AuthProvider } from "@/store/auth/auth.store";
import { CartDrawer } from "@/components/cart/CartDrawer";
import "./globals.css";

export const metadata: Metadata = {
  title: "مپوشام | فروشگاه اینترنتی پوشاک زنانه و دخترانه",
  description: "فروشگاه آنلاین لباس زنانه، دخترانه، کفش، کیف و اکسسوری‌های مد و فشن",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1C68CC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={peydaFont.variable}>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans flex flex-col pb-16 md:pb-0">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Header />
              <main className="flex-1 w-full">{children}</main>
              <Footer />
              <MobileBottomBar />
              <CartDrawer />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
