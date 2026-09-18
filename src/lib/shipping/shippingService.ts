import { ShippingOption, shippingMethods } from "@/data/shipping";

const SHIPPING_STORAGE_KEY = "mepusham_shipping_methods_v1";

class ShippingService {
  /**
   * Retrieve all shipping options.
   */
  getShippingMethods(options?: { isHydrated?: boolean }): ShippingOption[] {
    const isHydrated = options?.isHydrated ?? (typeof window !== "undefined");
    if (!isHydrated) return shippingMethods;
    try {
      const stored = localStorage.getItem(SHIPPING_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(shippingMethods));
        return shippingMethods;
      }
      return JSON.parse(stored);
    } catch {
      return shippingMethods;
    }
  }

  getShippingMethodById(id: string): ShippingOption | undefined {
    const methods = this.getShippingMethods();
    return methods.find((m) => m.id === id);
  }

  saveShippingMethod(method: Omit<ShippingOption, "id"> & { id?: string }): ShippingOption[] {
    const methods = this.getShippingMethods();
    let updated: ShippingOption[];

    if (method.id) {
      updated = methods.map((m) => (m.id === method.id ? ({ ...m, ...method } as ShippingOption) : m));
    } else {
      const newMethod: ShippingOption = {
        ...method,
        id: `ship-${Date.now()}`,
      };
      updated = [...methods, newMethod];
    }

    this.persistShippingMethods(updated);
    return updated;
  }

  deleteShippingMethod(id: string): ShippingOption[] {
    const methods = this.getShippingMethods();
    const updated = methods.filter((m) => m.id !== id);
    this.persistShippingMethods(updated);
    return updated;
  }

  private persistShippingMethods(methods: ShippingOption[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(methods));
    } catch (e) {
      console.error("Failed to save shipping methods:", e);
    }
  }
}

export const shippingService = new ShippingService();
