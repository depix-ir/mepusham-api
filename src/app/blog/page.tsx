import React from "react";
import { Container } from "@/components/ui/Container";

export default function BlogPage() {
  return (
    <Container className="py-12 md:py-16">
      <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4">
        وبلاگ مپوشام
      </h1>
      <p className="text-neutral-600 text-sm md:text-base leading-relaxed">
        به‌زودی جدیدترین مقالات و راهنماهای استایل و مد زنانه در این بخش منتشر خواهد شد.
      </p>
    </Container>
  );
}
