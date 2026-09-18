"use client";

import React, { useState, useEffect } from "react";
import { StoreAddress } from "@/types/storeSettings";
import { validateStoreAddress, normalizeDigits } from "@/lib/store-settings/storeSettingsService";
import { provinces, cities } from "@/data/locations";
import { X, MapPin, Building, Phone, User, Hash, Layers } from "lucide-react";

interface StoreAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (addressData: Omit<StoreAddress, "id"> & { id?: string }) => void;
  initialData?: StoreAddress | null;
}

export function StoreAddressModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: StoreAddressModalProps) {
  const [formData, setFormData] = useState<Omit<StoreAddress, "id"> & { id?: string }>({
    title: "",
    recipientName: "",
    phone: "",
    province: "تهران",
    city: "تهران",
    address: "",
    plaque: "",
    floor: "",
    postalCode: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        title: initialData.title || "",
        recipientName: initialData.recipientName || "",
        phone: initialData.phone || "",
        province: initialData.province || "تهران",
        city: initialData.city || "تهران",
        address: initialData.address || "",
        plaque: initialData.plaque || "",
        floor: initialData.floor || "",
        postalCode: initialData.postalCode || "",
      });
    } else {
      setFormData({
        title: "",
        recipientName: "",
        phone: "",
        province: "تهران",
        city: "تهران",
        address: "",
        plaque: "",
        floor: "",
        postalCode: "",
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanData = {
      ...formData,
      phone: normalizeDigits(formData.phone).replace(/\D/g, ""),
      postalCode: normalizeDigits(formData.postalCode).replace(/\D/g, ""),
    };

    const val = validateStoreAddress(cleanData);
    if (!val.isValid) {
      setErrors(val.errors);
      return;
    }

    onSave(cleanData);
    onClose();
  };

  const selectedProvinceObj = provinces.find((p) => p.name === formData.province);
  const selectedProvinceCities = selectedProvinceObj
    ? cities.filter((c) => c.provinceId === selectedProvinceObj.id)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs dir-rtl">
      <div className="bg-background border border-border rounded-2xl w-full max-w-xl overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-subtle/50">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              {formData.id ? "ویرایش آدرس فروشگاه / انبار" : "افزودن آدرس جدید برای فروشگاه"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-subtle rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Address Title */}
            <div>
              <label className="block font-medium text-foreground mb-1">
                عنوان آدرس <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="مثلاً: انبار اصلی تهران، دفتر مشهد..."
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (errors.title) setErrors({ ...errors, title: "" });
                  }}
                  className={`w-full h-9 px-3 bg-background border ${
                    errors.title ? "border-error" : "border-border-subtle"
                  } rounded-xl text-foreground focus:outline-none focus:border-primary`}
                />
              </div>
              {errors.title && (
                <p className="text-[10px] text-error mt-1">{errors.title}</p>
              )}
            </div>

            {/* Recipient Name */}
            <div>
              <label className="block font-medium text-foreground mb-1">
                نام تحویل‌گیرنده / مسئول <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="مثلاً: احمد رضایی"
                  value={formData.recipientName}
                  onChange={(e) => {
                    setFormData({ ...formData, recipientName: e.target.value });
                    if (errors.recipientName) setErrors({ ...errors, recipientName: "" });
                  }}
                  className={`w-full h-9 px-3 bg-background border ${
                    errors.recipientName ? "border-error" : "border-border-subtle"
                  } rounded-xl text-foreground focus:outline-none focus:border-primary`}
                />
              </div>
              {errors.recipientName && (
                <p className="text-[10px] text-error mt-1">{errors.recipientName}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block font-medium text-foreground mb-1">
                شماره تماس <span className="text-error">*</span>
              </label>
              <input
                type="text"
                placeholder="۰۲۱۸۸۸۸۹۹۹۹ یا ۰۹۱۲۳۴۵۶۷۸۹"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (errors.phone) setErrors({ ...errors, phone: "" });
                }}
                className={`w-full h-9 px-3 bg-background border ${
                  errors.phone ? "border-error" : "border-border-subtle"
                } rounded-xl text-foreground font-mono focus:outline-none focus:border-primary`}
              />
              {errors.phone && (
                <p className="text-[10px] text-error mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Postal Code */}
            <div>
              <label className="block font-medium text-foreground mb-1">
                کد پستی (۱۰ رقم) <span className="text-error">*</span>
              </label>
              <input
                type="text"
                maxLength={10}
                placeholder="۱۹۹۴۸۳۳۱۱۱"
                value={formData.postalCode}
                onChange={(e) => {
                  setFormData({ ...formData, postalCode: e.target.value });
                  if (errors.postalCode) setErrors({ ...errors, postalCode: "" });
                }}
                className={`w-full h-9 px-3 bg-background border ${
                  errors.postalCode ? "border-error" : "border-border-subtle"
                } rounded-xl text-foreground font-mono focus:outline-none focus:border-primary`}
              />
              {errors.postalCode && (
                <p className="text-[10px] text-error mt-1">{errors.postalCode}</p>
              )}
            </div>

            {/* Province */}
            <div>
              <label className="block font-medium text-foreground mb-1">
                استان <span className="text-error">*</span>
              </label>
              <select
                value={formData.province}
                onChange={(e) => {
                  const provName = e.target.value;
                  const provObj = provinces.find((p) => p.name === provName);
                  const firstCity = provObj
                    ? cities.find((c) => c.provinceId === provObj.id)?.name || ""
                    : "";
                  setFormData({ ...formData, province: provName, city: firstCity });
                  if (errors.province) setErrors({ ...errors, province: "" });
                }}
                className={`w-full h-9 px-3 bg-background border ${
                  errors.province ? "border-error" : "border-border-subtle"
                } rounded-xl text-foreground focus:outline-none focus:border-primary`}
              >
                {provinces.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
              {errors.province && (
                <p className="text-[10px] text-error mt-1">{errors.province}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block font-medium text-foreground mb-1">
                شهر <span className="text-error">*</span>
              </label>
              <select
                value={formData.city}
                onChange={(e) => {
                  setFormData({ ...formData, city: e.target.value });
                  if (errors.city) setErrors({ ...errors, city: "" });
                }}
                className={`w-full h-9 px-3 bg-background border ${
                  errors.city ? "border-error" : "border-border-subtle"
                } rounded-xl text-foreground focus:outline-none focus:border-primary`}
              >
                {selectedProvinceCities.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.city && (
                <p className="text-[10px] text-error mt-1">{errors.city}</p>
              )}
            </div>
          </div>

          {/* Full Address */}
          <div>
            <label className="block font-medium text-foreground mb-1">
              آدرس کامل پستی <span className="text-error">*</span>
            </label>
            <textarea
              rows={2}
              placeholder="خیابان اصلی، کوچه، پلاک، طبقه..."
              value={formData.address}
              onChange={(e) => {
                setFormData({ ...formData, address: e.target.value });
                if (errors.address) setErrors({ ...errors, address: "" });
              }}
              className={`w-full p-3 bg-background border ${
                errors.address ? "border-error" : "border-border-subtle"
              } rounded-xl text-foreground focus:outline-none focus:border-primary`}
            />
            {errors.address && (
              <p className="text-[10px] text-error mt-1">{errors.address}</p>
            )}
          </div>

          {/* Plaque & Floor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-foreground mb-1">پلاک (اختیاری)</label>
              <input
                type="text"
                placeholder="۱۲"
                value={formData.plaque || ""}
                onChange={(e) => setFormData({ ...formData, plaque: e.target.value })}
                className="w-full h-9 px-3 bg-background border border-border-subtle rounded-xl text-foreground"
              />
            </div>
            <div>
              <label className="block font-medium text-foreground mb-1">طبقه / واحد (اختیاری)</label>
              <input
                type="text"
                placeholder="۱"
                value={formData.floor || ""}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                className="w-full h-9 px-3 bg-background border border-border-subtle rounded-xl text-foreground"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border text-foreground font-semibold rounded-xl hover:bg-surface-subtle transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-xs"
            >
              {formData.id ? "ذخیره تغییرات آدرس" : "ثبت آدرس جدید"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
