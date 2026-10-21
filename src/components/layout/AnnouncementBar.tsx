"use client";

import React, { useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";

const DEFAULT_ANNOUNCEMENTS = [
  "ارسال رایگان برای سفارش‌های بالای ۲ میلیون تومان",
  "ضمانت بازگشت کالا",
  "تخفیف ویژه اولین خرید با کد تخفیف WELCOME",
];

interface AnnouncementBarProps {
  text?: string;
  messages?: string[];
  intervalDuration?: number;
}

export function AnnouncementBar({
  text,
  messages,
  intervalDuration = 3500,
}: AnnouncementBarProps) {
  const announcements = messages || (text ? [text] : DEFAULT_ANNOUNCEMENTS);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (announcements.length <= 1) return;

    let isHidden = false;
    const handleVisibilityChange = () => {
      isHidden = document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const timer = setInterval(() => {
      if (isHidden) return;

      setPrevIndex(currentIndex);
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
      setIsTransitioning(true);

      const transitionTimer = setTimeout(() => {
        setIsTransitioning(false);
        setPrevIndex(null);
      }, 500);

      return () => clearTimeout(transitionTimer);
    }, intervalDuration);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [announcements.length, currentIndex, intervalDuration]);

  return (
    <div className="w-full h-10 bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center select-none shrink-0 overflow-hidden relative">
      <style>{`
        @keyframes annSlideInFromTop {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes annSlideOutToBottom {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(100%);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-ann-slide-in,
          .animate-ann-slide-out {
            animation: none !important;
          }
        }
        .animate-ann-slide-in {
          animation: annSlideInFromTop 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-ann-slide-out {
          animation: annSlideOutToBottom 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      <Container className="flex items-center justify-center text-center relative h-full w-full">
        {isTransitioning && prevIndex !== null && (
          <span
            key={`prev-${prevIndex}`}
            className="absolute inset-0 flex items-center justify-center animate-ann-slide-out pointer-events-none px-4"
          >
            {announcements[prevIndex]}
          </span>
        )}
        <span
          key={`curr-${currentIndex}`}
          className={`flex items-center justify-center px-4 ${
            isTransitioning ? "animate-ann-slide-in" : ""
          }`}
        >
          {announcements[currentIndex]}
        </span>
      </Container>
    </div>
  );
}
