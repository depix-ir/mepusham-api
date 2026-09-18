"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { normalizeDigits, isValidIranianMobile } from "@/lib/checkout/validation";
import { Phone, User as UserIcon, CheckCircle2, AlertCircle } from "lucide-react";

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

  const normalizedPhone = normalizeDigits(phone).replace(/[\s-]/g, "");
  const digitCount = normalizedPhone.length;
  const isValidMobile = isValidIranianMobile(normalizedPhone);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const norm = normalizeDigits(rawVal).replace(/[\s-]/g, "");
    if (norm.length <= 11) {
      setPhone(rawVal);
      if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: typeof errors = {};

    if (!firstName.trim()) {
      newErrors.firstName = "نام را وارد کنید";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "نام خانوادگی را وارد کنید";
    }

    if (!normalizedPhone) {
      newErrors.phone = "شماره موبایل را وارد کنید";
    } else if (!isValidMobile) {
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

  const renderLiveStatus = () => {
    if (errors.phone) return null;

    if (digitCount === 0) {
      return (
        <span className="text-[11px] text-muted-foreground">
          شماره ۱۱ رقمی همراه با ۰۹ (مثال: ۰۹۱۲۱۲۳۴۵۶۷)
        </span>
      );
    }

    if (digitCount < 11) {
      return (
        <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
          <span>تعداد ارقام: {digitCount} از ۱۱</span>
          {normalizedPhone.length >= 2 && !normalizedPhone.startsWith("09") && (
            <span className="text-error font-normal"> - باید با ۰۹ شروع شود</span>
          )}
        </span>
      );
    }

    if (digitCount === 11) {
      if (isValidMobile) {
        return (
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>شماره موبایل معتبر است (۱۱ رقم)</span>
          </span>
        );
      } else {
        return (
          <span className="text-[11px] text-error font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>فرمت شماره نامعتبر است (باید با ۰۹ شروع شود)</span>
          </span>
        );
      }
    }

    return null;
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

        <div className="space-y-1.5">
          <Input
            label="شماره موبایل"
            type="tel"
            dir="ltr"
            maxLength={11}
            placeholder="۰۹۱۲۱۲۳۴۵۶۷"
            value={phone}
            onChange={handlePhoneChange}
            error={errors.phone}
            rightIcon={<Phone className="w-4 h-4 text-muted-foreground" />}
            disabled={isLoading}
          />
          <div className="px-1 min-h-[18px]">
            {renderLiveStatus()}
          </div>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          disabled={isLoading || (digitCount > 0 && !isValidMobile)}
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
