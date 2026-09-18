"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { normalizeDigits, isValidIranianMobile } from "@/lib/checkout/validation";
import { Phone, CheckCircle2, AlertCircle } from "lucide-react";

interface LoginFormProps {
  onSubmit: (phone: string) => Promise<void>;
  onSwitchToRegister: () => void;
  isLoading: boolean;
}

export function LoginForm({
  onSubmit,
  onSwitchToRegister,
  isLoading,
}: LoginFormProps) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const normalized = normalizeDigits(phone).replace(/[\s-]/g, "");
  const digitCount = normalized.length;
  const isValidMobile = isValidIranianMobile(normalized);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const norm = normalizeDigits(rawVal).replace(/[\s-]/g, "");
    if (norm.length <= 11) {
      setPhone(rawVal);
      if (error) setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!normalized) {
      setError("شماره موبایل را وارد کنید");
      return;
    }

    if (!isValidMobile) {
      setError("شماره موبایل معتبر نیست (مثال: ۰۹۱۲۱۲۳۴۵۶۷)");
      return;
    }

    try {
      await onSubmit(normalized);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("خطایی در ارسال کد رخ داد. دوباره تلاش کنید.");
      }
    }
  };

  const renderLiveStatus = () => {
    if (error) return null;

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
          {normalized.length >= 2 && !normalized.startsWith("09") && (
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
          ورود به حساب کاربری
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          برای ورود به حساب، شماره موبایل خود را وارد کنید.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Input
            label="شماره موبایل"
            type="tel"
            dir="ltr"
            maxLength={11}
            placeholder="۰۹۱۲۱۲۳۴۵۶۷"
            value={phone}
            onChange={handlePhoneChange}
            error={error || undefined}
            rightIcon={<Phone className="w-4 h-4 text-muted-foreground" />}
            autoFocus
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
        <span className="text-muted-foreground">حساب کاربری ندارید؟</span>{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-bold text-primary hover:underline cursor-pointer"
        >
          ثبت‌نام کنید
        </button>
      </div>
    </div>
  );
}
