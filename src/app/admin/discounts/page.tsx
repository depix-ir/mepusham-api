"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PromotionTabs, PromotionTabType } from "@/components/admin/promotions/PromotionTabs";
import { PromotionSummaryCards } from "@/components/admin/promotions/PromotionSummaryCards";
import { PromotionFilters, PromotionFilterState } from "@/components/admin/promotions/PromotionFilters";
import { DiscountTable } from "@/components/admin/promotions/DiscountTable";
import { FreeShippingTable } from "@/components/admin/promotions/FreeShippingTable";
import { DiscountFormModal } from "@/components/admin/promotions/DiscountFormModal";
import { FreeShippingFormModal } from "@/components/admin/promotions/FreeShippingFormModal";
import { DiscountDetailModal } from "@/components/admin/promotions/DiscountDetailModal";
import { FreeShippingDetailModal } from "@/components/admin/promotions/FreeShippingDetailModal";
import { DeleteConfirmationModal } from "@/components/admin/promotions/DeleteConfirmationModal";
import { CampaignPickerModal } from "@/components/admin/promotions/CampaignPickerModal";
import { useToast } from "@/components/ui/Toast";

import {
  ProductDiscount,
  FreeShippingRule,
  getPromotionStatus,
} from "@/types/promotion";

import {
  getDiscounts,
  createDiscount,
  updateDiscount,
  deactivateDiscount,
  deleteDiscount,
  getFreeShippingRules,
  createFreeShippingRule,
  updateFreeShippingRule,
  deactivateFreeShippingRule,
  deleteFreeShippingRule,
} from "@/lib/promotions/promotionService";

import { Percent, Truck, Plus, Sparkles } from "lucide-react";

function DiscountsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();

  const tabParam = searchParams.get("tab");
  const activeTab: PromotionTabType =
    tabParam === "free-shipping" ? "free-shipping" : "discounts";

  // Data states
  const [discounts, setDiscounts] = useState<ProductDiscount[]>([]);
  const [freeShippingRules, setFreeShippingRules] = useState<FreeShippingRule[]>([]);

  // Filter state
  const [filters, setFilters] = useState<PromotionFilterState>({
    search: "",
    status: "all",
    type: "all",
    scope: "all",
    sortBy: "newest",
  });

  // Modal States
  const [isDiscountFormOpen, setIsDiscountFormOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<ProductDiscount | null>(null);
  const [viewingDiscount, setViewingDiscount] = useState<ProductDiscount | null>(null);
  const [deletingDiscount, setDeletingDiscount] = useState<ProductDiscount | null>(null);

  const [isFreeShippingFormOpen, setIsFreeShippingFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<FreeShippingRule | null>(null);
  const [viewingRule, setViewingRule] = useState<FreeShippingRule | null>(null);
  const [deletingRule, setDeletingRule] = useState<FreeShippingRule | null>(null);

  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);

  // Load initial data
  const loadData = () => {
    setDiscounts(getDiscounts());
    setFreeShippingRules(getFreeShippingRules());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTabChange = (tab: PromotionTabType) => {
    router.push(`/admin/discounts?tab=${tab}`);
  };

  // Derived metrics for summary cards
  const discountMetrics = useMemo(() => {
    const total = discounts.length;
    let active = 0;
    let scheduled = 0;
    let inactive = 0;

    discounts.forEach((d) => {
      const st = getPromotionStatus(d.isActive, d.startsAt, d.endsAt);
      if (st === "active") active++;
      else if (st === "scheduled") scheduled++;
      else inactive++;
    });

    return { total, active, scheduled, inactive };
  }, [discounts]);

  const freeShippingMetrics = useMemo(() => {
    const total = freeShippingRules.length;
    let active = 0;
    let scheduled = 0;
    let inactive = 0;

    freeShippingRules.forEach((r) => {
      const st = getPromotionStatus(r.isActive, r.startsAt, r.endsAt);
      if (st === "active") active++;
      else if (st === "scheduled") scheduled++;
      else inactive++;
    });

    return { total, active, scheduled, inactive };
  }, [freeShippingRules]);

  // Filtered & Sorted Discounts
  const filteredDiscounts = useMemo(() => {
    return discounts
      .filter((d) => {
        // Status filter
        const st = getPromotionStatus(d.isActive, d.startsAt, d.endsAt);
        if (filters.status !== "all" && st !== filters.status) return false;

        // Type filter
        if (filters.type !== "all" && d.type !== filters.type) return false;

        // Scope filter
        if (filters.scope !== "all") {
          if (filters.scope === "campaign" && !d.campaignId) return false;
          if (filters.scope === "products" && (!d.productIds || d.productIds.length === 0)) return false;
        }

        // Search query
        if (filters.search.trim()) {
          const q = filters.search.toLowerCase().trim();
          const matchTitle = d.title.toLowerCase().includes(q);
          const matchDesc = d.description?.toLowerCase().includes(q);
          const matchId = d.id.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchId) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (filters.sortBy === "highestValue") {
          return b.value - a.value;
        }
        if (filters.sortBy === "highestUsage") {
          return b.usedCount - a.usedCount;
        }
        // Newest default
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [discounts, filters]);

  // Filtered & Sorted Free Shipping Rules
  const filteredFreeShippingRules = useMemo(() => {
    return freeShippingRules
      .filter((r) => {
        const st = getPromotionStatus(r.isActive, r.startsAt, r.endsAt);
        if (filters.status !== "all" && st !== filters.status) return false;

        if (filters.scope !== "all" && r.scope !== filters.scope) return false;

        if (filters.search.trim()) {
          const q = filters.search.toLowerCase().trim();
          const matchTitle = r.title.toLowerCase().includes(q);
          const matchDesc = r.description?.toLowerCase().includes(q);
          const matchId = r.id.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchId) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (filters.sortBy === "highestValue") {
          return (b.minPurchaseAmount || 0) - (a.minPurchaseAmount || 0);
        }
        if (filters.sortBy === "highestUsage") {
          return b.usedCount - a.usedCount;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [freeShippingRules, filters]);

  // Handlers for Discount Mutations
  const handleSaveDiscount = (
    data: Omit<ProductDiscount, "id" | "usedCount" | "createdAt" | "updatedAt">
  ) => {
    if (editingDiscount) {
      updateDiscount(editingDiscount.id, data);
      showToast("تخفیف با موفقیت بروزرسانی شد.", "success");
    } else {
      createDiscount(data);
      showToast("تخفیف جدید با موفقیت ایجاد شد.", "success");
    }
    setEditingDiscount(null);
    loadData();
  };

  const handleDeactivateDiscount = (discount: ProductDiscount) => {
    deactivateDiscount(discount.id);
    showToast(`تخفیف «${discount.title}» غیرفعال شد.`, "info");
    loadData();
  };

  const handleDeleteDiscount = (discount: ProductDiscount) => {
    deleteDiscount(discount.id);
    showToast(`تخفیف «${discount.title}» با موفقیت حذف شد.`, "success");
    setDeletingDiscount(null);
    loadData();
  };

  // Handlers for Free Shipping Mutations
  const handleSaveFreeShipping = (
    data: Omit<FreeShippingRule, "id" | "usedCount" | "createdAt" | "updatedAt">
  ) => {
    if (editingRule) {
      updateFreeShippingRule(editingRule.id, data);
      showToast("قانون ارسال رایگان با موفقیت بروزرسانی شد.", "success");
    } else {
      createFreeShippingRule(data);
      showToast("قانون ارسال رایگان جدید با موفقیت ایجاد شد.", "success");
    }
    setEditingRule(null);
    loadData();
  };

  const handleDeactivateFreeShipping = (rule: FreeShippingRule) => {
    deactivateFreeShippingRule(rule.id);
    showToast(`قانون «${rule.title}» غیرفعال شد.`, "info");
    loadData();
  };

  const handleDeleteFreeShipping = (rule: FreeShippingRule) => {
    deleteFreeShippingRule(rule.id);
    showToast(`قانون «${rule.title}» با موفقیت حذف شد.`, "success");
    setDeletingRule(null);
    loadData();
  };

  return (
    <div className="space-y-6 dir-rtl pb-12">
      {/* Header with Title and CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            {activeTab === "discounts" ? "مدیریت تخفیف‌ها" : "قوانین ارسال رایگان"}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            {activeTab === "discounts"
              ? "مدیریت و زمان‌بندی تخفیف‌های درصدی و مبلغ ثابت محصولات و کمپین‌ها"
              : "مدیریت شرایط و شروط تخصیص ارسال رایگان به خریداران"}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeTab === "discounts" ? (
            <>
              <button
                type="button"
                onClick={() => setIsCampaignModalOpen(true)}
                className="px-3.5 py-2 text-xs md:text-sm font-semibold text-foreground bg-background border border-border rounded-xl hover:bg-surface-subtle transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>مشاهده کمپین‌ها</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingDiscount(null);
                  setIsDiscountFormOpen(true);
                }}
                className="px-4 py-2 text-xs md:text-sm font-bold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>ایجاد تخفیف</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditingRule(null);
                setIsFreeShippingFormOpen(true);
              }}
              className="px-4 py-2 text-xs md:text-sm font-bold text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>ایجاد قانون ارسال رایگان</span>
            </button>
          )}
        </div>
      </div>

      {/* Promotion Navigation Tabs */}
      <PromotionTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        discountCount={discounts.length}
        freeShippingCount={freeShippingRules.length}
      />

      {/* Summary Cards */}
      {activeTab === "discounts" ? (
        <PromotionSummaryCards
          totalCount={discountMetrics.total}
          activeCount={discountMetrics.active}
          scheduledCount={discountMetrics.scheduled}
          inactiveCount={discountMetrics.inactive}
        />
      ) : (
        <PromotionSummaryCards
          totalCount={freeShippingMetrics.total}
          activeCount={freeShippingMetrics.active}
          scheduledCount={freeShippingMetrics.scheduled}
          inactiveCount={freeShippingMetrics.inactive}
          isFreeShipping
        />
      )}

      {/* Search & Filters */}
      <PromotionFilters
        filters={filters}
        onChange={setFilters}
        isFreeShipping={activeTab === "free-shipping"}
      />

      {/* Data Table / Cards */}
      {activeTab === "discounts" ? (
        <DiscountTable
          discounts={filteredDiscounts}
          onView={(d) => setViewingDiscount(d)}
          onEdit={(d) => {
            setEditingDiscount(d);
            setIsDiscountFormOpen(true);
          }}
          onDeactivate={(d) => handleDeactivateDiscount(d)}
          onDelete={(d) => setDeletingDiscount(d)}
        />
      ) : (
        <FreeShippingTable
          rules={filteredFreeShippingRules}
          onView={(r) => setViewingRule(r)}
          onEdit={(r) => {
            setEditingRule(r);
            setIsFreeShippingFormOpen(true);
          }}
          onDeactivate={(r) => handleDeactivateFreeShipping(r)}
          onDelete={(r) => setDeletingRule(r)}
        />
      )}

      {/* Modals for Discounts */}
      <DiscountFormModal
        isOpen={isDiscountFormOpen}
        onClose={() => {
          setIsDiscountFormOpen(false);
          setEditingDiscount(null);
        }}
        initialData={editingDiscount}
        onSave={handleSaveDiscount}
      />

      <DiscountDetailModal
        isOpen={!!viewingDiscount}
        onClose={() => setViewingDiscount(null)}
        discount={viewingDiscount}
        onEdit={(d) => {
          setViewingDiscount(null);
          setEditingDiscount(d);
          setIsDiscountFormOpen(true);
        }}
        onDeactivate={(d) => handleDeactivateDiscount(d)}
        onDelete={(d) => {
          setViewingDiscount(null);
          setDeletingDiscount(d);
        }}
      />

      <DeleteConfirmationModal
        isOpen={!!deletingDiscount}
        onClose={() => setDeletingDiscount(null)}
        title="حذف تخفیف"
        itemTitle={deletingDiscount?.title || ""}
        isActive={deletingDiscount ? getPromotionStatus(deletingDiscount.isActive, deletingDiscount.startsAt, deletingDiscount.endsAt) === "active" : false}
        usedCount={deletingDiscount?.usedCount || 0}
        onDeactivate={() => deletingDiscount && handleDeactivateDiscount(deletingDiscount)}
        onDelete={() => deletingDiscount && handleDeleteDiscount(deletingDiscount)}
      />

      {/* Modals for Free Shipping */}
      <FreeShippingFormModal
        isOpen={isFreeShippingFormOpen}
        onClose={() => {
          setIsFreeShippingFormOpen(false);
          setEditingRule(null);
        }}
        initialData={editingRule}
        onSave={handleSaveFreeShipping}
      />

      <FreeShippingDetailModal
        isOpen={!!viewingRule}
        onClose={() => setViewingRule(null)}
        rule={viewingRule}
        onEdit={(r) => {
          setViewingRule(null);
          setEditingRule(r);
          setIsFreeShippingFormOpen(true);
        }}
        onDeactivate={(r) => handleDeactivateFreeShipping(r)}
        onDelete={(r) => {
          setViewingRule(null);
          setDeletingRule(r);
        }}
      />

      <DeleteConfirmationModal
        isOpen={!!deletingRule}
        onClose={() => setDeletingRule(null)}
        title="حذف قانون ارسال رایگان"
        itemTitle={deletingRule?.title || ""}
        isActive={deletingRule ? getPromotionStatus(deletingRule.isActive, deletingRule.startsAt, deletingRule.endsAt) === "active" : false}
        usedCount={deletingRule?.usedCount || 0}
        onDeactivate={() => deletingRule && handleDeactivateFreeShipping(deletingRule)}
        onDelete={() => deletingRule && handleDeleteFreeShipping(deletingRule)}
      />

      {/* Campaign Picker Modal View */}
      <CampaignPickerModal
        isOpen={isCampaignModalOpen}
        onClose={() => setIsCampaignModalOpen(false)}
        onConfirm={(campId) => {
          setIsCampaignModalOpen(false);
          showToast(`کمپین با موفقیت انتخاب شد.`, "info");
        }}
      />
    </div>
  );
}

export default function AdminDiscountsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">در حال بارگذاری تخفیف‌ها...</div>}>
      <DiscountsContent />
    </Suspense>
  );
}
