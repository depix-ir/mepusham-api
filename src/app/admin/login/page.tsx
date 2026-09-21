"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAdminAuth } from "@/store/admin-auth/adminAuth.store";
import { ShieldCheck, Lock, User, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/admin/dashboard";

  const { login, isLoading } = useAdminAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate return URL to prevent open redirect
  const sanitizeRedirect = (url: string) => {
    if (url.startsWith("/admin") && !url.startsWith("//")) {
      return url;
    }
    return "/admin/dashboard";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!username.trim()) {
      setErrorMessage("لطفاً نام کاربری، ایمیل یا شماره موبایل را وارد کنید.");
      return;
    }
    if (!password.trim()) {
      setErrorMessage("لطفاً رمز عبور را وارد کنید.");
      return;
    }

    setIsSubmitting(true);

    try {
      await login({ username, password });
      const target = sanitizeRedirect(redirectTarget);
      router.replace(target);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("خطایی هنگام ورود به سیستم رخ داده است.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-muted flex flex-col justify-center items-center p-4 dir-rtl font-sans antialiased">
      <div className="w-full max-w-md bg-background border border-border rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground">
            ورود به پنل مدیریت
          </h1>
          <p className="text-xs text-muted-foreground">
            برای دسترسی به پنل مدیریت فروشگاه مپوشــــم وارد شوید.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-error/10 border border-error/20 text-error rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              نام کاربری / ایمیل / شماره موبایل
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="مثلاً: admin یا 09120000000"
                className="w-full h-11 pr-10 pl-3 bg-surface-subtle border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:bg-background transition-all"
                disabled={isSubmitting || isLoading}
              />
              <User className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              رمز عبور
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pr-10 pl-3 bg-surface-subtle border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:bg-background transition-all"
                disabled={isSubmitting || isLoading}
              />
              <Lock className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-xl text-xs font-bold gap-2 mt-2"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>در حال بررسی اطلاعات...</span>
              </>
            ) : (
              <>
                <span>ورود به پنل</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {/* Footer Info */}
        <div className="pt-4 border-t border-border text-center">
          <p className="text-[11px] text-muted-foreground">
            سیستم مدیریت فروشگاه اینترنتی مپوشــــم
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface-muted flex items-center justify-center dir-rtl">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
