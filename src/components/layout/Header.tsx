"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AnnouncementBar } from "./AnnouncementBar";
import { MainHeader } from "./MainHeader";
import { DesktopNavigation } from "./DesktopNavigation";

interface HeaderProps {
  announcementText?: string;
  cartItemCount?: number;
}

export function Header({ announcementText, cartItemCount }: HeaderProps) {
  const pathname = usePathname();
  const isCheckoutOrPayment = pathname === "/checkout" || pathname === "/payment";

  if (isCheckoutOrPayment) {
    return null;
  }

  return (
    <header className="w-full sticky top-0 z-40">
      <AnnouncementBar text={announcementText} />
      <MainHeader cartItemCount={cartItemCount} />
      <DesktopNavigation />
    </header>
  );
}
