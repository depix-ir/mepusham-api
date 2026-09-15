"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ChevronLeftIcon } from "@/components/icons";
import {
  productMegaMenuCategories,
  MegaMenuCategory,
} from "./navigation.data";

export interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  categories?: MegaMenuCategory[];
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function MegaMenu({
  isOpen,
  onClose,
  categories = productMegaMenuCategories,
  onMouseEnter,
  onMouseLeave,
}: MegaMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="mega-menu-products"
      ref={menuRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="menu"
      aria-label="مگامنو محصولات"
      className="hidden md:block absolute top-full left-0 right-0 z-50 bg-background border-t border-b border-border shadow-xl transition-all duration-200 ease-out animate-in fade-in slide-in-from-top-1"
    >
      <Container className="py-6">
        {/* Categories Grid */}
        <div className="grid grid-cols-5 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="flex flex-col gap-2">
              {/* Category Title Header */}
              <Link
                href={category.href}
                onClick={onClose}
                className="text-sm font-bold text-foreground hover:text-primary transition-colors border-b border-border pb-2 flex items-center justify-between group"
              >
                <span>{category.title}</span>
                <ChevronLeftIcon
                  size={14}
                  className="text-muted-foreground group-hover:text-primary transition-colors"
                />
              </Link>

              {/* Subcategories List */}
              <ul className="flex flex-col gap-1.5 pt-1">
                {category.items.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="text-xs text-foreground/75 hover:text-primary font-normal transition-colors py-1 block leading-relaxed"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Mega Menu Footer Action Bar */}
        <div className="mt-6 pt-4 border-t border-border/80 flex items-center justify-between bg-surface-muted/50 -mx-3 -mb-6 px-6 py-3 rounded-b-lg">
          <span className="text-xs text-foreground/60 font-medium">
            دسته‌بندی‌های متنوع پوشاک، کیف، کفش و اکسسوری زنانه و دخترانه
          </span>
          <Link
            href="/products"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover transition-colors group"
          >
            <span>مشاهده همه محصولات</span>
            <ChevronLeftIcon
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </Container>
    </div>
  );
}
