export interface SelectedVariantAttribute {
  attributeId: string;
  attributeName: string;
  valueId: string;
  valueLabel: string;
}

export interface CartItem {
  id: string; // Composite unique key: productId or productId:variantId or productId:hash
  productId: string;
  productSlug: string;
  name: string;
  image: string;
  variantId?: string;
  selectedVariants?: SelectedVariantAttribute[];
  unitPrice: number;
  compareAtPrice?: number;
  quantity: number;
  availableStock: number;
}

export type CartValidationErrorType =
  | "OUT_OF_STOCK"
  | "QUANTITY_EXCEEDS_STOCK"
  | "INVALID_QUANTITY"
  | "PRODUCT_NOT_FOUND"
  | "VARIANT_UNAVAILABLE";

export interface CartValidationError {
  itemId: string;
  productTitle: string;
  type: CartValidationErrorType;
  message: string;
  maxAvailable?: number;
}

export interface CartValidationResult {
  valid: boolean;
  errors: CartValidationError[];
}

export interface PersistedCartData {
  version: number;
  items: CartItem[];
}
