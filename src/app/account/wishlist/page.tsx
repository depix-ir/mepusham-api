import { Metadata } from "next";
import { WishlistClientPage } from "@/components/wishlist/WishlistClientPage";

export const metadata: Metadata = {
  title: "پسندیده‌ها | مپوشــــم",
  description: "لیست محصولات پسندیده شده شما در فروشگاه مپوشــــم",
};

export default function AccountWishlistPage() {
  return <WishlistClientPage />;
}
