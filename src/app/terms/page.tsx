import React from "react";
import { Container } from "@/components/ui/Container";

export default function TermsPage() {
  return (
    <Container className="py-12 md:py-16 max-w-4xl">
      <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-6">
        قوانین و مقررات
      </h1>
      <div className="space-y-4 text-neutral-600 text-sm md:text-base leading-relaxed">
        <p>
          ورود کاربران به وب‌سایت مپوشام هنگام استفاده از پروفایل شخصی، طرح‌های تخفیفی و سایر خدمات به معنای آگاه بودن و پذیرفتن شرایط و قوانین مپوشام است.
        </p>
        <p>
          کلیه اصول و رویه‌های مپوشام منطبق با قوانین جمهوری اسلامی ایران، قانون تجارت الکترونیک و قانون حمایت از حقوق مصرف‌کننده است.
        </p>
      </div>
    </Container>
  );
}
