import { apiClient } from "@/lib/api/client";

export interface TicketDto {
  id: string;
  ticket_number: string;
  customer_id: string;
  category_id: string;
  subject: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "normal" | "high" | "urgent";
  order_id?: string | null;
  product_id?: string | null;
  assigned_to_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const supportApiService = {
  // Store
  listStoreTickets: () =>
    apiClient.get<{ tickets: TicketDto[] }>("/store/tickets"),

  createStoreTicket: (data: {
    category_id: string;
    subject: string;
    message: string;
    order_id?: string;
    product_id?: string;
    priority?: "low" | "normal" | "high" | "urgent";
  }) => apiClient.post<{ ticket: TicketDto }>("/store/tickets", data),

  // Admin
  listAdminTickets: (params?: {
    status?: "open" | "in_progress" | "resolved" | "closed";
    priority?: "low" | "normal" | "high" | "urgent";
    assigned_to_id?: string;
  }) => apiClient.get<{ tickets: TicketDto[]; count: number }>("/admin/tickets", { params }),
};
