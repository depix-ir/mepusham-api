"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "error", duration: number = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, type }]);

      if (duration > 0) {
        setTimeout(() => {
          hideToast(id);
        }, duration);
      }
    },
    [hideToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {/* Toast Render Container */}
      <div
        dir="rtl"
        className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-full max-w-md px-4 pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl shadow-lg border transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
              toast.type === "error"
                ? "bg-red-900/95 text-white border-red-700 shadow-red-950/20"
                : toast.type === "success"
                ? "bg-emerald-900/95 text-white border-emerald-700 shadow-emerald-950/20"
                : toast.type === "warning"
                ? "bg-amber-900/95 text-white border-amber-700 shadow-amber-950/20"
                : "bg-slate-900/95 text-white border-slate-700 shadow-slate-950/20"
            }`}
          >
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              {toast.type === "error" && (
                <AlertCircle className="w-4 h-4 text-red-300 shrink-0" />
              )}
              {toast.type === "success" && (
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              )}
              {toast.type === "warning" && (
                <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
              )}
              {toast.type === "info" && (
                <Info className="w-4 h-4 text-sky-300 shrink-0" />
              )}
              <span className="text-xs sm:text-sm font-medium leading-tight break-words">
                {toast.message}
              </span>
            </div>
            <button
              type="button"
              onClick={() => hideToast(toast.id)}
              className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
              aria-label="بستن پیام"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
