"use client";

import React from "react";
import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { Button } from "./Button";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  href?: string;
  className?: string;
  bordered?: boolean;
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  href,
  className = "",
  bordered = true,
}: EmptyStateProps) {
  const defaultIcon = <FolderOpen className="w-8 h-8 text-muted-foreground" />;

  const content = (
    <div
      role="region"
      aria-label={title}
      className={`flex flex-col items-center justify-center text-center p-6 sm:p-10 my-4 gap-4 w-full max-w-lg mx-auto ${
        bordered
          ? "border border-dashed border-border-subtle rounded-2xl bg-surface-subtle/30"
          : ""
      } ${className}`.trim()}
    >
      <div className="w-14 h-14 rounded-2xl bg-surface-muted flex items-center justify-center shrink-0">
        {icon || defaultIcon}
      </div>

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

      {actionLabel && (
        <div className="mt-2">
          {href ? (
            <Link href={href}>
              <Button variant="primary" size="md" className="rounded-xl px-6 font-bold">
                {actionLabel}
              </Button>
            </Link>
          ) : onAction ? (
            <Button
              variant="primary"
              size="md"
              onClick={onAction}
              className="rounded-xl px-6 font-bold"
            >
              {actionLabel}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );

  return content;
}
