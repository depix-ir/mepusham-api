"use client";

import React, { useState } from "react";
import { AuthMode, OtpStep } from "@/types/auth";
import { useAuth } from "@/store/auth/auth.store";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { OtpVerification } from "./OtpVerification";
import { Container } from "@/components/ui/Container";

export function AccountAuth() {
  const { requestOtp, verifyOtp } = useAuth();

  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [step, setStep] = useState<OtpStep>("phone");

  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (enteredPhone: string) => {
    setIsLoading(true);
    try {
      await requestOtp({ phone: enteredPhone, mode: "login" });
      setPhone(enteredPhone);
      setStep("otp");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (data: {
    firstName: string;
    lastName: string;
    phone: string;
  }) => {
    setIsLoading(true);
    try {
      await requestOtp({
        phone: data.phone,
        mode: "register",
        firstName: data.firstName,
        lastName: data.lastName,
      });
      setPhone(data.phone);
      setFirstName(data.firstName);
      setLastName(data.lastName);
      setStep("otp");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (code: string) => {
    setIsLoading(true);
    try {
      await verifyOtp({
        phone,
        code,
        mode: authMode,
        firstName: authMode === "register" ? firstName : undefined,
        lastName: authMode === "register" ? lastName : undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    await requestOtp({
      phone,
      mode: authMode,
      firstName: authMode === "register" ? firstName : undefined,
      lastName: authMode === "register" ? lastName : undefined,
    });
  };

  return (
    <div className="py-12 sm:py-20 min-h-[70vh] flex items-center justify-center">
      <Container className="w-full">
        <div className="max-w-md mx-auto bg-background border border-border/80 rounded-2xl p-6 sm:p-8 shadow-xs">
          {step === "phone" ? (
            authMode === "login" ? (
              <LoginForm
                onSubmit={handleLoginSubmit}
                onSwitchToRegister={() => setAuthMode("register")}
                isLoading={isLoading}
              />
            ) : (
              <RegisterForm
                onSubmit={handleRegisterSubmit}
                onSwitchToLogin={() => setAuthMode("login")}
                isLoading={isLoading}
              />
            )
          ) : (
            <OtpVerification
              phone={phone}
              onVerify={handleVerifyOtp}
              onResend={handleResendOtp}
              onChangePhone={() => setStep("phone")}
              isLoading={isLoading}
            />
          )}
        </div>
      </Container>
    </div>
  );
}
