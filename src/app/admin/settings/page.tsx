"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";
import { StoreSettings, StoreAddress } from "@/types/storeSettings";
import { storeSettingsService } from "@/lib/store-settings/storeSettingsService";
import { StoreAddressModal } from "@/components/admin/settings/StoreAddressModal";
import {
  Settings,
  Store,
  Bell,
  Save,
  ShieldCheck,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<StoreAddress | null>(null);

  useEffect(() => {
    setIsHydrated(true);
    const loaded = storeSettingsService.getSettings({ isHydrated: true });
    setSettings(loaded);
  }, []);

  const refreshSettings = () => {
    const updated = storeSettingsService.getSettings({ isHydrated: true });
    setSettings(updated);
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      storeSettingsService.saveSettings(settings);
      showToast("تنظیمات عمومی با موفقیت ذخیره شد.", "success");
    } catch {
      showToast("خطا در ذخیره‌سازی تنظیمات.", "error");
    }
  };

  const handleSaveAddress = (
    addressData: Omit<StoreAddress, "id"> & { id?: string }
  ) => {
    try {
      if (addressData.id) {
        storeSettingsService.updateAddress(addressData.id, addressData, {
          isHydrated: true,
        });
        showToast("آدرس فروشگاه با موفقیت به‌روزرسانی شد.", "success");
      } else {
        storeSettingsService.addAddress(addressData, { isHydrated: true });
        showToast("آدرس جدید فروشگاه ثبت شد.", "success");
      }
      refreshSettings();
    } catch (err: any) {
      showToast(err.message || "خطا در ذخیره‌سازی آدرس.", "error");
    }
  };

  const handleDeleteAddress = (id: string) => {
    try {
      storeSettingsService.deleteAddress(id, { isHydrated: true });
      showToast("آدرس حذف گردید.", "info");
      refreshSettings();
    } catch (err: any) {
      showToast(err.message || "خطا در حذف آدرس.", "error");
    }
  };

  const handleSetDefaultShipping = (id: string) => {
    try {
      storeSettingsService.setDefaultShippingAddress(id, { isHydrated: true });
      showToast("آدرس پیش‌فرض مبدا ارسال تغییر یافت.", "success");
      refreshSettings();
    } catch (err: any) {
      showToast(err.message || "خطا در تغییر آدرس پیش‌فرض ارسال.", "error");
    }
  };

  const handleSetDefaultReturn = (id: string) => {
    try {
      storeSettingsService.setDefaultReturnAddress(id, { isHydrated: true });
      showToast("آدرس پیش‌فرض مقصد مرجوعی تغییر یافت.", "success");
      refreshSettings();
    } catch (err: any) {
      showToast(err.message || "خطا در تغییر آدرس پیش‌فرض مرجوعی.", "error");
    }
  };

  if (!isHydrated || !settings) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">
        در حال بارگذاری تنظیمات فروشگاه...
      </div>
    );
  }

  const addresses = settings.addresses || [];

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            <span>تنظیمات عمومی و آدرس‌های فروشگاه</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            پیکربندی اطلاعات عمومی، مبدا ارسال مرسولات، مقصد مرجوعی و قوانین مالیاتی
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveGeneral}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>ذخیره کلیه تغییرات</span>
        </button>
      </div>

      <form onSubmit={handleSaveGeneral} className="space-y-6 text-xs">
        {/* Store Information Section */}
        <div className="p-6 bg-background border border-border-subtle rounded-2xl space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border-subtle pb-3">
            <Store className="w-4 h-4 text-primary" />
            <span>اطلاعات عمومی و ارتباطی فروشگاه</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-muted-foreground mb-1 font-medium">نام فروشگاه</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full h-10 px-3 border border-border-subtle rounded-xl bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-muted-foreground mb-1 font-medium">شماره تماس پشتیبانی</label>
              <input
                type="text"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full h-10 px-3 border border-border-subtle rounded-xl bg-background text-foreground font-mono"
              />
            </div>

            <div>
              <label className="block text-muted-foreground mb-1 font-medium">ایمیل پشتیبانی</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full h-10 px-3 border border-border-subtle rounded-xl bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block text-muted-foreground mb-1 font-medium">نرخ مالیات بر ارزش افزوده (%)</label>
              <input
                type="number"
                value={settings.taxRate}
                onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
                className="w-full h-10 px-3 border border-border-subtle rounded-xl bg-background text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Store Addresses Section (PART A Requirement) */}
        <div id="store-addresses-section" className="p-6 bg-background border border-border-subtle rounded-2xl space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>آدرس‌های مبدا ارسال و مقصد مرجوعی فروشگاه</span>
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                این آدرس‌ها به عنوان مبدا ارسال سفارش‌ها و مقصد بازگشت کالاهای مرجوعی به صورت خودکار استفاده می‌شوند.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingAddress(null);
                setIsAddressModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs rounded-xl transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن آدرس جدید</span>
            </button>
          </div>

          {/* Empty State */}
          {addresses.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-border rounded-xl space-y-3">
              <div className="w-12 h-12 rounded-full bg-warning/10 text-warning flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-foreground text-xs">هیچ آدرسی برای فروشگاه ثبت نشده است</h3>
              <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                جهت صدور فاکتور و ارسال سفارش‌ها، حداقل یک آدرس برای مبدا ارسال و مقصد مرجوعی ثبت کنید.
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditingAddress(null);
                  setIsAddressModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-xl"
              >
                <Plus className="w-4 h-4" />
                <span>ثبت اولین آدرس فروشگاه</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => {
                const isDefaultShipping = settings.defaultShippingAddressId === addr.id;
                const isDefaultReturn = settings.defaultReturnAddressId === addr.id;

                return (
                  <div
                    key={addr.id}
                    className={`p-4 rounded-xl border transition-all space-y-3 ${
                      isDefaultShipping || isDefaultReturn
                        ? "border-primary/40 bg-surface-subtle/60"
                        : "border-border/80 bg-background"
                    }`}
                  >
                    {/* Header line of card */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-xs">{addr.title}</span>
                        <span className="text-[11px] text-muted-foreground">({addr.recipientName})</span>
                      </div>

                      {/* Default Badges */}
                      <div className="flex items-center gap-2">
                        {isDefaultShipping && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold text-[10px]">
                            <Truck className="w-3 h-3" />
                            <span>پیش‌فرض ارسال</span>
                          </span>
                        )}
                        {isDefaultReturn && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 font-bold text-[10px]">
                            <RotateCcw className="w-3 h-3" />
                            <span>پیش‌فرض مرجوعی</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Address details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                      <div>
                        آدرس: <strong className="text-foreground">{addr.province}، {addr.city}، {addr.address}</strong>
                        {addr.plaque && `، پلاک ${addr.plaque}`}
                        {addr.floor && `، طبقه ${addr.floor}`}
                      </div>
                      <div className="sm:text-left">
                        کد پستی: <strong className="text-foreground font-mono">{addr.postalCode}</strong> | تلفن: <strong className="text-foreground font-mono">{addr.phone}</strong>
                      </div>
                    </div>

                    {/* Action buttons bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40">
                      {/* Default Selection Toggles */}
                      <div className="flex items-center gap-2">
                        {!isDefaultShipping && (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultShipping(addr.id)}
                            className="px-2.5 py-1 bg-background border border-border text-muted-foreground hover:text-primary hover:border-primary rounded-lg text-[11px] font-medium transition-colors"
                          >
                            انتخاب به عنوان پیش‌فرض ارسال
                          </button>
                        )}
                        {!isDefaultReturn && (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultReturn(addr.id)}
                            className="px-2.5 py-1 bg-background border border-border text-muted-foreground hover:text-emerald-600 hover:border-emerald-600 rounded-lg text-[11px] font-medium transition-colors"
                          >
                            انتخاب به عنوان پیش‌فرض مرجوعی
                          </button>
                        )}
                      </div>

                      {/* Edit & Delete */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAddress(addr);
                            setIsAddressModalOpen(true);
                          }}
                          className="p-1.5 text-muted-foreground hover:text-foreground bg-background border border-border hover:bg-surface-subtle rounded-lg transition-colors"
                          title="ویرایش آدرس"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                          title="حذف آدرس"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications & Automation */}
        <div className="p-6 bg-background border border-border-subtle rounded-2xl space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border-subtle pb-3">
            <Bell className="w-4 h-4 text-primary" />
            <span>اطلاعیه‌ها و اتوماسیون</span>
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableSmsNotifications}
                onChange={(e) => setSettings({ ...settings, enableSmsNotifications: e.target.checked })}
                className="w-4 h-4 text-primary rounded"
              />
              <span className="font-medium text-foreground">ارسال پیامک اطلاع‌رسانی ثبت و تغییر وضعیت سفارش به مشتریان</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableEmailNotifications}
                onChange={(e) => setSettings({ ...settings, enableEmailNotifications: e.target.checked })}
                className="w-4 h-4 text-primary rounded"
              />
              <span className="font-medium text-foreground">ارسال ایمیل فاکتور خرید و خلاصه تیکت پشتیبانی</span>
            </label>
          </div>
        </div>

        {/* Return Window Policies */}
        <div className="p-6 bg-background border border-border-subtle rounded-2xl space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border-subtle pb-3">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>سیاست و مهلت مرجوعی کالا</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-muted-foreground mb-1 font-medium">مهلت مرجوعی کالا (روز / ساعت)</label>
              <input
                type="number"
                value={settings.returnWindowDays}
                onChange={(e) => setSettings({ ...settings, returnWindowDays: Number(e.target.value) })}
                className="w-full h-10 px-3 border border-border-subtle rounded-xl bg-background text-foreground"
              />
              <span className="text-[11px] text-muted-foreground mt-1 block">قانون اصلی سیستم: ۴۸ ساعت (۲ روز) پس از تحویل مرسوله</span>
            </div>

            <label className="flex items-center gap-3 cursor-pointer pt-4">
              <input
                type="checkbox"
                checked={settings.autoApproveReturns}
                onChange={(e) => setSettings({ ...settings, autoApproveReturns: e.target.checked })}
                className="w-4 h-4 text-primary rounded"
              />
              <span className="font-medium text-foreground">تأیید خودکار درخواست‌های مرجوعی به محض ثبت توسط مشتری</span>
            </label>
          </div>
        </div>
      </form>

      {/* Store Address Modal */}
      <StoreAddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSave={handleSaveAddress}
        initialData={editingAddress}
      />
    </div>
  );
}
