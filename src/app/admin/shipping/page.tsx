"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ShippingRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/discounts?tab=free-shipping");
  }, [router]);

  return (
    <div className="py-12 text-center text-muted-foreground text-sm font-medium">
      در حال انتقال به بخش قوانین ارسال رایگان...
    </div>
  );
}
