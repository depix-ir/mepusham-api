"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface AccountPageHeaderProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  backUrl?: string;
  backLabel?: string;
  badgeText?: string;
  children?: React.ReactNode;
}

export function AccountPageHeader({
  title,
  description,
  icon: Icon,
  backUrl = "/account",
  backLabel = "بازگشت به حساب کاربری",
  badgeText,
  children,
}: AccountPageHeaderProps) {
  return (
    <div className="bg-primary rounded-2xl p-4 sm:p-6 md:p-7 text-primary-foreground space-y-3 sm:space-y-4 shadow-sm">
      <div className="flex items-center justify-between gap-2.5 flex-wrap">
        <Link
          href={backUrl}
          className="inline-flex items-center gap-1.5 text-xs text-primary-foreground/90 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-colors shrink-0"
        >
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>{backLabel}</span>
        </Link>

        {badgeText && (
          <span className="text-[11px] sm:text-xs font-bold bg-white/15 px-3 py-1 rounded-full text-white shrink-0">
            {badgeText}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />}
          <span>{title}</span>
        </h1>
        <p className="text-xs sm:text-sm opacity-90 leading-relaxed max-w-xl">
          {description}
        </p>
      </div>

      {children && <div className="pt-1">{children}</div>}
    </div>
  );
}
