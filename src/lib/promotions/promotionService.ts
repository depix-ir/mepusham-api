import {
  ProductDiscount,
  Campaign,
  FreeShippingRule,
  getPromotionStatus,
} from "@/types/promotion";
import {
  INITIAL_DISCOUNTS,
  INITIAL_CAMPAIGNS,
  INITIAL_FREE_SHIPPING_RULES,
} from "@/data/mockPromotionData";

export { getPromotionStatus } from "@/types/promotion";

const STORAGE_KEYS = {
  DISCOUNTS: "mepusham_discounts_v1",
  CAMPAIGNS: "mepusham_campaigns_v1",
  FREE_SHIPPING: "mepusham_free_shipping_v1",
};

// In-memory fallback store for SSR / testing environments
const memoryStore: Record<string, unknown> = {};

function loadStorage<T>(key: string, initialData: T): T {
  if (typeof window === "undefined") {
    if (!memoryStore[key]) {
      memoryStore[key] = initialData;
    }
    return memoryStore[key] as T;
  }
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(initialData));
      memoryStore[key] = initialData;
      return initialData;
    }
    const parsed = JSON.parse(raw) as T;
    memoryStore[key] = parsed;
    return parsed;
  } catch (err) {
    if (!memoryStore[key]) {
      memoryStore[key] = initialData;
    }
    return memoryStore[key] as T;
  }
}

function saveStorage<T>(key: string, data: T): void {
  memoryStore[key] = data;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving storage key ${key}:`, err);
  }
}

// ==========================================
// DISCOUNT CRUD SERVICES
// ==========================================

export function getDiscounts(): ProductDiscount[] {
  return loadStorage<ProductDiscount[]>(
    STORAGE_KEYS.DISCOUNTS,
    INITIAL_DISCOUNTS
  );
}

export function getDiscount(id: string): ProductDiscount | undefined {
  const discounts = getDiscounts();
  return discounts.find((d) => d.id === id);
}

export function createDiscount(
  data: Omit<ProductDiscount, "id" | "usedCount" | "createdAt" | "updatedAt">
): ProductDiscount {
  const discounts = getDiscounts();
  const nowIso = new Date().toISOString();
  const newDiscount: ProductDiscount = {
    ...data,
    id: `disc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    usedCount: 0,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  const updated = [newDiscount, ...discounts];
  saveStorage(STORAGE_KEYS.DISCOUNTS, updated);
  return newDiscount;
}

