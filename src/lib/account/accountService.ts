import {
  Order,
  UserAddress,
  SupportTicket,
  TicketStatus,
  TicketMessage,
  orderStatusLabels,
  getNextAdminStatus,
  canCustomerCancelOrder,
  canAdminCancelOrder,
} from "@/types/account";
import {
  mockInitialOrders,
  mockInitialAddresses,
  mockInitialTickets,
} from "@/data/mockAccountData";
import { products as catalogProducts } from "@/data/products";
import { Product, ProductOption, ProductOptionValue, ProductVariant } from "@/types/product";

const ORDERS_KEY = "mepusham_orders_v1";
const ADDRESSES_KEY = "mepusham_addresses_v1";
const TICKETS_KEY = "mepusham_tickets_v1";

class AccountService {
  /* ================= ORDERS ================= */

  getOrders(options?: { isHydrated?: boolean }): Order[] {
    const isHydrated = options?.isHydrated ?? (typeof window !== "undefined");
    if (!isHydrated) return mockInitialOrders;
    try {
      const stored = localStorage.getItem(ORDERS_KEY);
      if (!stored) {
        localStorage.setItem(ORDERS_KEY, JSON.stringify(mockInitialOrders));
        return mockInitialOrders;
      }
      return JSON.parse(stored);
    } catch {
      return mockInitialOrders;
    }
  }

