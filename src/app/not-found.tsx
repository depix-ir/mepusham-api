"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { routes } from "@/lib/routes";
import { ArrowRight, Home, FileQuestion } from "lucide-react";

export default function NotFound() {
  const router = RouterHook();

  return (
    <div className="py-12 sm:py-20 bg-background min-h-[70vh] flex items-center justify-center">
      <Container className="max-w-xl text-center space-y-6">
        {/* 404 Visual Badge */}
        <div className="relative inline-flex items-center justify-center">
          <span className="text-7xl sm:text-9xl font-black text-primary/10 tracking-widest font-mono select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-surface-subtle border border-border shadow-2xs flex items-center justify-center text-primary">
              <FileQuestion className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
          </div>
        </div>

        {/* Messaging */}
        <div className="space-y-2 max-w-md mx-auto">
          <h1 className="text-lg sm:text-2xl font-bold text-foreground">
            صفحه‌ای که دنبال آن هستید پیدا نشد
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            ممکن است آدرس صفحه را اشتباه وارد کرده باشید یا این صفحه منتقل یا حذف شده باشد.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => router.handleBack()}
            className="rounded-xl px-6 font-bold gap-2"
          >
            <span>بازگشت به صفحه قبل</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Button>

          <Link href={routes.home}>
            <Button
              variant="outline"
              size="md"
              className="rounded-xl px-6 font-bold gap-2 w-full"
            >
              <Home className="w-4 h-4" />
              <span>صفحه اصلی</span>
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}

function RouterHook() {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(routes.home);
    }
  };

  return { handleBack };
}
