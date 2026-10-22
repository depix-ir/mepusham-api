import { apiClient } from "@/lib/api/client";

export interface StoreAddressDto {
  id: string;
  title: string;
  recipientName?: string;
  recipient_name?: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  plaque?: string | null;
  floor?: string | null;
  postalCode?: string;
  postal_code?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StoreSettingsDto {
  id: string;
  storeName: string;
  contactPhone: string;
  supportEmail: string;
  address: string;
  taxRate: number;
  enableSmsNotifications: boolean;
  enableEmailNotifications: boolean;
  returnWindowDays: number;
  autoApproveReturns: boolean;
  defaultShippingAddressId?: string | null;
  defaultReturnAddressId?: string | null;
  addresses: StoreAddressDto[];
  createdAt?: string;
  updatedAt?: string;
}

export const storeSettingsApiService = {
  getStoreSettings: () =>
    apiClient.get<StoreSettingsDto>("/admin/settings"),

  updateStoreSettings: (data: Partial<Omit<StoreSettingsDto, "id" | "addresses" | "createdAt" | "updatedAt">>) =>
    apiClient.patch<StoreSettingsDto>("/admin/settings", data),

  listStoreAddresses: () =>
    apiClient.get<{ addresses: StoreAddressDto[]; defaultShippingAddressId: string | null; defaultReturnAddressId: string | null }>("/admin/settings/addresses"),

  createStoreAddress: (data: Omit<StoreAddressDto, "id" | "createdAt" | "updatedAt">) =>
    apiClient.post<{ address: StoreAddressDto }>("/admin/settings/addresses", data),

  updateStoreAddress: (id: string, data: Partial<Omit<StoreAddressDto, "id" | "createdAt" | "updatedAt">>) =>
    apiClient.patch<{ address: StoreAddressDto }>(`/admin/settings/addresses/${id}`, data),

  deleteStoreAddress: (id: string) =>
    apiClient.delete<{ deleted: boolean; id: string }>(`/admin/settings/addresses/${id}`),

  setDefaultShippingAddress: (addressId: string) =>
    apiClient.put<StoreSettingsDto>("/admin/settings/default-shipping-address", { addressId }),

  setDefaultReturnAddress: (addressId: string) =>
    apiClient.put<StoreSettingsDto>("/admin/settings/default-return-address", { addressId }),
};
