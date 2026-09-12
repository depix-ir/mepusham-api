import { CartItem, PersistedCartData } from "./cart.types";

const CART_STORAGE_KEY = "mepusham_cart_v1";
const CURRENT_VERSION = 1;

/**
 * Safely loads cart items from localStorage.
 */
export function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawData = localStorage.getItem(CART_STORAGE_KEY);
    if (!rawData) {
      return [];
    }

    const parsed = JSON.parse(rawData);

    // Support schema versioning
    let itemsToValidate: unknown[] = [];
    if (parsed && typeof parsed === "object" && "version" in parsed && Array.isArray(parsed.items)) {
      if (parsed.version === CURRENT_VERSION) {
        itemsToValidate = parsed.items;
      } else {
        // Schema mismatch - return empty or handle migration if needed
        return [];
      }
    } else if (Array.isArray(parsed)) {
      itemsToValidate = parsed;
    }

    // Sanitize items
    const validItems: CartItem[] = itemsToValidate.filter((item): item is CartItem => {
      if (!item || typeof item !== "object") return false;
      const candidate = item as Partial<CartItem>;
      return (
        typeof candidate.id === "string" &&
        typeof candidate.productId === "string" &&
        typeof candidate.productSlug === "string" &&
        typeof candidate.name === "string" &&
        typeof candidate.image === "string" &&
        typeof candidate.unitPrice === "number" &&
        candidate.unitPrice >= 0 &&
        typeof candidate.quantity === "number" &&
        candidate.quantity >= 1 &&
        typeof candidate.availableStock === "number" &&
        candidate.availableStock >= 0
      );
    });

    return validItems;
  } catch (error) {
    console.error("Failed to load cart from localStorage:", error);
    return [];
  }
}

/**
 * Safely saves cart items to localStorage.
 */
export function saveCartToStorage(items: CartItem[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const data: PersistedCartData = {
      version: CURRENT_VERSION,
      items,
    };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save cart to localStorage:", error);
  }
}

/**
 * Clears cart from localStorage.
 */
export function clearCartStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear cart storage:", error);
  }
}
