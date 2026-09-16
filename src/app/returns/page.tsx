"use client";

import React from "react";
import { Container } from "@/components/ui/Container";
import { AccountPageHeader } from "@/components/account/AccountPageHeader";
import { RotateCcw } from "lucide-react";

export default function ReturnsPage() {
  return (
    <Container className="py-8 sm:py-12 max-w-4xl space-y-6">
      <AccountPageHeader
        title="شرایط و قوانین بازگشت کالا"
        description="راهنما و قوانین استرداد کالا"
        icon={RotateCcw}
        backUrl="/account"
        backLabel="بازگشت به حساب کاربری"
      />
      <div className="space-y-4 text-neutral-600 text-sm md:text-base leading-relaxed">
        <p>
          رضایتمندی مشتریان از اولویت‌های اصلی مپوشام است. در همین راستا، امکان بازگشت کالا تا ۷ روز پس از تحویل سفارش طبق شرایط زیر مهیا می‌باشد:
        </p>
        <ul className="list-disc list-inside space-y-2 text-neutral-700 pr-2">
          <li>کالا در حالت اولیه و با اتیکت اصلی باشد.</li>
          <li>کالا دچار آسیب‌دیدگی یا بوی عطر و مواد شوینده نشده باشد.</li>
          <li>جهت هماهنگی مرجوعی، می‌توانید از بخش <a href="/support" className="text-primary font-bold hover:underline">پشتیبانی و تیکت‌ها</a> اقدام نمایید.</li>
        </ul>
      </div>
    </Container>
  );
}
