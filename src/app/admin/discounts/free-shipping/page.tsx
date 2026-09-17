"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FreeShippingRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/discounts?tab=free-shipping");
  }, [router]);

  return (
    <div className="py-12 text-center text-muted-foreground text-sm font-medium dir-rtl">
      در حال انتقال به بخش قوانین ارسال رایگان...
    </div>
  );
}
