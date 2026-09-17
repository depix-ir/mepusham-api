import { accountService } from "@/lib/account/accountService";
import { supportService } from "@/lib/support/supportService";
import { returnService } from "@/lib/returns/returnService";
import { authService } from "@/lib/auth/authService";
import { mockDefaultUser } from "@/data/mockAccountData";
import { Order, UserAddress } from "@/types/account";
import { ReturnRequest } from "@/types/return";
import { SupportTicket } from "@/types/support";

const CUSTOMER_STATUSES_KEY = "mepusham_customer_statuses_v1";
const CUSTOMER_PROFILES_KEY = "mepusham_customer_profiles_v1";

// In-memory store fallback for SSR and Bun test environment
const memoryStore: Record<string, unknown> = {};

export type CustomerStatus = "active" | "inactive";

export interface CustomerAccount {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  fullName: string;
  createdAt: string;
  status: CustomerStatus;
  ordersCount: number;
  totalSpent: number;
  lastOrderNumber?: string;
  lastOrderId?: string;
  lastOrderDate?: string;
  returnsCount: number;
  ticketsCount: number;
}

export interface CustomerFilters {
  search?: string;
  status?: CustomerStatus | "all";
  purchaseHistory?: "all" | "has_orders" | "no_orders";
  sortBy?: "newest" | "oldest" | "most_orders" | "highest_spend";
  page?: number;
  pageSize?: number;
}

export interface CustomerSummaryStats {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  customersWithOrders: number;
}

export interface CustomerOverview {
  customer: CustomerAccount;
  orders: Order[];
  returns: ReturnRequest[];
  tickets: SupportTicket[];
  addresses: UserAddress[];
}

function normalizePhone(phone?: string): string {
  if (!phone) return "";
  return phone.replace(/\s+|-/g, "").trim();
}

class CustomerService {
  /* ================= STORAGE HELPERS ================= */

  private getStoredStatuses(): Record<string, CustomerStatus> {
    if (typeof window === "undefined") {
      return (memoryStore[CUSTOMER_STATUSES_KEY] as Record<string, CustomerStatus>) || {};
    }
    try {
      const stored = localStorage.getItem(CUSTOMER_STATUSES_KEY);
      const parsed = stored ? JSON.parse(stored) : {};
      memoryStore[CUSTOMER_STATUSES_KEY] = parsed;
      return parsed;
    } catch {
      return (memoryStore[CUSTOMER_STATUSES_KEY] as Record<string, CustomerStatus>) || {};
    }
  }

