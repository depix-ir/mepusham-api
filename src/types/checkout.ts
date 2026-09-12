export interface CustomerInformation {
  firstName: string;
  lastName: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
}

export interface ShippingSelection {
  methodId: string;
  price: number;
  title: string;
  estimatedDelivery: string;
}

export interface PricingSummary {
  itemsSubtotal: number;
  shippingCost: number;
  payableTotal: number;
}

export interface CheckoutPayload {
  customer: CustomerInformation;
  shipping: ShippingSelection;
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
    unitPrice: number;
  }[];
  pricing: PricingSummary;
  createdAt: string;
}

export interface CheckoutFormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  province?: string;
  city?: string;
  address?: string;
  postalCode?: string;
}

export interface CheckoutValidationResult {
  isValid: boolean;
  formErrors: CheckoutFormErrors;
  cartErrors: string[];
}
