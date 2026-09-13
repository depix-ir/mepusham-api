import React from "react";
import { Container } from "@/components/ui/Container";

export default function ReturnsPage() {
  return (
    <Container className="py-12 md:py-16 max-w-4xl">
      <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-6">
        شرایط بازگشت کالا
      </h1>
      <div className="space-y-4 text-neutral-600 text-sm md:text-base leading-relaxed">
        <p>
          رضایتمندی مشتریان از اولویت‌های اصلی مپوشام است. در همین راستا، امکان بازگشت کالا تا ۷ روز پس از تحویل سفارش طبق شرایط زیر مهیا می‌باشد:
        </p>
        <ul className="list-disc list-inside space-y-2 text-neutral-700 pr-2">
          <li>کالا در حالت اولیه و با اتیکت اصلی باشد.</li>
          <li>کالا دچار آسیب‌دیدگی یا بوی عطر و مواد شوینده نشده باشد.</li>
          <li>جهت هماهنگی مرجوعی، می‌توانید از بخش پشتیبانی در حساب کاربری خود اقدام نمایید.</li>
        </ul>
      </div>
    </Container>
  );
}
