import {
  Order,
  UserAddress,
  SupportTicket,
  TicketStatus,
  TicketMessage,
} from "@/types/account";
import {
  mockInitialOrders,
  mockInitialAddresses,
  mockInitialTickets,
} from "@/data/mockAccountData";

const ORDERS_KEY = "mepusham_orders_v1";
const ADDRESSES_KEY = "mepusham_addresses_v1";
const TICKETS_KEY = "mepusham_tickets_v1";

class AccountService {
  /* ================= ORDERS ================= */

  getOrders(): Order[] {
    if (typeof window === "undefined") return mockInitialOrders;
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
    return orders.find(
      (o) => o.id === orderId || o.orderNumber === orderId
    );
  }

  /* ================= ADDRESSES ================= */

  getAddresses(): UserAddress[] {
    if (typeof window === "undefined") return mockInitialAddresses;
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

  getTickets(): SupportTicket[] {
    if (typeof window === "undefined") return mockInitialTickets;
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
        },
      ],
    };

    const updated = [newTicket, ...tickets];
    this.persistTickets(updated);
    return newTicket;
  }

  addTicketMessage(ticketId: string, text: string): SupportTicket {
    const tickets = this.getTickets();
    let updatedTicket: SupportTicket | undefined;

    const updated = tickets.map((t) => {
      if (t.id === ticketId || t.ticketNumber === ticketId) {
        const newMessage: TicketMessage = {
          id: `msg-${Date.now()}`,
          sender: "user",
          text,
          createdAt: "هم‌اکنون",
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
