"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { FooterBrand } from "./FooterBrand";
import { FooterLinks } from "./FooterLinks";
import { FooterTrust } from "./FooterTrust";
import { FooterBottom } from "./FooterBottom";
import { quickLinks, legalLinks } from "./footer.data";

export function Footer() {
  const pathname = usePathname();
  const isCheckoutOrPayment = pathname === "/checkout" || pathname === "/payment";

  if (isCheckoutOrPayment) {
    return null;
  }

  return (
    <footer className="w-full bg-white text-neutral-900 border-t border-neutral-100 mt-auto">
      <Container className="py-8 md:py-12 flex flex-col gap-8 md:gap-10">
        {/* Main Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
          {/* Brand section - 4 cols on desktop */}
          <div className="md:col-span-4">
            <FooterBrand />
          </div>

          {/* Quick links - 3 cols on desktop */}
          <div className="md:col-span-3">
            <FooterLinks group={quickLinks} />
          </div>

          {/* Legal links - 3 cols on desktop */}
          <div className="md:col-span-3">
            <FooterLinks group={legalLinks} />
          </div>

          {/* Trust badges - 2 cols on desktop */}
          <div className="md:col-span-2">
            <FooterTrust />
          </div>
        </div>

        {/* Bottom copyright divider & bar */}
        <FooterBottom />
      </Container>
    </footer>
  );
}