export function updateDiscount(
  id: string,
  data: Partial<Omit<ProductDiscount, "id" | "createdAt">>
): ProductDiscount | undefined {
  const discounts = getDiscounts();
  const index = discounts.findIndex((d) => d.id === id);
  if (index === -1) return undefined;

  const updatedDiscount: ProductDiscount = {
    ...discounts[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  discounts[index] = updatedDiscount;
  saveStorage(STORAGE_KEYS.DISCOUNTS, discounts);
  return updatedDiscount;
}

export function deactivateDiscount(id: string): ProductDiscount | undefined {
  return updateDiscount(id, { isActive: false });
}

export function deleteDiscount(id: string): boolean {
  const discounts = getDiscounts();
  const filtered = discounts.filter((d) => d.id !== id);
  if (filtered.length === discounts.length) return false;
  saveStorage(STORAGE_KEYS.DISCOUNTS, filtered);
  return true;
}

// ==========================================
// CAMPAIGN CRUD SERVICES
// ==========================================

export function getCampaigns(): Campaign[] {
  return loadStorage<Campaign[]>(STORAGE_KEYS.CAMPAIGNS, INITIAL_CAMPAIGNS);
}

export function getCampaign(id: string): Campaign | undefined {
  const campaigns = getCampaigns();
  return campaigns.find((c) => c.id === id);
}

export function createCampaign(
  data: Omit<Campaign, "id" | "usedCount" | "createdAt" | "updatedAt">
): Campaign {
  const campaigns = getCampaigns();
  const nowIso = new Date().toISOString();
  const newCampaign: Campaign = {
    ...data,
    id: `camp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    usedCount: 0,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  const updated = [newCampaign, ...campaigns];
  saveStorage(STORAGE_KEYS.CAMPAIGNS, updated);
  return newCampaign;
}

export function updateCampaign(
  id: string,
  data: Partial<Omit<Campaign, "id" | "createdAt">>
): Campaign | undefined {
  const campaigns = getCampaigns();
  const index = campaigns.findIndex((c) => c.id === id);
  if (index === -1) return undefined;

  const updatedCampaign: Campaign = {
    ...campaigns[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  campaigns[index] = updatedCampaign;
  saveStorage(STORAGE_KEYS.CAMPAIGNS, campaigns);
  return updatedCampaign;
}

// ==========================================
// FREE SHIPPING CRUD SERVICES
// ==========================================

export function getFreeShippingRules(): FreeShippingRule[] {
  return loadStorage<FreeShippingRule[]>(
    STORAGE_KEYS.FREE_SHIPPING,
    INITIAL_FREE_SHIPPING_RULES
  );
}

export function getFreeShippingRule(id: string): FreeShippingRule | undefined {
  const rules = getFreeShippingRules();
  return rules.find((r) => r.id === id);
}

export function createFreeShippingRule(
  data: Omit<FreeShippingRule, "id" | "usedCount" | "createdAt" | "updatedAt">
): FreeShippingRule {
  const rules = getFreeShippingRules();
  const nowIso = new Date().toISOString();
  const newRule: FreeShippingRule = {
    ...data,
    id: `fs-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    usedCount: 0,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  const updated = [newRule, ...rules];
  saveStorage(STORAGE_KEYS.FREE_SHIPPING, updated);
  return newRule;
}

export function updateFreeShippingRule(
  id: string,
  data: Partial<Omit<FreeShippingRule, "id" | "createdAt">>
): FreeShippingRule | undefined {
  const rules = getFreeShippingRules();
  const index = rules.findIndex((r) => r.id === id);
  if (index === -1) return undefined;

  const updatedRule: FreeShippingRule = {
    ...rules[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  rules[index] = updatedRule;
  saveStorage(STORAGE_KEYS.FREE_SHIPPING, rules);
  return updatedRule;
}

export function deactivateFreeShippingRule(
  id: string
): FreeShippingRule | undefined {
  return updateFreeShippingRule(id, { isActive: false });
}

export function deleteFreeShippingRule(id: string): boolean {
  const rules = getFreeShippingRules();
  const filtered = rules.filter((r) => r.id !== id);
  if (filtered.length === rules.length) return false;
  saveStorage(STORAGE_KEYS.FREE_SHIPPING, filtered);
  return true;
}

// ==========================================
// CENTRALIZED PRICING & DISCOUNT EVALUATION
// ==========================================

export interface BestDiscountResult {
  discount: ProductDiscount;
  monetarySaving: number;
  finalPrice: number;
}

/**
 * Evaluates all eligible discounts for a given product and price,
 * selecting strictly the single discount that yields the HIGHEST monetary saving.
 * DISCOUNTS NEVER STACK.
 */
export function calculateBestDiscount(
  productId: string,
  variantPrice: number,
  cartTotal?: number,
  now: Date = new Date()
): BestDiscountResult | null {
  if (variantPrice <= 0) return null;

  const discounts = getDiscounts();
  const campaigns = getCampaigns();

  // Find all candidate discounts applicable to this product
  const candidateDiscounts = discounts.filter((discount) => {
    // 1. Must be active status
    const status = getPromotionStatus(
      discount.isActive,
      discount.startsAt,
      discount.endsAt,
      now
    );
    if (status !== "active") return false;

    // 2. Must not have exceeded usage limit
    if (
      discount.usageLimit !== undefined &&
      discount.usedCount >= discount.usageLimit
    ) {
      return false;
    }

    // 3. Campaign restrictions if linked
    if (discount.campaignId) {
      const campaign = campaigns.find((c) => c.id === discount.campaignId);
      if (campaign) {
        const campaignStatus = getPromotionStatus(
          campaign.isActive,
          campaign.startsAt,
          campaign.endsAt,
          now
        );
        if (campaignStatus !== "active") return false;
        if (
          campaign.usageLimit !== undefined &&
          campaign.usedCount >= campaign.usageLimit
        ) {
          return false;
        }

        // Cart total bounds for campaign
        if (cartTotal !== undefined) {
          if (
            campaign.minPurchaseAmount !== undefined &&
            cartTotal < campaign.minPurchaseAmount
          ) {
            return false;
          }
          if (
            campaign.maxPurchaseAmount !== undefined &&
            cartTotal > campaign.maxPurchaseAmount
          ) {
            return false;
          }
        }

        // Verify product belongs to campaign
        if (!campaign.productIds.includes(productId)) {
          return false;
        }
      }
    }

    // 4. Product matching (if explicit productIds list provided)
    if (discount.productIds && discount.productIds.length > 0) {
      if (!discount.productIds.includes(productId)) {
        return false;
      }
    }

    return true;
  });

  if (candidateDiscounts.length === 0) return null;

  // Evaluate monetary saving for each candidate discount
  let bestResult: BestDiscountResult | null = null;
  let maxMonetarySaving = 0;

  for (const discount of candidateDiscounts) {
    let saving = 0;
    if (discount.type === "percentage") {
      saving = Math.round(variantPrice * (discount.value / 100));
    } else if (discount.type === "fixed") {
      saving = Math.min(variantPrice, discount.value);
    }

    if (saving > maxMonetarySaving) {
      maxMonetarySaving = saving;
      bestResult = {
        discount,
        monetarySaving: saving,
        finalPrice: Math.max(0, variantPrice - saving),
      };
    }
  }

  return bestResult;
}

// ==========================================
// CENTRALIZED FREE SHIPPING EVALUATION
// ==========================================

export interface FreeShippingCartItem {
  productId: string;
  categoryId?: string;
  price: number;
  quantity: number;
}

export interface FreeShippingEvaluationResult {
  isFreeShipping: boolean;
  appliedRule: FreeShippingRule | null;
}

/**
 * Evaluates whether free shipping applies to the cart.
 * If multiple free shipping rules apply, it is applied only once (shipping = 0).
 */
export function evaluateFreeShipping(
  cartItems: FreeShippingCartItem[],
  cartTotal: number,
  now: Date = new Date()
): FreeShippingEvaluationResult {
  const rules = getFreeShippingRules();
  const campaigns = getCampaigns();

  for (const rule of rules) {
    // 1. Must be active status
    const status = getPromotionStatus(
      rule.isActive,
      rule.startsAt,
      rule.endsAt,
      now
    );
    if (status !== "active") continue;

    // 2. Usage limit check
    if (rule.usageLimit !== undefined && rule.usedCount >= rule.usageLimit) {
      continue;
    }

    // 3. Purchase bounds check
    if (
      rule.minPurchaseAmount !== undefined &&
      cartTotal < rule.minPurchaseAmount
    ) {
      continue;
    }
    if (
      rule.maxPurchaseAmount !== undefined &&
      cartTotal > rule.maxPurchaseAmount
    ) {
      continue;
    }

    // 4. Scope matching
    if (rule.scope === "store") {
      return { isFreeShipping: true, appliedRule: rule };
    }

    if (rule.scope === "products" && rule.productIds) {
      const hasMatchingProduct = cartItems.some((item) =>
        rule.productIds!.includes(item.productId)
      );
      if (hasMatchingProduct) {
        return { isFreeShipping: true, appliedRule: rule };
      }
    }

    if (rule.scope === "categories" && rule.categoryIds) {
      const hasMatchingCategory = cartItems.some(
        (item) => item.categoryId && rule.categoryIds!.includes(item.categoryId)
      );
      if (hasMatchingCategory) {
        return { isFreeShipping: true, appliedRule: rule };
      }
    }

    if (rule.scope === "campaign" && rule.campaignId) {
      const campaign = campaigns.find((c) => c.id === rule.campaignId);
      if (campaign) {
        const campaignStatus = getPromotionStatus(
          campaign.isActive,
          campaign.startsAt,
          campaign.endsAt,
          now
        );
        if (campaignStatus === "active") {
          const hasMatchingCampaignProduct = cartItems.some((item) =>
            campaign.productIds.includes(item.productId)
          );
          if (hasMatchingCampaignProduct) {
            return { isFreeShipping: true, appliedRule: rule };
          }
        }
      }
    }
  }

  return { isFreeShipping: false, appliedRule: null };
}
