"use client";

import React, { useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { ErrorState } from "@/components/ui/ErrorState";
import { routes } from "@/lib/routes";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Internal error logging
    console.error("Application runtime error boundary caught error:", error);
  }, [error]);

  return (
    <div className="py-12 sm:py-20 bg-background min-h-[70vh] flex items-center justify-center">
      <Container className="max-w-xl">
        <ErrorState
          title="خطایی در نمایش این صفحه رخ داد"
          description="مشکلی در برقراری ارتباط یا پردازش درخواست پیش آمده است. لطفاً دوباره تلاش کنید."
          actionLabel="تلاش دوباره"
          onAction={reset}
          secondaryActionLabel="صفحه اصلی"
          secondaryHref={routes.home}
          code="500"
        />
      </Container>
    </div>
  );
}
