import { apiClient } from "@/lib/api/client";

export interface SendOtpResponse {
  success: boolean;
  message: string;
}

export interface VerifyOtpResponse {
  token: string;
  customer: Record<string, unknown>;
}

export const authApiService = {
  sendOtp: (phone: string) =>
    apiClient.post<SendOtpResponse>("/auth/phone/send-otp", { phone }),

  verifyOtp: (phone: string, code: string) =>
    apiClient.post<VerifyOtpResponse>("/auth/phone/verify", { phone, code }),
};
