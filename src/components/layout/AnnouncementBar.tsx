import React from "react";
import { Container } from "@/components/ui/Container";

interface AnnouncementBarProps {
  text?: string;
}

export function AnnouncementBar({
  text = "ارسال رایگان برای سفارش‌های بالای ۲ میلیون تومان",
}: AnnouncementBarProps) {
  return (
    <div className="w-full h-10 bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center select-none shrink-0">
      <Container className="flex items-center justify-center text-center">
        <span>{text}</span>
      </Container>
    </div>
  );
}
