"use client";

import React, { useId } from "react";
import { CustomerInformation, CheckoutFormErrors } from "@/types/checkout";
import { provinces, getCitiesByProvince } from "@/data/locations";
import { Input } from "@/components/ui/Input";
import { User, Phone, MapPin, Building, Hash } from "lucide-react";

interface CustomerInformationFormProps {
  customer: CustomerInformation;
  onChange: (field: keyof CustomerInformation, value: string) => void;
  errors: CheckoutFormErrors;
}

export function CustomerInformationForm({
  customer,
  onChange,
  errors,
}: CustomerInformationFormProps) {
  const provinceSelectId = useId();
  const citySelectId = useId();

  const availableCities = getCitiesByProvince(customer.province);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvince = e.target.value;
    onChange("province", newProvince);
    onChange("city", ""); // Reset city when province changes
  };

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-sm font-bold text-foreground pb-2 border-b border-border-subtle flex items-center gap-2">
        <User className="w-4 h-4 text-primary shrink-0" />
        <span>اطلاعات تحویل‌گیرنده و آدرس</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* First Name */}
        <Input
          label="نام *"
          placeholder="مثال: مریم"
          value={customer.firstName}
          onChange={(e) => onChange("firstName", e.target.value)}
          error={errors.firstName}
        />

        {/* Last Name */}
        <Input
          label="نام خانوادگی *"
          placeholder="مثال: محمدی"
          value={customer.lastName}
          onChange={(e) => onChange("lastName", e.target.value)}
          error={errors.lastName}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Phone */}
        <Input
          label="شماره موبایل *"
          placeholder="۰۹۱۲۳۴۵۶۷۸۹"
          type="tel"
          dir="ltr"
          rightIcon={<Phone className="w-4 h-4" />}
          value={customer.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          error={errors.phone}
        />

        {/* Postal Code */}
        <Input
          label="کد پستی *"
          placeholder="۱۰ رقم بدون فاصله"
          type="text"
          dir="ltr"
          maxLength={10}
          rightIcon={<Hash className="w-4 h-4" />}
          value={customer.postalCode}
          onChange={(e) => onChange("postalCode", e.target.value)}
          error={errors.postalCode}
        />
      </div>

      {/* Province & City dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Province Select */}
        <div className="w-full flex flex-col gap-1">
          <label htmlFor={provinceSelectId} className="text-xs font-medium text-foreground select-none">
            استان *
          </label>
          <div className="relative">
            <select
              id={provinceSelectId}
              value={customer.province}
              onChange={handleProvinceChange}
              className={`w-full h-11 bg-surface-subtle border border-transparent rounded-md px-3 text-sm text-foreground focus:outline-none focus:border-primary focus:bg-background transition-colors appearance-none cursor-pointer ${
                errors.province ? "border-error focus:border-error" : ""
              }`}
            >
              <option value="">انتخاب استان...</option>
              {provinces.map((prov) => (
                <option key={prov.id} value={prov.id}>
                  {prov.name}
                </option>
              ))}
            </select>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
              <Building className="w-4 h-4" />
            </div>
          </div>
          {errors.province && <span className="text-xs text-error">{errors.province}</span>}
        </div>

        {/* City Select */}
        <div className="w-full flex flex-col gap-1">
          <label htmlFor={citySelectId} className="text-xs font-medium text-foreground select-none">
            شهر *
          </label>
          <div className="relative">
            <select
              id={citySelectId}
              value={customer.city}
              disabled={!customer.province}
              onChange={(e) => onChange("city", e.target.value)}
              className={`w-full h-11 bg-surface-subtle border border-transparent rounded-md px-3 text-sm text-foreground focus:outline-none focus:border-primary focus:bg-background transition-colors appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.city ? "border-error focus:border-error" : ""
              }`}
            >
              <option value="">
                {customer.province ? "انتخاب شهر..." : "ابتدا استان را انتخاب کنید"}
              </option>
              {availableCities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          {errors.city && <span className="text-xs text-error">{errors.city}</span>}
        </div>
      </div>

      {/* Address Textarea */}
      <div className="w-full flex flex-col gap-1">
        <label htmlFor="checkout-address" className="text-xs font-medium text-foreground select-none">
          آدرس دقیق (خیابان، کوچه، پلاک، طبقه) *
        </label>
        <textarea
          id="checkout-address"
          rows={3}
          placeholder="خیابان اصلی، کوچه، پلاک، طبقه..."
          value={customer.address}
          onChange={(e) => onChange("address", e.target.value)}
          className={`w-full bg-surface-subtle border border-transparent rounded-md p-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:bg-background transition-colors resize-none ${
            errors.address ? "border-error focus:border-error" : ""
          }`}
        />
        {errors.address && <span className="text-xs text-error">{errors.address}</span>}
      </div>
    </div>
  );
}
