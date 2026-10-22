import { apiClient } from "@/lib/api/client";

export interface MarginSummaryDto {
  gross_sales: number;
  discounts?: number;
  taxes?: number;
  shipping?: number;
  refunds?: number;
  net_sales: number;
  cogs: number;
  gross_profit: number;
  gross_margin_percentage: number;
}

export interface MarginReportResponse {
  summary: MarginSummaryDto;
  breakdown: Record<string, unknown>[];
}

export const reportsApiService = {
  getMarginReport: (params?: {
    start_date?: string;
    end_date?: string;
    group_by?: "day" | "week" | "month" | "product" | "variant" | "category";
  }) => apiClient.get<MarginReportResponse>("/admin/reports/margin", { params }),
};