  private saveStoredStatuses(statuses: Record<string, CustomerStatus>): void {
    memoryStore[CUSTOMER_STATUSES_KEY] = statuses;
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(CUSTOMER_STATUSES_KEY, JSON.stringify(statuses));
    } catch (e) {
      console.error("Failed to save customer statuses", e);
    }
  }

  private getStoredProfiles(): Record<
    string,
    { firstName: string; lastName: string; phone?: string }
  > {
    if (typeof window === "undefined") {
      return (
        (memoryStore[CUSTOMER_PROFILES_KEY] as Record<
          string,
          { firstName: string; lastName: string; phone?: string }
        >) || {}
      );
    }
    try {
      const stored = localStorage.getItem(CUSTOMER_PROFILES_KEY);
      const parsed = stored ? JSON.parse(stored) : {};
      memoryStore[CUSTOMER_PROFILES_KEY] = parsed;
      return parsed;
    } catch {
      return (
        (memoryStore[CUSTOMER_PROFILES_KEY] as Record<
          string,
          { firstName: string; lastName: string; phone?: string }
        >) || {}
      );
    }
  }

  private saveStoredProfiles(
    profiles: Record<
      string,
      { firstName: string; lastName: string; phone?: string }
    >
  ): void {
    memoryStore[CUSTOMER_PROFILES_KEY] = profiles;
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(CUSTOMER_PROFILES_KEY, JSON.stringify(profiles));
    } catch (e) {
      console.error("Failed to save customer profiles", e);
    }
  }

  /* ================= DERIVE ALL CUSTOMERS ================= */

  private getAllCustomersMap(): Map<string, CustomerAccount> {
    const map = new Map<string, CustomerAccount>();
    const statuses = this.getStoredStatuses();
    const profiles = this.getStoredProfiles();

    // 1. Current Auth User / Default Mock User
    const currentUser = authService.getCurrentUser() || mockDefaultUser;
    const currentPhone = normalizePhone(currentUser.phone);
    if (currentPhone) {
      const profileOverride = profiles[currentPhone] || profiles[currentUser.id];
      const firstName = profileOverride?.firstName || currentUser.firstName || "کاربر";
      const lastName = profileOverride?.lastName || currentUser.lastName || "";
      const phone = profileOverride?.phone || currentUser.phone;

      map.set(currentPhone, {
        id: currentUser.id || `user-${currentPhone}`,
        phone,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`.trim(),
        createdAt: currentUser.createdAt || "۱۴۰۳/۰۵/۱۰",
        status: statuses[currentPhone] || statuses[currentUser.id] || "active",
        ordersCount: 0,
        totalSpent: 0,
        returnsCount: 0,
        ticketsCount: 0,
      });
    }

    // 2. Discover Customers from Orders
    const orders = accountService.getOrders();
    orders.forEach((o) => {
      const phone = normalizePhone(o.shippingAddress.phone);
      if (!phone) return;

      if (!map.has(phone)) {
        const parts = (o.shippingAddress.recipientName || "مشتری گرامی").trim().split(" ");
        const firstName = parts[0] || "مشتری";
        const lastName = parts.slice(1).join(" ") || "";
        const profileOverride = profiles[phone];

        map.set(phone, {
          id: `cust-${phone}`,
          phone: o.shippingAddress.phone,
          firstName: profileOverride?.firstName || firstName,
          lastName: profileOverride?.lastName || lastName,
          fullName: profileOverride
            ? `${profileOverride.firstName} ${profileOverride.lastName}`.trim()
            : o.shippingAddress.recipientName || "مشتری گرامی",
          createdAt: o.createdAt || "۱۴۰۳/۰۱/۰۱",
          status: statuses[phone] || "active",
          ordersCount: 0,
          totalSpent: 0,
          returnsCount: 0,
          ticketsCount: 0,
        });
      }

      const cust = map.get(phone)!;
      cust.ordersCount += 1;
      if (o.status !== "cancelled") {
        cust.totalSpent += o.payableTotal;
      }

      // Last Order details
      if (!cust.lastOrderId) {
        cust.lastOrderId = o.id;
        cust.lastOrderNumber = o.orderNumber;
        cust.lastOrderDate = o.createdAt;
      }
    });

    // 3. Discover Customers from Support Tickets
    const tickets = supportService.getTickets();
    tickets.forEach((t) => {
      const phone = normalizePhone(t.customerPhone);
      if (!phone) return;

      if (!map.has(phone)) {
        const parts = (t.customerName || "کاربر گرامی").trim().split(" ");
        const firstName = parts[0] || "کاربر";
        const lastName = parts.slice(1).join(" ") || "";
        const profileOverride = profiles[phone] || profiles[t.customerId];

        map.set(phone, {
          id: t.customerId || `cust-${phone}`,
          phone: t.customerPhone,
          firstName: profileOverride?.firstName || firstName,
          lastName: profileOverride?.lastName || lastName,
          fullName: profileOverride
            ? `${profileOverride.firstName} ${profileOverride.lastName}`.trim()
            : t.customerName || "کاربر گرامی",
          createdAt: "۱۴۰۳/۰۱/۰۱",
          status: statuses[phone] || statuses[t.customerId] || "active",
          ordersCount: 0,
          totalSpent: 0,
          returnsCount: 0,
          ticketsCount: 0,
        });
      }

      const cust = map.get(phone)!;
      cust.ticketsCount += 1;
    });

    // 4. Discover Customers from Return Requests
    const returnsRes = returnService.getReturnRequests();
    returnsRes.items.forEach((r) => {
      const phone = normalizePhone(r.customerPhone);
      if (!phone) return;

      if (!map.has(phone)) {
        const parts = (r.customerName || "خریدار").trim().split(" ");
        const firstName = parts[0] || "خریدار";
        const lastName = parts.slice(1).join(" ") || "";
        const profileOverride = profiles[phone] || profiles[r.customerId];

        map.set(phone, {
          id: r.customerId || `cust-${phone}`,
          phone: r.customerPhone,
          firstName: profileOverride?.firstName || firstName,
          lastName: profileOverride?.lastName || lastName,
          fullName: profileOverride
            ? `${profileOverride.firstName} ${profileOverride.lastName}`.trim()
            : r.customerName || "خریدار",
          createdAt: "۱۴۰۳/۰۱/۰۱",
          status: statuses[phone] || statuses[r.customerId] || "active",
          ordersCount: 0,
          totalSpent: 0,
          returnsCount: 0,
          ticketsCount: 0,
        });
      }

      const cust = map.get(phone)!;
      cust.returnsCount += 1;
    });

    return map;
  }

  /* ================= GET LIST WITH FILTERS & PAGINATION ================= */

  getCustomers(filters?: CustomerFilters): {
    items: CustomerAccount[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    summaryStats: CustomerSummaryStats;
  } {
    const customersMap = this.getAllCustomersMap();
    let allList = Array.from(customersMap.values());

    const summaryStats: CustomerSummaryStats = {
      totalCustomers: allList.length,
      activeCustomers: allList.filter((c) => c.status === "active").length,
      inactiveCustomers: allList.filter((c) => c.status === "inactive").length,
      customersWithOrders: allList.filter((c) => c.ordersCount > 0).length,
    };

    if (!filters) {
      return {
        items: allList,
        total: allList.length,
        page: 1,
        pageSize: allList.length,
        totalPages: 1,
        summaryStats,
      };
    }

    // Filter: Search (Name or Mobile)
    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      allList = allList.filter((c) => {
        const nameMatch = c.fullName.toLowerCase().includes(q) || c.firstName.toLowerCase().includes(q) || c.lastName.toLowerCase().includes(q);
        const phoneMatch = c.phone.includes(q);
        const idMatch = c.id.toLowerCase().includes(q);
        return nameMatch || phoneMatch || idMatch;
      });
    }

    // Filter: Status
    if (filters.status && filters.status !== "all") {
      allList = allList.filter((c) => c.status === filters.status);
    }

    // Filter: Purchase History
    if (filters.purchaseHistory && filters.purchaseHistory !== "all") {
      if (filters.purchaseHistory === "has_orders") {
        allList = allList.filter((c) => c.ordersCount > 0);
      } else if (filters.purchaseHistory === "no_orders") {
        allList = allList.filter((c) => c.ordersCount === 0);
      }
    }

    // Sorting
    const sortBy = filters.sortBy || "newest";
    allList.sort((a, b) => {
      if (sortBy === "most_orders") return b.ordersCount - a.ordersCount;
      if (sortBy === "highest_spend") return b.totalSpent - a.totalSpent;
      if (sortBy === "oldest") return a.id.localeCompare(b.id);
      // default: newest
      return b.id.localeCompare(a.id);
    });

    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 20;
    const total = allList.length;
    const totalPages = Math.ceil(total / pageSize) || 1;

    const startIndex = (page - 1) * pageSize;
    const paginatedItems = allList.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      total,
      page,
      pageSize,
      totalPages,
      summaryStats,
    };
  }

  /* ================= GET CUSTOMER BY ID ================= */

  getCustomerById(customerId: string): CustomerOverview | undefined {
    const customersMap = this.getAllCustomersMap();
    const cleanId = customerId.trim();

    let foundCustomer: CustomerAccount | undefined;
    for (const c of customersMap.values()) {
      if (
        c.id === cleanId ||
        normalizePhone(c.phone) === normalizePhone(cleanId) ||
        c.phone === cleanId
      ) {
        foundCustomer = c;
        break;
      }
    }

    if (!foundCustomer) return undefined;

    const phoneNorm = normalizePhone(foundCustomer.phone);

    // Fetch related domain data
    const orders = accountService
      .getOrders()
      .filter((o) => normalizePhone(o.shippingAddress.phone) === phoneNorm);

    const returns = returnService
      .getReturnRequests()
      .items.filter((r) => normalizePhone(r.customerPhone) === phoneNorm);

    const tickets = supportService
      .getTickets()
      .filter((t) => normalizePhone(t.customerPhone) === phoneNorm);

    const addresses = accountService
      .getAddresses()
      .filter((a) => normalizePhone(a.phone) === phoneNorm || a.recipientName.includes(foundCustomer!.firstName));

    return {
      customer: foundCustomer,
      orders,
      returns,
      tickets,
      addresses,
    };
  }

  /* ================= ACTIONS ================= */

  toggleCustomerStatus(customerId: string): CustomerStatus {
    const overview = this.getCustomerById(customerId);
    if (!overview) throw new Error("مشتری مورد نظر یافت نشد.");

    const currentStatus = overview.customer.status;
    const newStatus: CustomerStatus = currentStatus === "active" ? "inactive" : "active";

    const statuses = this.getStoredStatuses();
    const phoneNorm = normalizePhone(overview.customer.phone);

    statuses[phoneNorm] = newStatus;
    statuses[overview.customer.id] = newStatus;

    this.saveStoredStatuses(statuses);
    return newStatus;
  }

  updateCustomerInfo(
    customerId: string,
    payload: { firstName: string; lastName: string; phone?: string }
  ): CustomerAccount {
    const overview = this.getCustomerById(customerId);
    if (!overview) throw new Error("مشتری مورد نظر یافت نشد.");

    const profiles = this.getStoredProfiles();
    const phoneNorm = normalizePhone(overview.customer.phone);

    const updatedProfile = {
      firstName: payload.firstName.trim() || overview.customer.firstName,
      lastName: payload.lastName.trim() || overview.customer.lastName,
      phone: payload.phone ? payload.phone.trim() : overview.customer.phone,
    };

    profiles[phoneNorm] = updatedProfile;
    profiles[overview.customer.id] = updatedProfile;

    this.saveStoredProfiles(profiles);

    // Also update auth profile if it's the current user
    const currentUser = authService.getCurrentUser();
    if (currentUser && normalizePhone(currentUser.phone) === phoneNorm) {
      authService.updateProfile({
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
      });
    }

    const updatedOverview = this.getCustomerById(customerId);
    return updatedOverview!.customer;
  }
}

export const customerService = new CustomerService();
