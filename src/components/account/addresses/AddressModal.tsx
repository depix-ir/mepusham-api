"use client";

import React, { useState, useEffect } from "react";
import { UserAddress } from "@/types/account";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getProvinces, getCitiesByProvince } from "@/data/locations";
import { normalizeDigits, isValidIranianMobile, isValidPostalCode } from "@/lib/checkout/validation";
import { X, MapPin, Check, ChevronDown } from "lucide-react";

interface AddressModalProps {
  address?: UserAddress | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (addressData: Omit<UserAddress, "id"> & { id?: string }) => void;
}

export function AddressModal({
  address,
  isOpen,
  onClose,
  onSave,
}: AddressModalProps) {
  const [title, setTitle] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [detailedAddress, setDetailedAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;

    if (address) {
      setTitle(address.title);
      setRecipientName(address.recipientName);
      setPhone(address.phone);
      setProvince(address.province);
      setCity(address.city);
      setDetailedAddress(address.address);
      setPostalCode(address.postalCode);
      setIsDefault(address.isDefault);
    } else {
      setTitle("منزل");
      setRecipientName("");
      setPhone("");
      setProvince("تهران");
      setCity("تهران");
      setDetailedAddress("");
      setPostalCode("");
      setIsDefault(false);
    }
    setErrors({});
  }, [address, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const provinces = getProvinces();
  const currentProvinceObj = provinces.find((p) => p.name === province) || provinces[0];
  const cities = currentProvinceObj ? getCitiesByProvince(currentProvinceObj.id) : [];

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvName = e.target.value;
    setProvince(newProvName);
    const newProvObj = provinces.find((p) => p.name === newProvName);
    const newCities = newProvObj ? getCitiesByProvince(newProvObj.id) : [];
    if (newCities.length > 0) {
      setCity(newCities[0].name);
    } else {
      setCity("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};

    const normPhone = normalizeDigits(phone).replace(/[\s-]/g, "");
    const normPostal = normalizeDigits(postalCode).replace(/[\s-]/g, "");

    if (!title.trim()) newErrors.title = "عنوان آدرس را وارد کنید";
    if (!recipientName.trim()) newErrors.recipientName = "نام گیرنده را وارد کنید";

    if (!normPhone) {
      newErrors.phone = "شماره موبایل گیرنده را وارد کنید";
    } else if (!isValidIranianMobile(normPhone)) {
      newErrors.phone = "شماره موبایل معتبر نیست";
    }

    if (!province) newErrors.province = "استان را انتخاب کنید";
    if (!city) newErrors.city = "شهر را انتخاب کنید";
    if (!detailedAddress.trim()) newErrors.address = "آدرس دقیق را وارد کنید";

    if (!normPostal) {
      newErrors.postalCode = "کد پستی را وارد کنید";
    } else if (!isValidPostalCode(normPostal)) {
      newErrors.postalCode = "کد پستی باید ۱۰ رقم باشد";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      id: address?.id,
      title: title.trim(),
      recipientName: recipientName.trim(),
      phone: normPhone,
      province,
      city,
      address: detailedAddress.trim(),
      postalCode: normPostal,
      isDefault,
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center sm:p-4 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="address-modal-title"
    >
      <div
        className="relative w-full h-full h-[100dvh] sm:h-auto sm:max-h-[88vh] sm:max-w-lg md:max-w-xl bg-background border-0 sm:border sm:border-border sm:rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border-subtle bg-surface-subtle/50 shrink-0">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <h3 id="address-modal-title" className="text-sm sm:text-base font-bold text-foreground">
              {address ? "ویرایش آدرس" : "افزودن آدرس جدید"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 -ml-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-surface-muted transition-colors cursor-pointer"
            aria-label="بستن"
          >
            <X className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <Input
              label="عنوان آدرس (مثلاً منزل، محل کار)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={errors.title}
              placeholder="منزل"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="نام گیرنده"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                error={errors.recipientName}
                placeholder="سارا احمدی"
              />
              <Input
                label="شماره موبایل گیرنده"
                type="tel"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={errors.phone}
                placeholder="۰۹۱۲۱۲۳۴۵۶۷"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {/* Province Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">استان</label>
                <div className="relative">
                  <select
                    value={province}
                    onChange={handleProvinceChange}
                    className="w-full h-11 bg-surface-subtle border border-transparent rounded-xl px-3 pl-8 text-xs sm:text-sm text-foreground appearance-none focus:outline-none focus:border-primary focus:bg-background transition-colors cursor-pointer"
                  >
                    {provinces.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* City Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">شهر</label>
                <div className="relative">
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-11 bg-surface-subtle border border-transparent rounded-xl px-3 pl-8 text-xs sm:text-sm text-foreground appearance-none focus:outline-none focus:border-primary focus:bg-background transition-colors cursor-pointer"
                  >
                    {cities.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                آدرس دقیق شامل پلاک و طبقه
              </label>
              <textarea
                rows={3}
                value={detailedAddress}
                onChange={(e) => setDetailedAddress(e.target.value)}
                placeholder="خیابان، کوچه، پلاک، طبقه"
                className={`w-full bg-surface-subtle border border-transparent rounded-xl p-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:bg-background transition-colors resize-none ${
                  errors.address ? "border-error focus:border-error" : ""
                }`}
              />
              {errors.address && (
                <span className="text-xs text-error block">{errors.address}</span>
              )}
            </div>

            <Input
              label="کد پستی (۱۰ رقمی)"
              type="text"
              dir="ltr"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              error={errors.postalCode}
              placeholder="۱۲۳۴۵۶۷۸۹۰"
            />

            <label className="flex items-center gap-2.5 cursor-pointer pt-2 select-none">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
              />
              <span className="text-xs font-medium text-foreground">
                تنظیم به عنوان آدرس پیش‌فرض
              </span>
            </label>
          </div>

          {/* Sticky/Fixed Bottom Footer */}
          <div className="shrink-0 bg-background/95 backdrop-blur-md border-t border-border-subtle p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:py-4 flex items-center justify-end gap-2.5 z-10 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] sm:shadow-none">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              className="hidden sm:inline-flex font-bold cursor-pointer"
            >
              انصراف
            </Button>
            <Button
              type="submit"
              size="md"
              className="w-full sm:w-auto font-bold cursor-pointer"
            >
              <Check className="w-4 h-4 ml-1" />
              ذخیره آدرس
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