  getOrderById(orderId: string): Order | undefined {
    const orders = this.getOrders();
    // Normalize comparison by stripping potential # or whitespace
    const cleanId = orderId.replace(/^#/, "").trim();
    return orders.find(
      (o) => o.id === cleanId || o.orderNumber === cleanId || o.id === orderId || o.orderNumber === orderId
    );
  }

  updateOrderStatus(
    orderId: string,
    newStatus: import("@/types/account").OrderStatus,
    shippingInfo?: { trackingCode?: string; carrierName?: string }
  ): Order {
    const orders = this.getOrders();
    let updatedOrder: Order | undefined;

    const updated = orders.map((order) => {
      if (order.id === orderId || order.orderNumber === orderId) {
        const nowFa = new Date().toLocaleDateString("fa-IR") + " - " + new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
        const updatedTimeline = order.timeline ? [...order.timeline] : [];

        // Check if item for this status exists or add it
        const existingTlIndex = updatedTimeline.findIndex((t) => t.status === newStatus);
        if (existingTlIndex >= 0) {
          updatedTimeline[existingTlIndex] = {
            ...updatedTimeline[existingTlIndex],
            completed: true,
            date: nowFa,
          };
        } else {
          updatedTimeline.push({
            id: `tl-${Date.now()}`,
            status: newStatus,
            title: orderStatusLabels[newStatus] || newStatus,
            date: nowFa,
            completed: true,
          });
        }

        updatedOrder = {
          ...order,
          status: newStatus,
          shippingMethod: {
            ...order.shippingMethod,
            trackingCode: shippingInfo?.trackingCode ?? order.shippingMethod.trackingCode,
            carrierName: shippingInfo?.carrierName ?? order.shippingMethod.carrierName,
          },
          timeline: updatedTimeline,
        };
        return updatedOrder;
      }
      return order;
    });

    if (!updatedOrder) {
      throw new Error("سفارش مورد نظر یافت نشد.");
    }

    this.persistOrders(updated);
    return updatedOrder;
  }

  bulkUpdateOrderStatus(
    orderIds: string[],
    targetStatus?: import("@/types/account").OrderStatus
  ): { updatedCount: number; updatedOrders: Order[] } {
    const orders = this.getOrders();
    let updatedCount = 0;

    const updated = orders.map((order) => {
      if (orderIds.includes(order.id) || orderIds.includes(order.orderNumber)) {
        const nextStatus = targetStatus ?? getNextAdminStatus(order.status);
        if (nextStatus) {
          updatedCount++;
          const nowFa = new Date().toLocaleDateString("fa-IR") + " - " + new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
          const updatedTimeline = order.timeline ? [...order.timeline] : [];
          const existingTlIndex = updatedTimeline.findIndex((t) => t.status === nextStatus);
          if (existingTlIndex >= 0) {
            updatedTimeline[existingTlIndex] = {
              ...updatedTimeline[existingTlIndex],
              completed: true,
              date: nowFa,
            };
          }

          return {
            ...order,
            status: nextStatus,
            timeline: updatedTimeline,
          };
        }
      }
      return order;
    });

    this.persistOrders(updated);
    return { updatedCount, updatedOrders: updated };
  }

  cancelOrder(orderId: string): Order {
    return this.updateOrderStatus(orderId, "cancelled");
  }

  cancelOrderByCustomer(orderId: string): Order {
    const order = this.getOrderById(orderId);
    if (!order) {
      throw new Error("سفارش مورد نظر یافت نشد.");
    }
    if (!canCustomerCancelOrder(order.status)) {
      throw new Error("امکان لغو این سفارش در وضعیت فعلی وجود ندارد.");
    }

    const orders = this.getOrders();
    let updatedOrder: Order | undefined;

    const updated = orders.map((o) => {
      if (o.id === order.id || o.orderNumber === order.orderNumber) {
        const nowFa = new Date().toLocaleDateString("fa-IR") + " - " + new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
        const updatedTimeline = o.timeline ? [...o.timeline] : [];
        updatedTimeline.push({
          id: `tl-cancel-${Date.now()}`,
          status: "cancelled" as const,
          title: "لغو سفارش توسط مشتری",
          date: nowFa,
          completed: true,
        });

        updatedOrder = {
          ...o,
          status: "cancelled" as const,
          timeline: updatedTimeline,
        };
        return updatedOrder;
      }
      return o;
    });

    if (!updatedOrder) {
      throw new Error("سفارش مورد نظر یافت نشد.");
    }

    this.persistOrders(updated);
    return updatedOrder;
  }

  bulkCancelOrders(orderIds: string[]): { cancelledCount: number; updatedOrders: Order[] } {
    const orders = this.getOrders();
    let cancelledCount = 0;

    const updated = orders.map((order) => {
      if (
        (orderIds.includes(order.id) || orderIds.includes(order.orderNumber)) &&
        canAdminCancelOrder(order.status)
      ) {
        cancelledCount++;
        const nowFa = new Date().toLocaleDateString("fa-IR");
        const updatedTimeline = order.timeline ? [...order.timeline] : [];
        updatedTimeline.push({
          id: `tl-cancel-${Date.now()}`,
          status: "cancelled",
          title: "لغو سفارش توسط ادمین",
          date: nowFa,
          completed: true,
        });

        return {
          ...order,
          status: "cancelled" as const,
          timeline: updatedTimeline,
        };
      }
      return order;
    });

    this.persistOrders(updated);
    return { cancelledCount, updatedOrders: updated };
  }

  createOrder(payload: {
    customer: {
      firstName: string;
      lastName: string;
      phone: string;
      province: string;
      city: string;
      address: string;
      postalCode: string;
    };
    shipping: {
      methodId: string;
      price: number;
      title: string;
      estimatedDelivery?: string;
    };
    items: {
      productId: string;
      variantId?: string;
      quantity: number;
      unitPrice: number;
    }[];
    pricing: {
      itemsSubtotal: number;
      shippingCost: number;
      payableTotal: number;
    };
    createdAt?: string;
  }): Order {
    const orders = this.getOrders();
    const newOrderNumber = `${12458 + orders.length}`;
    const newOrderId = `order-${newOrderNumber}`;

    const orderItems: Order["items"] = payload.items.map((item, index) => {
      const product = catalogProducts.find((p: Product) => p.id === item.productId);
      const title = product ? product.title : "محصول خریداری شده";
      const image = product?.images?.[0]?.url || "/images/bag-1.webp";

      let variantInfo: { color?: string; size?: string } | undefined;
      if (product && item.variantId) {
        const variantObj = product.variants?.find((v: ProductVariant) => v.id === item.variantId);
        if (variantObj && variantObj.optionValues) {
          variantInfo = {};
          variantObj.optionValues.forEach((optVal: { optionId: string; valueId: string }) => {
            const opt = product.options?.find((o: ProductOption) => o.id === optVal.optionId);
            const val = opt?.values?.find((v: ProductOptionValue) => v.id === optVal.valueId);
            if (opt?.type === "color" && val) variantInfo!.color = val.label;
            if (opt?.type === "size" && val) variantInfo!.size = val.label;
          });
        }
      }

      return {
        id: `item-${Date.now()}-${index}`,
        productId: item.productId,
        title,
        image,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        finalUnitPrice: item.unitPrice,
        variant: variantInfo,
      };
    });

    const nowFa = new Date().toLocaleDateString("fa-IR");

    const newOrder: Order = {
      id: newOrderId,
      orderNumber: newOrderNumber,
      createdAt: nowFa,
      status: "pending",
      itemsSubtotal: payload.pricing.itemsSubtotal,
      shippingCost: payload.pricing.shippingCost,
      payableTotal: payload.pricing.payableTotal,
      shippingMethod: {
        id: payload.shipping.methodId,
        title: payload.shipping.title,
        carrierName: payload.shipping.title,
      },
      shippingAddress: {
        recipientName: `${payload.customer.firstName} ${payload.customer.lastName}`.trim(),
        phone: payload.customer.phone,
        province: payload.customer.province,
        city: payload.customer.city,
        address: payload.customer.address,
        postalCode: payload.customer.postalCode,
      },
      items: orderItems,
      timeline: [
        {
          id: `tl-${Date.now()}-1`,
          status: "pending",
          title: "ثبت سفارش",
          description: "سفارش شما با موفقیت ثبت شد و منتظر تایید ادمین است",
          date: nowFa,
          completed: true,
        },
        {
          id: `tl-${Date.now()}-2`,
          status: "confirmed",
          title: "تأیید سفارش",
          description: "تأیید توسط ادمین انجام شد",
          completed: false,
        },
        {
          id: `tl-${Date.now()}-3`,
          status: "processing",
          title: "در حال آماده‌سازی",
          description: "مرسوله در انبار اصلی در حال بسته‌بندی است",
          completed: false,
        },
        {
          id: `tl-${Date.now()}-4`,
          status: "shipped",
          title: "تحویل به پست",
          description: "تحویل شرکت پست جهت ارسال داده خواهد شد",
          completed: false,
        },
        {
          id: `tl-${Date.now()}-5`,
          status: "delivered",
          title: "تحویل به مشتری",
          completed: false,
        },
      ],
    };

    const updated = [newOrder, ...orders];
    this.persistOrders(updated);
    return newOrder;
  }

  private persistOrders(orders: Order[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error("Failed to save orders to localStorage", e);
    }
  }

  /* ================= ADDRESSES ================= */

  getAddresses(options?: { isHydrated?: boolean }): UserAddress[] {
    const isHydrated = options?.isHydrated ?? (typeof window !== "undefined");
    if (!isHydrated) return mockInitialAddresses;
    try {
      const stored = localStorage.getItem(ADDRESSES_KEY);
      if (!stored) {
        localStorage.setItem(ADDRESSES_KEY, JSON.stringify(mockInitialAddresses));
        return mockInitialAddresses;
      }
      return JSON.parse(stored);
    } catch {
      return mockInitialAddresses;
    }
  }

  saveAddress(address: Omit<UserAddress, "id"> & { id?: string }): UserAddress[] {
    const addresses = this.getAddresses();
    let updated: UserAddress[];

    const isFirst = addresses.length === 0;
    const shouldBeDefault = address.isDefault || isFirst;

    if (address.id) {
      // Edit existing
      updated = addresses.map((a) => {
        if (a.id === address.id) {
          return {
            ...a,
            ...address,
            isDefault: shouldBeDefault,
          };
        }
        return shouldBeDefault ? { ...a, isDefault: false } : a;
      });
    } else {
      // Add new
      const newAddress: UserAddress = {
        ...address,
        id: `addr-${Date.now()}`,
        isDefault: shouldBeDefault,
      };

      if (shouldBeDefault) {
        updated = addresses.map((a) => ({ ...a, isDefault: false }));
        updated.unshift(newAddress);
      } else {
        updated = [...addresses, newAddress];
      }
    }

    this.persistAddresses(updated);
    return updated;
  }

  deleteAddress(id: string): UserAddress[] {
    const addresses = this.getAddresses();
    const updated = addresses.filter((a) => a.id !== id);

    // If deleted address was default and there are remaining addresses, make the first one default
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true;
    }

    this.persistAddresses(updated);
    return updated;
  }

