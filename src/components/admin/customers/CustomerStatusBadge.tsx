"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { CustomerStatus } from "@/lib/customer/customerService";

interface CustomerStatusBadgeProps {
  status: CustomerStatus;
  className?: string;
}

export function CustomerStatusBadge({
  status,
  className = "",
}: CustomerStatusBadgeProps) {
  if (status === "active") {
    return (
      <Badge variant="success" size="sm" className={`font-semibold ${className}`}>
        فعال
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" size="sm" className={`font-semibold text-muted-foreground ${className}`}>
      غیرفعال
    </Badge>
  );
}
