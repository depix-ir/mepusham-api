"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { toPersianDigits } from "@/lib/formatting/currency";
import { normalizeDigits } from "@/lib/checkout/validation";
import { Edit2, ShieldCheck, ArrowRight } from "lucide-react";

interface OtpVerificationProps {
  phone: string;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  onChangePhone: () => void;
  isLoading: boolean;
  initialCooldown?: number;
}

export function OtpVerification({
  phone,
  onVerify,
  onResend,
  onChangePhone,
  isLoading,
  initialCooldown = 45,
}: OtpVerificationProps) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(initialCooldown);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const formattedPhone = toPersianDigits(phone);

  const handleDigitChange = (index: number, value: string) => {
    setError(null);
    const normalized = normalizeDigits(value);
    const char = normalized.slice(-1); // Take last character entered

    if (char && !/^\d$/.test(char)) return; // Only digits

    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    // Auto-advance to next input
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // If filled all 6 digits, auto-submit
    const fullCode = newDigits.join("");
    if (fullCode.length === 6) {
      submitCode(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        // Move back if current input is empty
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowRight" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    setError(null);
    const pastedText = e.clipboardData.getData("text");
    const normalized = normalizeDigits(pastedText).replace(/\D/g, "").slice(0, 6);

    if (!normalized) return;

    const newDigits = ["", "", "", "", "", ""];
    for (let i = 0; i < normalized.length; i++) {
      newDigits[i] = normalized[i];
    }
    setDigits(newDigits);

    if (normalized.length === 6) {
      submitCode(normalized);
    } else {
      inputRefs.current[normalized.length]?.focus();
    }
  };

  const submitCode = async (code: string) => {
    if (code.length !== 6) {
      setError("لطفاً کد ۶ رقمی را کامل وارد کنید.");
      return;
    }
    try {
      await onVerify(code);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("کد واردشده صحیح نیست. لطفاً دوباره تلاش کنید.");
      }
    }
  };

  const handleResendClick = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setError(null);
    try {
      await onResend();
      setCooldown(initialCooldown);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("امکان ارسال مجدد وجود ندارد. بعداً تلاش کنید.");
      }
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="flex justify-start">
        <button
          type="button"
          onClick={onChangePhone}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت</span>
        </button>
      </div>

      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          تأیید شماره موبایل
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          کد تأیید ارسال‌شده به شماره{" "}
          <span dir="ltr" className="font-bold text-foreground inline-block">
            {formattedPhone}
          </span>{" "}
          را وارد کنید.
        </p>
        <button
          type="button"
          onClick={onChangePhone}
          className="inline-flex items-center gap-1 text-xs text-primary font-bold hover:underline cursor-pointer pt-1"
        >
          <Edit2 className="w-3 h-3" />
          <span>ویرایش شماره</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* OTP Input Row */}
        <div className="flex justify-center items-center gap-2 sm:gap-3" dir="ltr">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit ? toPersianDigits(digit) : ""}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              disabled={isLoading}
              className={`w-11 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold bg-surface-subtle border ${
                error
                  ? "border-error focus:border-error focus:ring-1 focus:ring-error"
                  : "border-border focus:border-primary focus:bg-background"
              } rounded-xl transition-all focus:outline-none`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-error font-medium text-center animate-in fade-in">
            {error}
          </p>
        )}

        <Button
          type="button"
          fullWidth
          size="lg"
          onClick={() => submitCode(digits.join(""))}
          disabled={isLoading || digits.join("").length !== 6}
          className="font-bold cursor-pointer"
        >
          {isLoading ? "در حال بررسی..." : "تأیید و ورود"}
        </Button>

        {/* Resend Cooldown Section */}
        <div className="text-center pt-2">
          {cooldown > 0 ? (
            <p className="text-xs text-muted-foreground">
              ارسال مجدد کد تا{" "}
              <span className="font-mono font-bold text-foreground" dir="ltr">
                {toPersianDigits(formatTime(cooldown))}
              </span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendClick}
              disabled={isResending}
              className="text-xs font-bold text-primary hover:underline disabled:opacity-50 cursor-pointer"
            >
              {isResending ? "در حال ارسال..." : "ارسال مجدد کد تأیید"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
