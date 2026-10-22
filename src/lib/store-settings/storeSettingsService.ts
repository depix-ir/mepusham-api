import {
  StoreSettings,
  StoreAddress,
  StoreAddressValidationResult,
} from "@/types/storeSettings";
import {
  IStoreSettingsRepository,
  storeSettingsRepository,
} from "./storeSettingsRepository";
import { storeSettingsApiService, StoreSettingsDto } from "@/lib/services/storeSettings";

export function normalizeDigits(input: string): string {
  if (!input) return "";
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return input
    .replace(/[۰-۹]/g, (w) => `${persianDigits.indexOf(w)}`)
    .replace(/[٠-٩]/g, (w) => `${arabicDigits.indexOf(w)}`);
}

export function validateStoreAddress(
  address: Partial<StoreAddress>
): StoreAddressValidationResult {
  const errors: Record<string, string> = {};

  if (!address.title || !address.title.trim()) {
    errors.title = "عنوان آدرس الزامی است.";
  }

  if (!address.recipientName || !address.recipientName.trim()) {
    errors.recipientName = "نام تحویل‌گیرنده الزامی است.";
  }

  if (!address.phone || !address.phone.trim()) {
    errors.phone = "شماره تماس الزامی است.";
  } else {
    const cleanPhone = normalizeDigits(address.phone).replace(/\D/g, "");
    if (cleanPhone.length < 8 || cleanPhone.length > 12) {
      errors.phone = "شماره تماس نامعتبر است.";
    }
  }

  if (!address.province || !address.province.trim()) {
    errors.province = "انتخاب استان الزامی است.";
  }

  if (!address.city || !address.city.trim()) {
    errors.city = "انتخاب شهر الزامی است.";
  }

  if (!address.address || !address.address.trim()) {
    errors.address = "آدرس کامل الزامی است.";
  }

  if (!address.postalCode || !address.postalCode.trim()) {
    errors.postalCode = "کد پستی ۱۰ رقمی الزامی است.";
  } else {
    const cleanPostal = normalizeDigits(address.postalCode).replace(/\D/g, "");
    if (cleanPostal.length !== 10) {
      errors.postalCode = "کد پستی باید دقیقا ۱۰ رقم بدون فاصله یا خط تیره باشد.";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export class StoreSettingsService {
  constructor(private repo: IStoreSettingsRepository = storeSettingsRepository) {}

  getSettings(options?: { isHydrated?: boolean }): StoreSettings {
    return this.repo.getSettings(options);
  }

  saveSettings(settings: StoreSettings): StoreSettings {
    return this.repo.saveSettings(settings);
  }

  getAddresses(options?: { isHydrated?: boolean }): StoreAddress[] {
    const settings = this.getSettings(options);
    return settings.addresses || [];
  }

  addAddress(addressData: Omit<StoreAddress, "id">, options?: { isHydrated?: boolean }): { address: StoreAddress; settings: StoreSettings } {
    const validation = validateStoreAddress(addressData);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      throw new Error(firstError);
    }

    const settings = this.getSettings(options);
    const cleanPostalCode = normalizeDigits(addressData.postalCode).replace(/\D/g, "");
    const cleanPhone = normalizeDigits(addressData.phone).replace(/\D/g, "");

    const newAddress: StoreAddress = {
      ...addressData,
      id: `addr-store-${Date.now()}`,
      phone: cleanPhone,
      postalCode: cleanPostalCode,
    };

    const updatedAddresses = [...settings.addresses, newAddress];
    let defaultShippingId = settings.defaultShippingAddressId;
    let defaultReturnId = settings.defaultReturnAddressId;

    // Auto set defaults if first address
    if (updatedAddresses.length === 1 || !defaultShippingId) {
      defaultShippingId = newAddress.id;
    }
    if (updatedAddresses.length === 1 || !defaultReturnId) {
      defaultReturnId = newAddress.id;
    }

    const updatedSettings: StoreSettings = {
      ...settings,
      addresses: updatedAddresses,
      defaultShippingAddressId: defaultShippingId,
      defaultReturnAddressId: defaultReturnId,
    };

    const saved = this.saveSettings(updatedSettings);
    return { address: newAddress, settings: saved };
  }

  updateAddress(id: string, addressData: Partial<StoreAddress>, options?: { isHydrated?: boolean }): { address: StoreAddress; settings: StoreSettings } {
    const settings = this.getSettings(options);
    const existing = settings.addresses.find((a) => a.id === id);
    if (!existing) {
      throw new Error("آدرس مورد نظر یافت نشد.");
    }

    const merged = { ...existing, ...addressData };
    const validation = validateStoreAddress(merged);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      throw new Error(firstError);
    }

    const cleanPostalCode = normalizeDigits(merged.postalCode).replace(/\D/g, "");
    const cleanPhone = normalizeDigits(merged.phone).replace(/\D/g, "");

    const updatedAddress: StoreAddress = {
      ...merged,
      phone: cleanPhone,
      postalCode: cleanPostalCode,
    };

    const updatedAddresses = settings.addresses.map((a) =>
      a.id === id ? updatedAddress : a
    );

    const updatedSettings: StoreSettings = {
      ...settings,
      addresses: updatedAddresses,
    };

    const saved = this.saveSettings(updatedSettings);
    return { address: updatedAddress, settings: saved };
  }

  deleteAddress(id: string, options?: { isHydrated?: boolean }): StoreSettings {
    const settings = this.getSettings(options);
    const updatedAddresses = settings.addresses.filter((a) => a.id !== id);

    let defaultShippingId = settings.defaultShippingAddressId;
    let defaultReturnId = settings.defaultReturnAddressId;

    if (defaultShippingId === id) {
      defaultShippingId = updatedAddresses[0]?.id || undefined;
    }
    if (defaultReturnId === id) {
      defaultReturnId = updatedAddresses[0]?.id || undefined;
    }

    const updatedSettings: StoreSettings = {
      ...settings,
      addresses: updatedAddresses,
      defaultShippingAddressId: defaultShippingId,
      defaultReturnAddressId: defaultReturnId,
    };

    return this.saveSettings(updatedSettings);
  }

  setDefaultShippingAddress(id: string, options?: { isHydrated?: boolean }): StoreSettings {
    const settings = this.getSettings(options);
    const target = settings.addresses.find((a) => a.id === id);
    if (!target) {
      throw new Error("آدرس مورد نظر یافت نشد.");
    }

    const updatedSettings: StoreSettings = {
      ...settings,
      defaultShippingAddressId: id,
    };

    return this.saveSettings(updatedSettings);
  }

  setDefaultReturnAddress(id: string, options?: { isHydrated?: boolean }): StoreSettings {
    const settings = this.getSettings(options);
    const target = settings.addresses.find((a) => a.id === id);
    if (!target) {
      throw new Error("آدرس مورد نظر یافت نشد.");
    }

    const updatedSettings: StoreSettings = {
      ...settings,
      defaultReturnAddressId: id,
    };

    return this.saveSettings(updatedSettings);
  }

  getDefaultShippingAddress(options?: { isHydrated?: boolean }): StoreAddress | undefined {
    const settings = this.getSettings(options);
    if (!settings.defaultShippingAddressId) {
      return settings.addresses[0];
    }
    return settings.addresses.find((a) => a.id === settings.defaultShippingAddressId) || settings.addresses[0];
  }

  getDefaultReturnAddress(options?: { isHydrated?: boolean }): StoreAddress | undefined {
    const settings = this.getSettings(options);
    if (!settings.defaultReturnAddressId) {
      return settings.addresses[0];
    }
    return settings.addresses.find((a) => a.id === settings.defaultReturnAddressId) || settings.addresses[0];
  }

  /* ================= API INTEGRATION ================= */

  async fetchSettingsFromApi(): Promise<StoreSettings> {
    try {
      const apiSettings = await storeSettingsApiService.getStoreSettings();
      if (apiSettings) {
        const mappedAddresses: StoreAddress[] = (apiSettings.addresses || []).map((a) => ({
          id: a.id,
          title: a.title,
          recipientName: a.recipientName || a.recipient_name || "",
          phone: a.phone,
          province: a.province,
          city: a.city,
          address: a.address,
          plaque: a.plaque || undefined,
          floor: a.floor || undefined,
          postalCode: a.postalCode || a.postal_code || "",
        }));

        const mappedSettings: StoreSettings = {
          storeName: apiSettings.storeName,
          contactPhone: apiSettings.contactPhone,
          supportEmail: apiSettings.supportEmail,
          address: apiSettings.address,
          taxRate: apiSettings.taxRate,
          enableSmsNotifications: apiSettings.enableSmsNotifications,
          enableEmailNotifications: apiSettings.enableEmailNotifications,
          returnWindowDays: apiSettings.returnWindowDays,
          autoApproveReturns: apiSettings.autoApproveReturns,
          defaultShippingAddressId: apiSettings.defaultShippingAddressId || undefined,
          defaultReturnAddressId: apiSettings.defaultReturnAddressId || undefined,
          addresses: mappedAddresses,
          createdAt: apiSettings.createdAt || new Date().toISOString(),
          updatedAt: apiSettings.updatedAt || new Date().toISOString(),
        };

        return this.saveSettings(mappedSettings);
      }
    } catch (err) {
      console.warn("StoreSettingsService: Failed to fetch settings from API, using local state", err);
    }
    return this.getSettings();
  }

  async updateSettingsApi(settingsData: Partial<Omit<StoreSettingsDto, "id" | "addresses" | "createdAt" | "updatedAt">>): Promise<StoreSettings> {
    const apiRes = await storeSettingsApiService.updateStoreSettings(settingsData);
    if (apiRes) {
      return this.fetchSettingsFromApi();
    }
    return this.getSettings();
  }

  async addAddressApi(addressData: Omit<StoreAddress, "id">): Promise<{ address: StoreAddress; settings: StoreSettings }> {
    const validation = validateStoreAddress(addressData);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      throw new Error(firstError);
    }

    const cleanPostalCode = normalizeDigits(addressData.postalCode).replace(/\D/g, "");
    const cleanPhone = normalizeDigits(addressData.phone).replace(/\D/g, "");

    const dtoPayload = {
      title: addressData.title,
      recipientName: addressData.recipientName,
      phone: cleanPhone,
      province: addressData.province,
      city: addressData.city,
      address: addressData.address,
      plaque: addressData.plaque || null,
      floor: addressData.floor || null,
      postalCode: cleanPostalCode,
    };

    const apiRes = await storeSettingsApiService.createStoreAddress(dtoPayload);
    if (apiRes && apiRes.address) {
      const updatedSettings = await this.fetchSettingsFromApi();
      const createdAddr: StoreAddress = {
        id: apiRes.address.id,
        title: apiRes.address.title,
        recipientName: apiRes.address.recipientName || apiRes.address.recipient_name || addressData.recipientName || "",
        phone: apiRes.address.phone,
        province: apiRes.address.province,
        city: apiRes.address.city,
        address: apiRes.address.address,
        plaque: apiRes.address.plaque || undefined,
        floor: apiRes.address.floor || undefined,
        postalCode: apiRes.address.postalCode || apiRes.address.postal_code || cleanPostalCode || "",
      };
      return { address: createdAddr, settings: updatedSettings };
    }

    return this.addAddress(addressData);
  }

  async updateAddressApi(id: string, addressData: Partial<StoreAddress>): Promise<{ address: StoreAddress; settings: StoreSettings }> {
    await storeSettingsApiService.updateStoreAddress(id, {
      title: addressData.title,
      recipientName: addressData.recipientName,
      phone: addressData.phone ? normalizeDigits(addressData.phone).replace(/\D/g, "") : undefined,
      province: addressData.province,
      city: addressData.city,
      address: addressData.address,
      plaque: addressData.plaque || null,
      floor: addressData.floor || null,
      postalCode: addressData.postalCode ? normalizeDigits(addressData.postalCode).replace(/\D/g, "") : undefined,
    });
    const updatedSettings = await this.fetchSettingsFromApi();
    const updatedAddr = updatedSettings.addresses.find((a) => a.id === id);
    if (updatedAddr) {
      return { address: updatedAddr, settings: updatedSettings };
    }

    return this.updateAddress(id, addressData);
  }

  async deleteAddressApi(id: string): Promise<StoreSettings> {
    await storeSettingsApiService.deleteStoreAddress(id);
    return await this.fetchSettingsFromApi();
  }

  async setDefaultShippingAddressApi(id: string): Promise<StoreSettings> {
    await storeSettingsApiService.setDefaultShippingAddress(id);
    return await this.fetchSettingsFromApi();
  }

  async setDefaultReturnAddressApi(id: string): Promise<StoreSettings> {
    await storeSettingsApiService.setDefaultReturnAddress(id);
    return await this.fetchSettingsFromApi();
  }
}

export const storeSettingsService = new StoreSettingsService();
