export type DiscountType = "percentage" | "fixed";

export type DiscountStatus = "active" | "scheduled" | "expired" | "disabled";

export interface ProductDiscount {
  id: string;
  title: string;
  description?: string;
  type: DiscountType;
  value: number;
  productIds?: string[];
  campaignId?: string;
  startsAt: string;
  endsAt: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  title: string;
  description?: string;
  productIds: string[];
  startsAt: string;
  endsAt: string;
  minPurchaseAmount?: number;
  maxPurchaseAmount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type FreeShippingScope = "store" | "products" | "categories" | "campaign";

export interface FreeShippingRule {
  id: string;
  title: string;
  description?: string;
  scope: FreeShippingScope;
  productIds?: string[];
  categoryIds?: string[];
  campaignId?: string;
  minPurchaseAmount?: number;
  maxPurchaseAmount?: number;
  startsAt: string;
  endsAt: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Derives the status of a promotion rule given its active flag and date bounds.
 */
export function getPromotionStatus(
  isActive: boolean,
  startsAt: string,
  endsAt: string,
  now: Date = new Date()
): DiscountStatus {
  if (!isActive) {
    return "disabled";
  }

  const startDate = new Date(startsAt);
  const endDate = new Date(endsAt);
  const currentTime = now.getTime();

  if (!isNaN(startDate.getTime()) && currentTime < startDate.getTime()) {
    return "scheduled";
  }

  if (!isNaN(endDate.getTime()) && currentTime > endDate.getTime()) {
    return "expired";
  }

  return "active";
}

export const statusLabels: Record<DiscountStatus, string> = {
  active: "فعال",
  scheduled: "زمان‌بندی‌شده",
  expired: "منقضی‌شده",
  disabled: "غیرفعال",
};

export const freeShippingScopeLabels: Record<FreeShippingScope, string> = {
  store: "کل فروشگاه",
  products: "محصولات مشخص",
  categories: "دسته‌بندی‌های مشخص",
  campaign: "کمپین",
};
