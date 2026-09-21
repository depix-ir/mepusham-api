import { StoreSettings, StoreAddress } from "@/types/storeSettings";

export const STORE_SETTINGS_STORAGE_KEY = "mepusham_store_settings_v1";
export const LEGACY_SETTINGS_STORAGE_KEY = "mepusham_settings_v1";

export const DEFAULT_STORE_ADDRESS: StoreAddress = {
  id: "addr-store-default",
  title: "انبار مرکزی و دفتر تهران",
  recipientName: "مسئول انبار مپوشــــم",
  phone: "02188889999",
  province: "تهران",
  city: "تهران",
  address: "خیابان ولیعصر، بالاتر از میدان ونک، پلاک ۱۲",
  plaque: "۱۲",
  floor: "۱",
  postalCode: "1994833111",
};

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: "فروشگاه آنلاین مپوشــــم",
  contactPhone: "02188889999",
  supportEmail: "support@mepusham.ir",
  address: "تهران، خیابان ولیعصر، بالاتر از میدان ونک، پلاک ۱۲",
  taxRate: 10,
  enableSmsNotifications: true,
  enableEmailNotifications: true,
  autoApproveReturns: false,
  returnWindowDays: 2,
  addresses: [DEFAULT_STORE_ADDRESS],
  defaultShippingAddressId: "addr-store-default",
  defaultReturnAddressId: "addr-store-default",
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
};

export interface IStoreSettingsRepository {
  getSettings(options?: { isHydrated?: boolean }): StoreSettings;
  saveSettings(settings: StoreSettings): StoreSettings;
}

export class MockStoreSettingsRepository implements IStoreSettingsRepository {
  private memorySettings: StoreSettings | null = null;

  getSettings(options?: { isHydrated?: boolean }): StoreSettings {
    const isHydrated = options?.isHydrated ?? (typeof window !== "undefined");
    if (!isHydrated) {
      return this.memorySettings ?? DEFAULT_STORE_SETTINGS;
    }

    try {
      const stored = localStorage.getItem(STORE_SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StoreSettings;
        // Ensure addresses array exists
        if (!parsed.addresses) {
          parsed.addresses = [DEFAULT_STORE_ADDRESS];
          parsed.defaultShippingAddressId = DEFAULT_STORE_ADDRESS.id;
          parsed.defaultReturnAddressId = DEFAULT_STORE_ADDRESS.id;
        }
        this.memorySettings = parsed;
        return parsed;
      }

      // Migration check from legacy settings key
      const legacyStored = localStorage.getItem(LEGACY_SETTINGS_STORAGE_KEY);
      if (legacyStored) {
        try {
          const legacy = JSON.parse(legacyStored);
          const migrated: StoreSettings = {
            ...DEFAULT_STORE_SETTINGS,
            ...legacy,
            addresses: [DEFAULT_STORE_ADDRESS],
            defaultShippingAddressId: DEFAULT_STORE_ADDRESS.id,
            defaultReturnAddressId: DEFAULT_STORE_ADDRESS.id,
            updatedAt: new Date().toISOString(),
          };
          this.saveSettings(migrated);
          return migrated;
        } catch {
          // Fallback to default
        }
      }

      // Store default
      this.saveSettings(DEFAULT_STORE_SETTINGS);
      return DEFAULT_STORE_SETTINGS;
    } catch {
      return this.memorySettings ?? DEFAULT_STORE_SETTINGS;
    }
  }

  saveSettings(settings: StoreSettings): StoreSettings {
    const updatedSettings = {
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    this.memorySettings = updatedSettings;

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          STORE_SETTINGS_STORAGE_KEY,
          JSON.stringify(updatedSettings)
        );
        // Sync with legacy key for backward compatibility
        localStorage.setItem(
          LEGACY_SETTINGS_STORAGE_KEY,
          JSON.stringify({
            storeName: updatedSettings.storeName,
            contactPhone: updatedSettings.contactPhone,
            supportEmail: updatedSettings.supportEmail,
            address: updatedSettings.address,
            taxRate: updatedSettings.taxRate,
            enableSmsNotifications: updatedSettings.enableSmsNotifications,
            enableEmailNotifications: updatedSettings.enableEmailNotifications,
            autoApproveReturns: updatedSettings.autoApproveReturns,
            returnWindowDays: updatedSettings.returnWindowDays,
          })
        );
      } catch (e) {
        console.error("Failed to save store settings to localStorage:", e);
      }
    }

    return updatedSettings;
  }
}

export const storeSettingsRepository = new MockStoreSettingsRepository();