  setDefaultAddress(id: string): UserAddress[] {
    const addresses = this.getAddresses();
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    this.persistAddresses(updated);
    return updated;
  }

  private persistAddresses(addresses: UserAddress[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(ADDRESSES_KEY, JSON.stringify(addresses));
    } catch (e) {
      console.error("Failed to save addresses to localStorage", e);
    }
  }

  /* ================= SUPPORT / TICKETS ================= */

  getTickets(options?: { isHydrated?: boolean }): SupportTicket[] {
    const isHydrated = options?.isHydrated ?? (typeof window !== "undefined");
    if (!isHydrated) return mockInitialTickets;
    try {
      const stored = localStorage.getItem(TICKETS_KEY);
      if (!stored) {
        localStorage.setItem(TICKETS_KEY, JSON.stringify(mockInitialTickets));
        return mockInitialTickets;
      }
      return JSON.parse(stored);
    } catch {
      return mockInitialTickets;
    }
  }

  getTicketById(ticketId: string): SupportTicket | undefined {
    const tickets = this.getTickets();
    return tickets.find(
      (t) => t.id === ticketId || t.ticketNumber === ticketId
    );
  }

  createTicket(params: {
    subject: string;
    orderId?: string;
    orderNumber?: string;
    message: string;
    attachments?: import("@/types/account").TicketAttachment[];
  }): SupportTicket {
    const tickets = this.getTickets();
    const ticketNum = `${1250 + tickets.length}`;

    const newTicket: SupportTicket = {
      id: `ticket-${ticketNum}`,
      ticketNumber: ticketNum,
      subject: params.subject,
      orderId: params.orderId,
      orderNumber: params.orderNumber,
      status: "waiting-support",
      createdAt: new Date().toLocaleDateString("fa-IR") + " - " + new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
      updatedAt: new Date().toLocaleDateString("fa-IR") + " - " + new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: "user",
          text: params.message,
          createdAt: "هم‌اکنون",
          attachments: params.attachments,
        },
      ],
    };

    const updated = [newTicket, ...tickets];
    this.persistTickets(updated);
    return newTicket;
  }

  addTicketMessage(
    ticketId: string,
    text: string,
    attachments?: import("@/types/account").TicketAttachment[]
  ): SupportTicket {
    const tickets = this.getTickets();
    let updatedTicket: SupportTicket | undefined;

    const updated = tickets.map((t) => {
      if (t.id === ticketId || t.ticketNumber === ticketId) {
        const newMessage: TicketMessage = {
          id: `msg-${Date.now()}`,
          sender: "user",
          text,
          createdAt: "هم‌اکنون",
          attachments,
        };
        const newStatus: TicketStatus = "waiting-support";
        updatedTicket = {
          ...t,
          status: newStatus,
          updatedAt: "هم‌اکنون",
          messages: [...t.messages, newMessage],
        };
        return updatedTicket;
      }
      return t;
    });

    if (!updatedTicket) {
      throw new Error("تیکت مورد نظر یافت نشد.");
    }

    this.persistTickets(updated);
    return updatedTicket;
  }

  private persistTickets(tickets: SupportTicket[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
    } catch (e) {
      console.error("Failed to save tickets to localStorage", e);
    }
  }
}

export const accountService = new AccountService();
