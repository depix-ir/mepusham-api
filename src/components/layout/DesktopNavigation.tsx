"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { MegaMenu } from "./MegaMenu";
import { primaryNavItems, PrimaryNavItem } from "./navigation.data";

export interface DesktopNavigationProps {
  items?: PrimaryNavItem[];
}

export function DesktopNavigation({
  items = primaryNavItems,
}: DesktopNavigationProps) {
  const pathname = usePathname();
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  const lastScrollYRef = useRef(0);
  const pivotScrollYRef = useRef(0);
  const scrollDirectionRef = useRef<"up" | "down" | null>(null);
  const openTimerRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  // Close mega menu on route change
  const prevPathnameRef = useRef(pathname);
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      setIsMegaMenuOpen(false);
    }
  }, [pathname]);

  // Smart Sticky Scroll Behavior
  useEffect(() => {
    const HIDE_THRESHOLD = 100; // Scroll down 100px to hide
    const SHOW_THRESHOLD = 60; // Scroll up 60px to show
    const topBuffer = 80; // Always visible near top

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // When near top of page, always keep navigation visible
      if (currentScrollY <= topBuffer) {
        setIsNavVisible(true);
        lastScrollYRef.current = currentScrollY;
        pivotScrollYRef.current = currentScrollY;
        scrollDirectionRef.current = null;
        return;
      }

      const diff = currentScrollY - lastScrollYRef.current;
      if (diff === 0) return;

      const currentDirection = diff > 0 ? "down" : "up";

      if (currentDirection !== scrollDirectionRef.current) {
        scrollDirectionRef.current = currentDirection;
        pivotScrollYRef.current = lastScrollYRef.current;
      }

      lastScrollYRef.current = currentScrollY;

      if (currentDirection === "down") {
        const downDistance = currentScrollY - pivotScrollYRef.current;
        if (downDistance >= HIDE_THRESHOLD) {
          setIsNavVisible(false);
          setIsMegaMenuOpen(false); // Close mega menu on scroll down
        }
      } else if (currentDirection === "up") {
        const upDistance = pivotScrollYRef.current - currentScrollY;
        if (upDistance >= SHOW_THRESHOLD) {
          setIsNavVisible(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hover Handlers for Products Trigger
  const handleMouseEnterProducts = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    openTimerRef.current = setTimeout(() => {
      setIsMegaMenuOpen(true);
    }, 180); // 180ms hover delay requirement
  };

  const handleMouseLeaveProducts = () => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    closeTimerRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 200);
  };

  // Hover Handlers for Mega Menu Container
  const handleMouseEnterMegaMenu = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleMouseLeaveMegaMenu = () => {
    closeTimerRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 200);
  };

  // Keyboard accessibility
  const handleProductsKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (e.key === "ArrowDown" || e.key === " ") {
      e.preventDefault();
      setIsMegaMenuOpen((prev) => !prev);
    }
  };

  return (
    <nav
      aria-label="منوی اصلی دسکتاپ"
      className="hidden md:block w-full border-b border-border bg-background relative z-30 transition-all duration-300 ease-in-out motion-reduce:transition-none"
      style={{
        maxHeight: isNavVisible ? "52px" : "0px",
        opacity: isNavVisible ? 1 : 0,
        transform: isNavVisible ? "translateY(0)" : "translateY(-100%)",
        visibility: isNavVisible ? "visible" : "hidden",
        overflow: isNavVisible ? "visible" : "hidden",
      }}
    >
      <Container className="relative">
        <ul className="flex items-center gap-8 h-12 text-sm font-medium">
          {items.map((item) => {
            const isProducts = item.hasMegaMenu || item.id === "products";

            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href ||
                  pathname?.startsWith(item.href) ||
                  (isProducts && pathname?.startsWith("/category"));

            return (
              <li
                key={item.id}
                className="relative flex items-center h-full"
                onMouseEnter={isProducts ? handleMouseEnterProducts : undefined}
                onMouseLeave={isProducts ? handleMouseLeaveProducts : undefined}
              >
                <Link
                  href={item.href}
                  onKeyDown={isProducts ? handleProductsKeyDown : undefined}
                  aria-expanded={isProducts ? isMegaMenuOpen : undefined}
                  aria-haspopup={isProducts ? "true" : undefined}
                  className={`relative py-3 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xs ${
                    isActive
                      ? "text-primary font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full"
                      : "text-foreground hover:text-primary font-medium"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Mega Menu Component */}
        <MegaMenu
          isOpen={isMegaMenuOpen && isNavVisible}
          onClose={() => setIsMegaMenuOpen(false)}
          onMouseEnter={handleMouseEnterMegaMenu}
          onMouseLeave={handleMouseLeaveMegaMenu}
        />
      </Container>
    </nav>
  );
}
