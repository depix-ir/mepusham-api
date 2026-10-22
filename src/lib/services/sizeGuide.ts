import { apiClient } from "@/lib/api/client";

export interface SizeGuideTemplateDto {
  id: string;
  title: string;
  description?: string | null;
  columns: string[];
  rows: Record<string, unknown>[];
  created_at?: string;
  updated_at?: string;
}

export const sizeGuideApiService = {
  // Admin
  listTemplates: () =>
    apiClient.get<{ templates: SizeGuideTemplateDto[] }>("/admin/size-guides/templates"),

  createTemplate: (data: {
    title: string;
    description?: string;
    columns: string[];
    rows: Record<string, unknown>[];
  }) => apiClient.post<{ template: SizeGuideTemplateDto }>("/admin/size-guides/templates", data),

  // Store
  getStoreProductSizeGuide: (productId: string) =>
    apiClient.get<{ size_guide: SizeGuideTemplateDto }>(`/store/products/${productId}/size-guide`),
};
