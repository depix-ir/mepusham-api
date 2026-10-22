import { apiClient } from "@/lib/api/client";

export interface MediaDto {
  id: string;
  original_filename: string;
  file_key: string;
  mime_type?: string;
  file_size?: number;
  storage_provider?: string;
  url: string;
  width?: number | null;
  height?: number | null;
  uploaded_by_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ListMediaResponse {
  media: MediaDto[];
  count: number;
  offset: number;
  limit: number;
}

export const mediaApiService = {
  // Admin
  uploadAdminMedia: (formData: FormData) =>
    apiClient.post<{ media: MediaDto }>("/admin/media/upload", formData),

  listAdminMedia: (params?: { limit?: number; offset?: number; q?: string; mime_type?: string; uploaded_by_id?: string }) =>
    apiClient.get<ListMediaResponse>("/admin/media", { params }),

  getAdminMedia: (id: string) =>
    apiClient.get<{ media: MediaDto }>(`/admin/media/${id}`),

  deleteAdminMedia: (id: string) =>
    apiClient.delete<{ id: string; object: string; deleted: boolean }>(`/admin/media/${id}`),

  // Store
  uploadStoreReviewMedia: (formData: FormData) =>
    apiClient.post<{ url: string }>("/store/reviews/media", formData),
};
