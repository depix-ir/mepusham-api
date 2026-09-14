"use client";

import React, { useState, useEffect, useRef } from "react";
import { ShieldCheck, X, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toPersianDigits } from "@/lib/formatting/currency";
import { normalizeDigits } from "@/lib/checkout/validation";

interface OtpVerificationModalProps {
  isOpen: boolean;
  phone: string;
  firstName: string;
  lastName: string;
  onClose: () => void;
  onSuccess: () => void;
  onVerifyOtp: (code: string) => Promise<void>;
  onResendOtp: () => Promise<void>;
}

export function OtpVerificationModal({
  isOpen,
  phone,
  firstName,
  lastName,
  onClose,
  onSuccess,
  onVerifyOtp,
  onResendOtp,
}: OtpVerificationModalProps) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(45);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setDigits(["", "", "", "", "", ""]);
      setError(null);
      setCooldown(45);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Cooldown countdown timer
  useEffect(() => {
    if (!isOpen || cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, cooldown]);

  if (!isOpen) return null;

  const formattedPhone = toPersianDigits(phone);

  const handleDigitChange = (index: number, value: string) => {
    setError(null);
    const normalized = normalizeDigits(value);
    const char = normalized.slice(-1);

    if (char && !/^\d$/.test(char)) return;

    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = newDigits.join("");
    if (fullCode.length === 6) {
      submitCode(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
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
    if (code.length !== 6 || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await onVerifyOtp(code);
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("کد واردشده صحیح نیست. لطفاً دوباره تلاش کنید.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendClick = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setError(null);
    try {
      await onResendOtp();
      setCooldown(45);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("امکان ارسال مجدد کد وجود ندارد. لطفاً بعداً تلاش کنید.");
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
    <div
      dir="rtl"
      className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-background border border-border-subtle rounded-2xl p-6 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute left-4 top-4 p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-subtle transition-colors cursor-pointer"
          aria-label="بستن"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-2 pt-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-foreground">
            تأیید شماره موبایل برای ادامه خرید
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            کد تأیید ۶ رقمی به شماره{" "}
            <span dir="ltr" className="font-bold text-foreground inline-block">
              {formattedPhone}
            </span>{" "}
            ارسال شد.
          </p>
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted">
            <span>ارسال به نام:</span>
            <span className="font-bold text-foreground">
              {firstName} {lastName}
            </span>
          </div>
        </div>

        <div className="space-y-4 pt-1">
          {/* 6 Digit Inputs */}
          <div className="flex justify-center items-center gap-2 sm:gap-2.5" dir="ltr">
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
                disabled={isSubmitting}
                className={`w-10 h-12 sm:w-11 sm:h-12 text-center text-lg font-bold bg-surface-subtle border ${
                  error
                    ? "border-error focus:border-error focus:ring-1 focus:ring-error"
                    : "border-border-subtle focus:border-primary focus:bg-background"
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
            disabled={isSubmitting || digits.join("").length !== 6}
            className="font-bold cursor-pointer h-11"
          >
            {isSubmitting ? "در حال تأیید کد..." : "تأیید و ورود به درگاه پرداخت"}
          </Button>

          {/* Resend Cooldown Section */}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              ویرایش شماره موبایل
            </button>

            {cooldown > 0 ? (
              <p className="text-muted-foreground">
                ارسال مجدد تا{" "}
                <span className="font-mono font-bold text-foreground" dir="ltr">
                  {toPersianDigits(formatTime(cooldown))}
                </span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendClick}
                disabled={isResending}
                className="font-bold text-primary hover:underline disabled:opacity-50 cursor-pointer"
              >
                {isResending ? "در حال ارسال..." : "ارسال مجدد کد"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
