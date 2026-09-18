"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";
import { Settings, Store, Bell, Save, ShieldCheck } from "lucide-react";

interface StoreSettings {
  storeName: string;
  contactPhone: string;
  supportEmail: string;
  address: string;
  taxRate: number;
  enableSmsNotifications: boolean;
  enableEmailNotifications: boolean;
  autoApproveReturns: boolean;
  returnWindowDays: number;
}

const SETTINGS_KEY = "mepusham_settings_v1";

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "فروشگاه آنلاین مپوشام",
  contactPhone: "۰۲۱-۸۸۸۸۹۹۹۹",
  supportEmail: "support@mepusham.ir",
  address: "تهران، خیابان ولیعصر، بالاتر از میدان ونک، پلاک ۱۲",
  taxRate: 10,
  enableSmsNotifications: true,
  enableEmailNotifications: true,
  autoApproveReturns: false,
  returnWindowDays: 2,
};

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) {
          setSettings(JSON.parse(stored));
        }
      } catch {
        // Fallback to default
      }
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      showToast("تنظیمات عمومی با موفقیت ذخیره شد.", "success");
    } catch {
      showToast("خطا در ذخیره‌سازی تنظیمات.", "error");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            <span>تنظیمات عمومی فروشگاه</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            پیکربندی اطلاعات عمومی، اطلاعیه‌ها، قوانین مالیاتی و سیاست‌های مرجوعی
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>ذخیره تغییرات</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Store Information */}
        <div className="p-6 bg-background border border-border-subtle rounded-2xl space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border-subtle pb-3">
            <Store className="w-4 h-4 text-primary" />
            <span>اطلاعات عمومی و ارتباطی</span>
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

          <div>
            <label className="block text-muted-foreground mb-1 font-medium">آدرس دفتر مرکزی / انبار</label>
            <textarea
              rows={2}
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full p-3 border border-border-subtle rounded-xl bg-background text-foreground"
            />
          </div>
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
    </div>
  );
}
