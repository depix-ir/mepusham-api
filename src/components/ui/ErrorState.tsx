"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  href?: string;
  secondaryActionLabel?: string;
  secondaryHref?: string;
  onSecondaryAction?: () => void;
  code?: string | number;
  className?: string;
  bordered?: boolean;
}

export function ErrorState({
  title = "مشکلی در دریافت اطلاعات پیش آمده است",
  description = "لطفاً اتصال اینترنت خود را بررسی کرده و مجدداً تلاش کنید.",
  icon,
  actionLabel = "تلاش دوباره",
  onAction,
  href,
  secondaryActionLabel,
  secondaryHref,
  onSecondaryAction,
  code,
  className = "",
  bordered = true,
}: ErrorStateProps) {
  const defaultIcon = <AlertCircle className="w-8 h-8 text-amber-600" />;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex flex-col items-center justify-center text-center p-6 sm:p-10 my-4 gap-4 w-full  mx-auto ${
        bordered
          ? "border border-amber-500/20 rounded-2xl bg-amber-500/5"
          : ""
      } ${className}`.trim()}
    >
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
        {icon || defaultIcon}
      </div>

      {code && (
        <span className="text-3xl sm:text-4xl font-extrabold text-foreground/80 tracking-wider font-mono">
          {code}
        </span>
      )}

      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-base sm:text-lg font-bold text-foreground">
          {title}
        </h3>
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
        {/* Primary Action (Retry / Action / Link) */}
        {href ? (
          <Link href={href}>
            <Button variant="primary" size="md" className="rounded-xl px-6 font-bold gap-2">
              <RefreshCw className="w-4 h-4" />
              <span>{actionLabel}</span>
            </Button>
          </Link>
        ) : onAction ? (
          <Button
            variant="primary"
            size="md"
            onClick={onAction}
            className="rounded-xl px-6 font-bold gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{actionLabel}</span>
          </Button>
        ) : null}

        {/* Secondary Action */}
        {secondaryHref ? (
          <Link href={secondaryHref}>
            <Button variant="outline" size="md" className="rounded-xl px-6 font-bold">
              {secondaryActionLabel}
            </Button>
          </Link>
        ) : onSecondaryAction && secondaryActionLabel ? (
          <Button
            variant="outline"
            size="md"
            onClick={onSecondaryAction}
            className="rounded-xl px-6 font-bold"
          >
            {secondaryActionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
