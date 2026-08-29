import type { User } from '@prisma/client';

// Public user type for API responses (excludes sensitive fields)
export type PublicUser = {
  id: string;
  email: string;
  name: string | null;
  role: User['role'];
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  resetToken: string | null;
  resetTokenExpiry: Date | null;
};

// Authentication API types
export interface SignupRequest {
  name?: string;
  email: string;
  password: string;
  role?: 'ADMIN' | 'VENDOR' | 'CUSTOMER';
}

export interface SignupResponse {
  user: PublicUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: PublicUser;
}

export interface MeResponse {
  user: PublicUser | null;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface UpdateProfileResponse {
  user: PublicUser;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePasswordResponse {
  message: string;
}

export interface DeleteProfileResponse {
  message: string;
}

export interface LogoutResponse {
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ErrorResponse {
  error: string;
}
