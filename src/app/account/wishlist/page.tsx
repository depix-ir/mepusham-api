import { Metadata } from "next";
import { WishlistClientPage } from "@/components/wishlist/WishlistClientPage";

export const metadata: Metadata = {
  title: "پسندیده‌ها | مپوشام",
  description: "لیست محصولات پسندیده شده شما در فروشگاه مپوشام",
};

export default function AccountWishlistPage() {
  return <WishlistClientPage />;
}
