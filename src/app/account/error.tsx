"use client";

import React, { useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { ErrorState } from "@/components/ui/ErrorState";
import { routes } from "@/lib/routes";

export default function AccountErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Account error boundary caught error:", error);
  }, [error]);

  return (
    <div className="py-12 sm:py-20 bg-background min-h-[60vh] flex items-center justify-center">
      <Container className="max-w-xl">
        <ErrorState
          title="خطایی در بخش حساب کاربری رخ داد"
          description="مشکلی در بارگیری اطلاعات حساب کاربری به وجود آمده است. لطفاً دوباره تلاش کنید."
          actionLabel="تلاش دوباره"
          onAction={reset}
          secondaryActionLabel="بازگشت به حساب کاربری"
          secondaryHref={routes.account.root}
        />
      </Container>
    </div>
  );
}
