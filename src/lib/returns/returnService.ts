import { Order } from "@/types/account";
import { Product } from "@/types/product";
import {
  ReturnRequest,
  ReturnItem,
  ReturnReason,
  ReturnRequestFilters,
  InspectionResult,
  ReturnTimelineEvent,
  Refund,
  ExchangeDetails,
} from "@/types/return";
import { getReturnPolicy } from "./policy";
import {
  checkOrderEligibility,
  checkItemEligibility,
  validateExchangeVariant,
} from "./eligibility";
import { isValidStateTransition, isActionRequiredByAdmin } from "./stateMachine";
import { mockInitialReturnRequests } from "@/data/mockReturnData";
import { authService } from "@/lib/auth/authService";
import { addInventoryHistoryLog } from "@/lib/inventory/inventoryService";
import { storeSettingsService } from "@/lib/store-settings/storeSettingsService";

const RETURNS_STORAGE_KEY = "mepusham_returns_v1";
const PRODUCTS_STORAGE_KEY = "admin_store_products_v1";

export class ReturnService {
  /* ================= GET ALL REQUESTS ================= */

  getReturnRequests(
    filters?: ReturnRequestFilters,
    options?: { isHydrated?: boolean }
  ): {
    items: ReturnRequest[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } {
    let requests = this.loadAllRequests(options?.isHydrated);

    if (!filters) {
      return {
        items: requests,
        total: requests.length,
        page: 1,
        pageSize: requests.length,
        totalPages: 1,
      };
    }

    // Apply Filter: Type
    if (filters.type && filters.type !== "all") {
      requests = requests.filter((r) => r.type === filters.type);
    }

    // Apply Filter: Status
    if (filters.status && filters.status !== "all") {
      requests = requests.filter((r) => r.status === filters.status);
    }

    // Apply Filter: Reason
    if (filters.reason && filters.reason !== "all") {
      requests = requests.filter((r) => r.reason === filters.reason);
    }

    // Apply Filter: Action Required Only
    if (filters.actionRequiredOnly) {
      requests = requests.filter((r) => isActionRequiredByAdmin(r.status));
    }

    // Apply Filter: Date Range
    if (filters.dateRange && filters.dateRange !== "all") {
      const now = new Date();
      const cutoff = new Date();
      if (filters.dateRange === "today") {
        cutoff.setHours(0, 0, 0, 0);
      } else if (filters.dateRange === "7days") {
        cutoff.setDate(now.getDate() - 7);
      } else if (filters.dateRange === "30days") {
        cutoff.setDate(now.getDate() - 30);
      }
      requests = requests.filter((r) => new Date(r.createdAt) >= cutoff);
    }

    // Apply Filter: Search Query (Abstraction for Search)
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const query = filters.searchQuery.trim().toLowerCase();
      requests = requests.filter((r) => {
        const matchesId = r.id.toLowerCase().includes(query) || r.requestNumber.toLowerCase().includes(query);
        const matchesOrder = r.orderId.toLowerCase().includes(query) || r.orderNumber.toLowerCase().includes(query);
        const matchesCustomer = r.customerName.toLowerCase().includes(query) || r.customerPhone.includes(query);
        const matchesTracking = r.shipment?.trackingCode?.toLowerCase().includes(query) || r.exchange?.replacementShipment?.trackingCode?.toLowerCase().includes(query);
        const matchesItem = r.items.some(
          (item) =>
            item.productTitle.toLowerCase().includes(query) ||
            (item.sku && item.sku.toLowerCase().includes(query)) ||
            (item.variantDisplay && item.variantDisplay.toLowerCase().includes(query))
        );
        return matchesId || matchesOrder || matchesCustomer || matchesTracking || matchesItem;
      });
    }

    // Pagination
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 10;
    const total = requests.length;
    const totalPages = Math.ceil(total / pageSize) || 1;

    const startIndex = (page - 1) * pageSize;
    const paginatedItems = requests.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  /* ================= GET BY ID ================= */

  getReturnRequestById(id: string): ReturnRequest | undefined {
    const clean = id.trim().toLowerCase();
    const requests = this.loadAllRequests();
    return requests.find(
      (r) =>
        r.id.toLowerCase() === clean ||
        r.requestNumber.toLowerCase() === clean ||
        r.id.toLowerCase() === `ret-${clean}`
    );
  }

  /**
   * Secure customer return lookup enforcing service-level ownership checks (IDOR protection).
   */
  getReturnRequestByIdForCustomer(id: string): ReturnRequest | undefined {
    const request = this.getReturnRequestById(id);
    if (!request) return undefined;
    const isOwner =
      authService.validateOwnership(request.customerId) ||
      authService.validateOwnership(request.customerPhone);
    if (!isOwner) return undefined;
    return request;
  }

  /* ================= CREATE RETURN REQUEST ================= */

  createReturnRequest(params: {
    order: Order;
    items: Array<{
      orderItemId: string;
      quantity: number;
      reason: ReturnReason;
      customerNote?: string;
      evidence?: string[];
    }>;
    reason: ReturnReason;
    customerNote?: string;
  }): ReturnRequest {
    const allRequests = this.loadAllRequests();

    // 1. Eligibility Check
    const eligibility = checkOrderEligibility(params.order, allRequests);
    if (!eligibility.isEligible) {
      throw new Error(eligibility.reason || "این سفارش واجد شرایط مرجوعی نیست.");
    }

    // 2. Validate Items & Quantities
    const returnItems: ReturnItem[] = [];
    let totalRefundAmount = 0;

    for (const reqItem of params.items) {
      const orderItem = params.order.items.find((i) => i.id === reqItem.orderItemId);
      if (!orderItem) {
        throw new Error(`کالای مورد نظر در سفارش یافت نشد: ${reqItem.orderItemId}`);
      }

      const itemElig = checkItemEligibility(orderItem, allRequests);
      if (reqItem.quantity > itemElig.returnableQuantity) {
        throw new Error(
          `تعداد درخواستی (${reqItem.quantity}) بیش از تعداد قابل مرجوعی (${itemElig.returnableQuantity}) است.`
        );
      }

      // CRITICAL: Calculate refund based strictly on purchased unit price in OrderItem
      const itemRefund = orderItem.finalUnitPrice * reqItem.quantity;
      totalRefundAmount += itemRefund;

      returnItems.push({
        id: `ret-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        orderItemId: orderItem.id,
        productId: orderItem.productId,
        productTitle: orderItem.title,
        productImage: orderItem.image,
        variantDisplay: orderItem.variant
          ? `${orderItem.variant.color || ""} ${orderItem.variant.size || ""}`.trim()
          : undefined,
        quantity: reqItem.quantity,
        purchasedUnitPrice: orderItem.finalUnitPrice,
        reason: reqItem.reason,
        customerNote: reqItem.customerNote,
        evidence: reqItem.evidence,
        refundAmount: itemRefund,
      });
    }

    const policy = getReturnPolicy(params.reason);
    const nowIso = new Date().toISOString();

    const count = allRequests.length + 1020;
    const reqNum = `RET-${count}`;
    const reqId = `ret-${count}`;

    const storeReturnAddr = storeSettingsService.getDefaultReturnAddress();

    const newRequest: ReturnRequest = {
      id: reqId,
      requestNumber: reqNum,
      type: "return",
      orderId: params.order.id,
      orderNumber: params.order.orderNumber,
      orderCreatedAt: params.order.createdAt,
      customerId: params.order.shippingAddress.phone,
      customerName: params.order.shippingAddress.recipientName,
      customerPhone: params.order.shippingAddress.phone,
      status: "requested",
      requestedAt: nowIso,
      reason: params.reason,
      customerNote: params.customerNote,
      items: returnItems,
      shipment: {
        status: "not_started",
        payer: policy.customerPaysReturnShipping ? "customer" : "merchant",
        shippingCostAmount: policy.customerPaysReturnShipping ? 0 : params.order.shippingCost,
      },
      refund: {
        status: "pending",
        amount: totalRefundAmount,
        method: "original_payment_method",
      },
      timeline: [
        {
          id: `tl-${Date.now()}-1`,
          type: "created",
          title: "درخواست مرجوعی ثبت شد",
          description: `درخواست مرجوعی برای ${returnItems.length} کالا ثبت گردید.`,
          actor: "customer",
          actorName: params.order.shippingAddress.recipientName,
          createdAt: nowIso,
        },
      ],
      storeReturnAddress: storeReturnAddr ? {
        recipientName: storeReturnAddr.recipientName,
        phone: storeReturnAddr.phone,
        province: storeReturnAddr.province,
        city: storeReturnAddr.city,
        address: storeReturnAddr.address,
        plaque: storeReturnAddr.plaque,
        floor: storeReturnAddr.floor,
        postalCode: storeReturnAddr.postalCode,
      } : undefined,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const updatedRequests = [newRequest, ...allRequests];
    this.persistRequests(updatedRequests);
    return newRequest;
  }

  /* ================= CREATE EXCHANGE REQUEST ================= */

  createExchangeRequest(params: {
    order: Order;
    orderItemId: string;
    replacementProductId: string;
    replacementVariantId: string;
    replacementVariantDisplay?: string;
    quantity: number;
    reason: ReturnReason;
    customerNote?: string;
    evidence?: string[];
    productsCatalog: Product[];
  }): ReturnRequest {
    const allRequests = this.loadAllRequests();

    // 1. Order Eligibility
    const eligibility = checkOrderEligibility(params.order, allRequests);
    if (!eligibility.isEligible) {
      throw new Error(eligibility.reason || "این سفارش واجد شرایط تعویض نیست.");
    }

    // 2. Order Item Eligibility
    const orderItem = params.order.items.find((i) => i.id === params.orderItemId);
    if (!orderItem) {
      throw new Error("کالای مورد نظر در سفارش یافت نشد.");
    }

    const itemElig = checkItemEligibility(orderItem, allRequests);
    if (params.quantity > itemElig.returnableQuantity) {
      throw new Error(
        `تعداد درخواستی (${params.quantity}) بیش از تعداد قابل تعویض (${itemElig.returnableQuantity}) است.`
      );
    }

    // 3. Exchange Variant Validation & Price Difference Calculation
    const targetProduct = params.productsCatalog.find((p) => p.id === params.replacementProductId);
    if (!targetProduct) {
      throw new Error("محصول مقصد برای تعویض یافت نشد.");
    }

    const targetVariant = targetProduct.variants.find((v) => v.id === params.replacementVariantId);
    if (!targetVariant && targetProduct.variants.length > 0) {
      throw new Error("تنوع انتخابی یافت نشد.");
    }

    const variantValidation = validateExchangeVariant(targetProduct, params.replacementVariantId);
    if (!variantValidation.isValid) {
      throw new Error(variantValidation.reason || "تنوع مقصد انتخاب‌شده قابل تعویض نیست.");
    }

    const replacementPrice = targetVariant ? targetVariant.pricing.price : targetProduct.pricing.minPrice;
    const originalUnitPrice = orderItem.finalUnitPrice;

    // Price difference per item * quantity
    // Positive = customer pays extra, Negative = merchant refunds difference
    const priceDifference = (replacementPrice - originalUnitPrice) * params.quantity;

    const policy = getReturnPolicy(params.reason);
    const nowIso = new Date().toISOString();

    const count = allRequests.length + 1020;
    const reqNum = `EXC-${count}`;
    const reqId = `exc-${count}`;

    const storeReturnAddr = storeSettingsService.getDefaultReturnAddress();

    const returnItem: ReturnItem = {
      id: `exc-item-${Date.now()}`,
      orderItemId: orderItem.id,
      productId: orderItem.productId,
      productTitle: orderItem.title,
      productImage: orderItem.image,
      variantDisplay: orderItem.variant
        ? `${orderItem.variant.color || ""} ${orderItem.variant.size || ""}`.trim()
        : undefined,
      quantity: params.quantity,
      purchasedUnitPrice: orderItem.finalUnitPrice,
      reason: params.reason,
      customerNote: params.customerNote,
      evidence: params.evidence,
      refundAmount: priceDifference < 0 ? Math.abs(priceDifference) : 0,
    };

    const newRequest: ReturnRequest = {
      id: reqId,
      requestNumber: reqNum,
      type: "exchange",
      orderId: params.order.id,
      orderNumber: params.order.orderNumber,
      orderCreatedAt: params.order.createdAt,
      customerId: params.order.shippingAddress.phone,
      customerName: params.order.shippingAddress.recipientName,
      customerPhone: params.order.shippingAddress.phone,
      status: "requested",
      requestedAt: nowIso,
      reason: params.reason,
      customerNote: params.customerNote,
      items: [returnItem],
      shipment: {
        status: "not_started",
        payer: policy.customerPaysReturnShipping ? "customer" : "merchant",
        shippingCostAmount: 0,
      },
      exchange: {
        originalVariantId: orderItem.id,
        originalVariantDisplay: returnItem.variantDisplay,
        replacementProductId: params.replacementProductId,
        replacementVariantId: params.replacementVariantId,
        replacementVariantDisplay: params.replacementVariantDisplay,
        replacementProductTitle: targetProduct.title,
        replacementUnitPrice: replacementPrice,
        originalUnitPrice: originalUnitPrice,
        priceDifference: priceDifference,
      },
      timeline: [
        {
          id: `tl-${Date.now()}-1`,
          type: "created",
          title: "درخواست تعویض ثبت شد",
          description: `درخواست تعویض سایز/رنگ کالا ثبت گردید.`,
          actor: "customer",
          actorName: params.order.shippingAddress.recipientName,
          createdAt: nowIso,
        },
      ],
      storeReturnAddress: storeReturnAddr ? {
        recipientName: storeReturnAddr.recipientName,
        phone: storeReturnAddr.phone,
        province: storeReturnAddr.province,
        city: storeReturnAddr.city,
        address: storeReturnAddr.address,
        plaque: storeReturnAddr.plaque,
        floor: storeReturnAddr.floor,
        postalCode: storeReturnAddr.postalCode,
      } : undefined,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    const updatedRequests = [newRequest, ...allRequests];
    this.persistRequests(updatedRequests);
    return newRequest;
  }

  /* ================= APPROVE REQUEST ================= */

  approveRequest(id: string, adminNote?: string, actorName = "مدیر سیستم"): ReturnRequest {
    return this.updateRequest(id, (req) => {
      if (!isValidStateTransition(req.type, req.status, "approved")) {
        throw new Error(`انتقال از وضعیت ${req.status} به «تأیید شده» غیرمجاز است.`);
      }

      const nowIso = new Date().toISOString();
      const newTimeline: ReturnTimelineEvent = {
        id: `tl-${Date.now()}`,
        type: "approved",
        title: "درخواست تأیید شد",
        description: adminNote || "درخواست توسط ادمین تأیید گردید و منتظر دریافت کالا است.",
        actor: "admin",
        actorName,
        createdAt: nowIso,
      };

      return {
        ...req,
        status: "approved" as const,
        approvedAt: nowIso,
        shipment: req.shipment
          ? { ...req.shipment, status: "awaiting_customer" as const }
          : undefined,
        timeline: [...req.timeline, newTimeline],
        updatedAt: nowIso,
      };
    });
  }

  /* ================= REJECT REQUEST ================= */

  rejectRequest(id: string, rejectReason: string, actorName = "مدیر سیستم"): ReturnRequest {
    if (!rejectReason || !rejectReason.trim()) {
      throw new Error("لطفاً دلیل رد درخواست را وارد کنید.");
    }

    return this.updateRequest(id, (req) => {
      if (!isValidStateTransition(req.type, req.status, "rejected")) {
        throw new Error(`انتقال از وضعیت ${req.status} به «رد شده» غیرمجاز است.`);
      }

      const nowIso = new Date().toISOString();
      const newTimeline: ReturnTimelineEvent = {
        id: `tl-${Date.now()}`,
        type: "rejected",
        title: "درخواست رد شد",
        description: `دلیل رد درخواست: ${rejectReason}`,
        actor: "admin",
        actorName,
        createdAt: nowIso,
      };

      return {
        ...req,
        status: "rejected" as const,
        rejectedAt: nowIso,
        rejectReason,
        timeline: [...req.timeline, newTimeline],
        updatedAt: nowIso,
      };
    });
  }

  /* ================= REGISTER SHIPMENT ================= */

  registerShipment(
    id: string,
    params: {
      method?: "post" | "tipax" | "other";
      trackingCode: string;
      payer?: "customer" | "merchant";
    },
    actorName = "مشتری / ادمین"
  ): ReturnRequest {
    return this.updateRequest(id, (req) => {
      const nowIso = new Date().toISOString();
      const nextStatus = req.status === "approved" || req.status === "awaiting_customer_shipment"
        ? "in_transit"
        : req.status;

      const newTimeline: ReturnTimelineEvent = {
        id: `tl-${Date.now()}`,
        type: "shipment_updated",
        title: "اطلاعات ارسال ثبت شد",
        description: `کد رهگیری پستی: ${params.trackingCode}`,
        actor: "admin",
        actorName,
        createdAt: nowIso,
      };

      return {
        ...req,
        status: nextStatus as ReturnRequest["status"],
        shipment: {
          ...req.shipment,
          status: "in_transit" as const,
          method: params.method || req.shipment?.method || "post",
          trackingCode: params.trackingCode,
          shippedAt: nowIso,
          payer: params.payer || req.shipment?.payer || "customer",
          shippingCostAmount: req.shipment?.shippingCostAmount || 0,
        },
        timeline: [...req.timeline, newTimeline],
        updatedAt: nowIso,
      };
    });
  }

  /* ================= REGISTER RECEIVED ================= */

  registerReceived(id: string, actorName = "مدیر سیستم"): ReturnRequest {
    return this.updateRequest(id, (req) => {
      if (!isValidStateTransition(req.type, req.status, "received")) {
        throw new Error(`ثبت دریافت کالا برای وضعیت ${req.status} امکان‌پذیر نیست.`);
      }

      const nowIso = new Date().toISOString();
      const newTimeline: ReturnTimelineEvent = {
        id: `tl-${Date.now()}`,
        type: "received",
        title: "کالا توسط انبار دریافت شد",
        description: "مرسوله مرجوعی تحویل انبار گردید و اماده کارشناسی است.",
        actor: "admin",
        actorName,
        createdAt: nowIso,
      };

      return {
        ...req,
        status: "received" as const,
        receivedAt: nowIso,
        shipment: req.shipment
          ? { ...req.shipment, status: "received" as const, receivedAt: nowIso }
          : undefined,
        timeline: [...req.timeline, newTimeline],
        updatedAt: nowIso,
      };
    });
  }

  /* ================= START INSPECTION ================= */

  startInspection(id: string, actorName = "مدیر سیستم"): ReturnRequest {
    return this.updateRequest(id, (req) => {
      if (!isValidStateTransition(req.type, req.status, "inspection")) {
        throw new Error("انتقال به وضعیت کارشناسی مجاز نیست.");
      }

      const nowIso = new Date().toISOString();
      const newTimeline: ReturnTimelineEvent = {
        id: `tl-${Date.now()}`,
        type: "inspection_started",
        title: "بررسی کیفیت (کارشناسی) آغاز شد",
        description: "کالا توسط تیم انبار در حال بررسی سلامت فنی و ظاهری است.",
        actor: "admin",
        actorName,
        createdAt: nowIso,
      };

      return {
        ...req,
        status: "inspection" as const,
        timeline: [...req.timeline, newTimeline],
        updatedAt: nowIso,
      };
    });
  }

  /* ================= COMPLETE INSPECTION & INVENTORY INTEGRATION ================= */

  completeInspection(
    id: string,
    itemInspections: Array<{
      itemId: string;
      result: InspectionResult;
      note?: string;
    }>,
    actorName = "کارشناس انبار"
  ): ReturnRequest {
    return this.updateRequest(id, (req) => {
      const nowIso = new Date().toISOString();

      let hasSellable = false;

      // Update inspection results for items
      const updatedItems = req.items.map((item) => {
        const insp = itemInspections.find((i) => i.itemId === item.id || i.itemId === item.orderItemId);
        if (!insp) return item;

        if (insp.result === "sellable") {
          hasSellable = true;
          // CRITICAL INVENTORY INTEGRATION:
          // Increase stock ONLY if result === sellable
          this.adjustInventoryForReturnedItem(
            item.productId,
            item.variantId,
            item.quantity,
            item.productTitle,
            item.variantDisplay,
            actorName
          );
        }

        return {
          ...item,
          inspection: {
            result: insp.result,
            note: insp.note,
            inspectedAt: nowIso,
            inspectedBy: actorName,
          },
        };
      });

      const nextStatus = req.type === "return"
        ? (hasSellable ? "inspection_approved" : "inspection_rejected")
        : (hasSellable ? "inspection_approved" : "inspection_rejected");

      const inspSummary = hasSellable
        ? "نتیجه کارشناسی: کالا سالم و قابل فروش مجدد تشخیص داده شد (موجودی انبار به‌روزرسانی شد)."
        : "نتیجه کارشناسی: کالا دارای آسیب‌دیدگی/غیرقابل فروش مجدد تشخیص داده شد.";

      const newTimeline: ReturnTimelineEvent = {
        id: `tl-${Date.now()}`,
        type: "inspection_completed",
        title: "نتیجه کارشناسی کالا ثبت شد",
        description: inspSummary,
        actor: "admin",
        actorName,
        createdAt: nowIso,
      };

      return {
        ...req,
        status: nextStatus as ReturnRequest["status"],
        items: updatedItems,
        timeline: [...req.timeline, newTimeline],
        updatedAt: nowIso,
      };
    });
  }

  /* ================= PROCESS REFUND ================= */

  processRefund(
    id: string,
    refundParams: {
      amount?: number;
      referenceId?: string;
      note?: string;
    },
    actorName = "مدیر مالی"
  ): ReturnRequest {
    return this.updateRequest(id, (req) => {
      if (req.refund?.status === "completed") {
        throw new Error("بازپرداخت برای این درخواست قبلاً با موفقیت ثبت شده است.");
      }

      // CRITICAL: Calculate exact refund amount from ReturnItems purchase unit prices
      const calculatedAmount = req.items.reduce(
        (sum, item) => sum + item.purchasedUnitPrice * item.quantity,
        0
      );
      const refundAmount = refundParams.amount !== undefined ? refundParams.amount : calculatedAmount;

      const nowIso = new Date().toISOString();
      const newTimeline: ReturnTimelineEvent = {
        id: `tl-${Date.now()}`,
        type: "refund_processed",
        title: "مبلغ مرجوعی واریز شد",
        description: `مبلغ ${refundAmount.toLocaleString("fa-IR")} تومان به کارت/حساب مشتری واریز گردید. شماره پیگیری: ${refundParams.referenceId || "ثبت دستی"}`,
        actor: "admin",
        actorName,
        createdAt: nowIso,
      };

      const updatedRefund: Refund = {
        status: "completed",
        amount: refundAmount,
        method: "original_payment_method",
        processedAt: nowIso,
        referenceId: refundParams.referenceId || `REF-${Date.now()}`,
        note: refundParams.note,
      };

      return {
        ...req,
        status: "refunded" as const,
        completedAt: nowIso,
        refund: updatedRefund,
        timeline: [...req.timeline, newTimeline],
        updatedAt: nowIso,
      };
    });
  }

  /* ================= SHIP REPLACEMENT (EXCHANGE) ================= */

  shipReplacement(
    id: string,
    trackingCode: string,
    carrierName = "پست پیشتاز",
    actorName = "مدیر انبار"
  ): ReturnRequest {
    return this.updateRequest(id, (req) => {
      if (req.type !== "exchange") {
        throw new Error("عملیات ارسال کالای جایگزین فقط برای درخواست‌های تعویض معتبر است.");
      }

      const nowIso = new Date().toISOString();
      const newTimeline: ReturnTimelineEvent = {
        id: `tl-${Date.now()}`,
        type: "replacement_shipped",
        title: "کالای جایگزین ارسال شد",
        description: `کالای جایگزین با کد رهگیری ${trackingCode} ارسال گردید.`,
        actor: "admin",
        actorName,
        createdAt: nowIso,
      };

      const updatedExchange: ExchangeDetails = {
        ...req.exchange!,
        replacementShipment: {
          status: "shipped",
          trackingCode,
          carrierName,
          shippedAt: nowIso,
        },
      };

      return {
        ...req,
        status: "replacement_shipped" as const,
        completedAt: nowIso,
        exchange: updatedExchange,
        timeline: [...req.timeline, newTimeline],
        updatedAt: nowIso,
      };
    });
  }

  /* ================= CANCEL REQUEST ================= */

  cancelRequest(id: string, reason?: string, actorName = "مدیر سیستم"): ReturnRequest {
    return this.updateRequest(id, (req) => {
      const nowIso = new Date().toISOString();
      const newTimeline: ReturnTimelineEvent = {
        id: `tl-${Date.now()}`,
        type: "cancelled",
        title: "درخواست لغو شد",
        description: reason ? `علت لغو: ${reason}` : "درخواست مرجوعی/تعویض لغو گردید.",
        actor: "admin",
        actorName,
        createdAt: nowIso,
      };

      return {
        ...req,
        status: "cancelled" as const,
        timeline: [...req.timeline, newTimeline],
        updatedAt: nowIso,
      };
    });
  }

  /* ================= HELPER METHODS & PERSISTENCE ================= */

  private loadAllRequests(isHydrated?: boolean): ReturnRequest[] {
    const activeHydration = isHydrated ?? (typeof window !== "undefined");
    if (!activeHydration) return mockInitialReturnRequests;
    try {
      const stored = localStorage.getItem(RETURNS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(RETURNS_STORAGE_KEY, JSON.stringify(mockInitialReturnRequests));
        return mockInitialReturnRequests;
      }
      return JSON.parse(stored);
    } catch {
      return mockInitialReturnRequests;
    }
  }

  private persistRequests(requests: ReturnRequest[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(RETURNS_STORAGE_KEY, JSON.stringify(requests));
    } catch (e) {
      console.error("Failed to persist return requests:", e);
    }
  }

  private updateRequest(
    id: string,
    updater: (req: ReturnRequest) => ReturnRequest
  ): ReturnRequest {
    const requests = this.loadAllRequests();
    let updatedTarget: ReturnRequest | undefined;

    const updatedList = requests.map((req) => {
      if (req.id === id || req.requestNumber === id) {
        updatedTarget = updater(req);
        return updatedTarget;
      }
      return req;
    });

    if (!updatedTarget) {
      throw new Error(`درخواست مرجوعی با کد ${id} یافت نشد.`);
    }

    this.persistRequests(updatedList);
    return updatedTarget;
  }

  /**
   * Adjusts inventory when an inspected item is approved as sellable.
   */
  private adjustInventoryForReturnedItem(
    productId: string,
    variantId: string | undefined,
    quantity: number,
    productTitle: string,
    variantDisplay?: string,
    actorName = "کارشناس انبار"
  ): void {
    if (typeof window === "undefined") return;
    try {
      const storedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (!storedProducts) return;

      const products: Product[] = JSON.parse(storedProducts);
      let previousStock = 0;
      let newStock = 0;

      const updatedProducts = products.map((p) => {
        if (p.id !== productId) return p;

        if (variantId && p.variants && p.variants.length > 0) {
          const updatedVariants = p.variants.map((v) => {
            if (v.id === variantId) {
              previousStock = v.inventory?.stock ?? 0;
              newStock = previousStock + quantity;
              return {
                ...v,
                inventory: { ...v.inventory, stock: newStock },
              };
            }
            return v;
          });
          const totalStock = updatedVariants.reduce(
            (sum, v) => sum + (v.inventory?.stock || 0),
            0
          );
          return {
            ...p,
            variants: updatedVariants,
            inventory: { ...p.inventory, totalStock, hasAvailableVariants: totalStock > 0 },
            updatedAt: new Date().toISOString(),
          };
        } else {
          previousStock = p.inventory?.totalStock ?? 0;
          newStock = previousStock + quantity;
          return {
            ...p,
            inventory: { ...p.inventory, totalStock: newStock, hasAvailableVariants: newStock > 0 },
            updatedAt: new Date().toISOString(),
          };
        }
      });

      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updatedProducts));

      // Add audit log to inventory history
      addInventoryHistoryLog({
        productId,
        productTitle,
        variantId: variantId || "",
        variantDisplay: variantDisplay || "پیش‌فرض",
        previousStock,
        changeAmount: quantity,
        newStock,
        reason: "تأیید کارشناسی مرجوعی (کالای سالم)",
        actor: actorName,
      });
    } catch (e) {
      console.error("Failed to update product inventory during inspection approval:", e);
    }
  }
}

export const returnService = new ReturnService();
