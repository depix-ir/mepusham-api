import React from "react";
import { Container } from "@/components/ui/Container";

export default function PrivacyPage() {
  return (
    <Container className="py-12 md:py-16 max-w-4xl">
      <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-6">
        حریم خصوصی
      </h1>
      <div className="space-y-4 text-neutral-600 text-sm md:text-base leading-relaxed">
        <p>
          فروشگاه اینترنتی مپوشام با احترام به حریم شخصی کاربران، برای خرید، ثبت نظر یا استفاده از برخی امکانات وب‌سایت، اطلاعاتی را از کاربران درخواست می‌کند تا بتواند خدماتی امن و مطمئن را به کاربران ارائه دهد.
        </p>
        <p>
          اطلاعات شخصی شما نزد مپوشام محفوظ بوده و به هیچ شخص یا سازمان دیگری واگذار نخواهد شد.
        </p>
      </div>
    </Container>
  );
}
