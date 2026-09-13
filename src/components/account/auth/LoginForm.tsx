"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { normalizeDigits, isValidIranianMobile } from "@/lib/checkout/validation";
import { Phone } from "lucide-react";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const normalized = normalizeDigits(phone).replace(/[\s-]/g, "");

    if (!normalized) {
      setError("شماره موبایل را وارد کنید");
      return;
    }

    if (!isValidIranianMobile(normalized)) {
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
        <Input
          label="شماره موبایل"
          type="tel"
          dir="ltr"
          placeholder="۰۹۱۲۱۲۳۴۵۶۷"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (error) setError(null);
          }}
          error={error || undefined}
          rightIcon={<Phone className="w-4 h-4 text-muted-foreground" />}
          autoFocus
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
