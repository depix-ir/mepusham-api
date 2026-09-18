export interface StoreAddress {
  id: string;
  title: string;
  recipientName: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  plaque?: string;
  floor?: string;
  postalCode: string;
}

export interface StoreSettings {
  storeName: string;
  contactPhone: string;
  supportEmail: string;
  address: string;
  taxRate: number;
  enableSmsNotifications: boolean;
  enableEmailNotifications: boolean;
  autoApproveReturns: boolean;
  returnWindowDays: number;

  addresses: StoreAddress[];

  defaultShippingAddressId?: string;
  defaultReturnAddressId?: string;

  createdAt: string;
  updatedAt: string;
}

export interface StoreAddressValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}
