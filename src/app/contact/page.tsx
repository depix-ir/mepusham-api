import React from "react";
import { Container } from "@/components/ui/Container";

export default function ContactPage() {
  return (
    <Container className="py-12 md:py-16">
      <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4">
        تماس با ما
      </h1>
      <p className="text-neutral-600 text-sm md:text-base leading-relaxed mb-6">
        تیم پشتیبانی مپوشــــم همواره آماده پاسخگویی به سوالات و نظرات شماست.
      </p>
      <div className="flex flex-col gap-3 text-sm text-neutral-700">
        <p><strong>ایمیل پشتیبانی:</strong> info@mepusham.ir</p>
        <p><strong>تلفن پشتیبانی:</strong> ۰۲۱-۱۲۳۴۵۶۷۸</p>
        <p><strong>ساعات کاری:</strong> شنبه تا پنجشنبه از ۹:۰۰ الی ۱۸:۰۰</p>
      </div>
    </Container>
  );
}
