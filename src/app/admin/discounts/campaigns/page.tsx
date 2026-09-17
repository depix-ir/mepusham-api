"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CampaignsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/discounts?tab=campaigns");
  }, [router]);

  return (
    <div className="py-12 text-center text-muted-foreground text-sm font-medium dir-rtl">
      در حال انتقال به بخش کمپین‌ها...
    </div>
  );
}
