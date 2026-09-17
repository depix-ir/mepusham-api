"use client";

import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

export interface ConfirmDialogConfig {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
}

interface ConfirmActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  config: ConfirmDialogConfig | null;
}

export function ConfirmActionDialog({
  isOpen,
  onClose,
  config,
}: ConfirmActionDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !config) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Dialog card */}
      <div className="relative bg-background border border-border rounded-xl shadow-xl w-full max-w-sm p-5 space-y-4 z-10 dir-rtl animate-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              config.isDestructive
                ? "bg-rose-100 text-rose-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            <AlertTriangle className="" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-foreground leading-snug">
              {config.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {config.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <button
            onClick={onClose}
            className="h-9 px-4 text-xs font-bold rounded-md bg-surface-subtle hover:bg-surface-muted text-foreground transition-colors"
          >
            {config.cancelLabel || "انصراف"}
          </button>
          <button
            onClick={() => {
              config.onConfirm();
              onClose();
            }}
            className={`h-9 px-4 text-xs font-bold rounded-md transition-colors shadow-xs ${
              config.isDestructive
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-primary hover:bg-primary-hover text-primary-foreground"
            }`}
          >
            {config.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
