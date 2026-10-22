import { apiClient } from "@/lib/api/client";

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_id?: string | null;
  is_active: boolean;
  display_order?: number;
  parent_category_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ListCategoriesResponse {
  categories: CategoryDto[];
  count: number;
  offset: number;
  limit: number;
}

export const categoriesApiService = {
  // Store
  listPublicCategories: (params?: { limit?: number; offset?: number; parent_category_id?: string; q?: string }) =>
    apiClient.get<ListCategoriesResponse>("/store/categories", { params }),

  getPublicCategory: (id: string) =>
    apiClient.get<{ category: CategoryDto }>(`/store/categories/${id}`),

  // Admin
  listAdminCategories: (params?: { limit?: number; offset?: number; is_active?: boolean; parent_category_id?: string }) =>
    apiClient.get<ListCategoriesResponse>("/admin/categories", { params }),

  getAdminCategory: (id: string) =>
    apiClient.get<{ category: CategoryDto }>(`/admin/categories/${id}`),

  createCategory: (data: { name: string; slug?: string; description?: string; image_id?: string; is_active?: boolean; display_order?: number; parent_category_id?: string }) =>
    apiClient.post<{ category: CategoryDto }>("/admin/categories", data),

  updateCategory: (id: string, data: Partial<{ name: string; slug?: string; description?: string; image_id?: string; is_active?: boolean; display_order?: number; parent_category_id?: string }>) =>
    apiClient.put<{ category: CategoryDto }>(`/admin/categories/${id}`, data),

  deleteCategory: (id: string) =>
    apiClient.delete<{ id: string; object: string; deleted: boolean }>(`/admin/categories/${id}`),
};
