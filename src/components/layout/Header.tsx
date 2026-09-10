import React from "react";
import { AnnouncementBar } from "./AnnouncementBar";
import { MainHeader } from "./MainHeader";

interface HeaderProps {
  announcementText?: string;
  cartItemCount?: number;
}

export function Header({ announcementText, cartItemCount }: HeaderProps) {
  return (
    <header className="w-full sticky top-0 z-40 bg-background">
      <AnnouncementBar text={announcementText} />
      <MainHeader cartItemCount={cartItemCount} />
    </header>
  );
}
