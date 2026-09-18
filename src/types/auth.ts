export type AuthMode = "login" | "register";

export type OtpStep = "phone" | "otp";

export type OtpStatus =
  | "idle"
  | "sending"
  | "sent"
  | "verifying"
  | "success"
  | "invalid"
  | "expired"
  | "error";

export type UserRole = "customer" | "admin" | "super_admin";

export interface User {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  role?: UserRole;
  email?: string;
  isActive?: boolean;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

export interface RequestOtpParams {
  phone: string;
  mode: AuthMode;
  firstName?: string;
  lastName?: string;
}

export interface VerifyOtpParams {
  phone: string;
  code: string;
  mode: AuthMode;
  firstName?: string;
  lastName?: string;
}
