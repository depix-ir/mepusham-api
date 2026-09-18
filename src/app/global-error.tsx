"use client";

import React, { useEffect } from "react";
import { peydaFont } from "@/lib/fonts";
import { ErrorState } from "@/components/ui/ErrorState";
import { routes } from "@/lib/routes";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error boundary caught critical error:", error);
  }, [error]);

  return (
    <html lang="fa" dir="rtl" className={peydaFont.variable}>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-xl">
          <ErrorState
            title="خطای کلی در بارگیری سیستم"
            description="متأسفانه اختلالی در بارگیری اولیه سیستم رخ داده است. لطفاً صفحه را بازنشانی کنید."
            actionLabel="تلاش دوباره"
            onAction={reset}
            secondaryActionLabel="صفحه اصلی"
            secondaryHref={routes.home}
            code="500"
          />
        </div>
      </body>
    </html>
  );
}
