import { apiClient } from "@/lib/api/client";

export interface BrandDto {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo_id?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ListBrandsResponse {
  brands: BrandDto[];
  count: number;
  offset: number;
  limit: number;
}

export const brandsApiService = {
  // Store
  listPublicBrands: (params?: { limit?: number; offset?: number; q?: string }) =>
    apiClient.get<ListBrandsResponse>("/store/brands", { params }),

  getPublicBrand: (idOrSlug: string) =>
    apiClient.get<{ brand: BrandDto }>(`/store/brands/${idOrSlug}`),

  // Admin
  listAdminBrands: (params?: { limit?: number; offset?: number; is_active?: boolean; q?: string }) =>
    apiClient.get<ListBrandsResponse>("/admin/brands", { params }),

  getAdminBrand: (id: string) =>
    apiClient.get<{ brand: BrandDto }>(`/admin/brands/${id}`),

  createBrand: (data: { name: string; slug: string; description?: string; logo_id?: string; is_active?: boolean; metadata?: Record<string, unknown> }) =>
    apiClient.post<{ brand: BrandDto }>("/admin/brands", data),

  updateBrand: (id: string, data: Partial<{ name: string; slug: string; description?: string; logo_id?: string; is_active?: boolean; metadata?: Record<string, unknown> }>) =>
    apiClient.put<{ brand: BrandDto }>(`/admin/brands/${id}`, data),

  deleteBrand: (id: string) =>
    apiClient.delete<{ id: string; object: string; deleted: boolean }>(`/admin/brands/${id}`),
};
