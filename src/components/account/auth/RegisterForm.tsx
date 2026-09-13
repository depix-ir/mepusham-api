"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { normalizeDigits, isValidIranianMobile } from "@/lib/checkout/validation";
import { Phone, User as UserIcon } from "lucide-react";

interface RegisterFormProps {
  onSubmit: (data: { firstName: string; lastName: string; phone: string }) => Promise<void>;
  onSwitchToLogin: () => void;
  isLoading: boolean;
}

export function RegisterForm({
  onSubmit,
  onSwitchToLogin,
  isLoading,
}: RegisterFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    phone?: string;
    general?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: typeof errors = {};
    const normalizedPhone = normalizeDigits(phone).replace(/[\s-]/g, "");

    if (!firstName.trim()) {
      newErrors.firstName = "نام را وارد کنید";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "نام خانوادگی را وارد کنید";
    }

    if (!normalizedPhone) {
      newErrors.phone = "شماره موبایل را وارد کنید";
    } else if (!isValidIranianMobile(normalizedPhone)) {
      newErrors.phone = "شماره موبایل معتبر نیست (مثال: ۰۹۱۲۱۲۳۴۵۶۷)";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: normalizedPhone,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrors({ general: err.message });
      } else {
        setErrors({ general: "خطایی در درخواست رخ داد. دوباره تلاش کنید." });
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="text-center space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          ایجاد حساب کاربری
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          اطلاعات خود را جهت ایجاد حساب کاربری وارد کنید.
        </p>
      </div>

      {errors.general && (
        <div className="p-3 bg-error/10 border border-error/30 rounded-xl text-xs text-error font-medium text-center">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="نام"
            type="text"
            placeholder="سارا"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: undefined }));
            }}
            error={errors.firstName}
            rightIcon={<UserIcon className="w-4 h-4 text-muted-foreground" />}
            autoFocus
            disabled={isLoading}
          />

          <Input
            label="نام خانوادگی"
            type="text"
            placeholder="احمدی"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: undefined }));
            }}
            error={errors.lastName}
            rightIcon={<UserIcon className="w-4 h-4 text-muted-foreground" />}
            disabled={isLoading}
          />
        </div>

        <Input
          label="شماره موبایل"
          type="tel"
          dir="ltr"
          placeholder="۰۹۱۲۱۲۳۴۵۶۷"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
          }}
          error={errors.phone}
          rightIcon={<Phone className="w-4 h-4 text-muted-foreground" />}
          disabled={isLoading}
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          disabled={isLoading}
          className="font-bold cursor-pointer"
        >
          {isLoading ? "در حال ارسال کد..." : "دریافت کد تأیید"}
        </Button>
      </form>

      <div className="pt-4 border-t border-border-subtle text-center text-xs sm:text-sm">
        <span className="text-muted-foreground">قبلاً ثبت‌نام کرده‌اید؟</span>{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-bold text-primary hover:underline cursor-pointer"
        >
          ورود به حساب
        </button>
      </div>
    </div>
  );
}
