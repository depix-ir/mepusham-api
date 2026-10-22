import { apiClient } from "@/lib/api/client";

export interface InventoryTransactionDto {
  id: string;
  inventory_item_id: string;
  location_id: string;
  quantity_change: number;
  type: "adjustment" | "sale" | "return" | "transfer" | "reservation";
  description?: string | null;
  created_at?: string;
}

export interface GlobalInventoryHistoryResponse {
  transactions: InventoryTransactionDto[];
  count: number;
  offset: number;
  limit: number;
}

export const inventoryApiService = {
  getGlobalInventoryHistory: (params?: { limit?: number; offset?: number; location_id?: string; type?: string }) =>
    apiClient.get<GlobalInventoryHistoryResponse>("/admin/inventory/history", { params }),

  getLowStockAlerts: (params?: { threshold?: number }) =>
    apiClient.get<{ items: Record<string, unknown>[] }>("/admin/inventory/low-stock", { params }),
};
