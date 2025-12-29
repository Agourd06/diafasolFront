import axiosClient from "./axiosClient";
import { AuthResponse, LoginPayload, AuthRegisterPayload, ForgotPasswordPayload, ResetPasswordPayload } from "../features/auth/types";

export const loginRequest = async (payload: LoginPayload) => {
  const { data } = await axiosClient.post<AuthResponse>("/auth/login", payload);
  return data;
};

/**
 * Register a new user and company
 * Note: Group creation is handled separately via the groups API
 */
export const registerRequest = async (payload: AuthRegisterPayload) => {
  const { data } = await axiosClient.post<AuthResponse>("/auth/register", payload);
  return data;
};

export const forgotPasswordRequest = async (payload: ForgotPasswordPayload) => {
  const { data } = await axiosClient.post<{ message: string }>("/auth/forgot-password", payload);
  return data;
};

export const resetPasswordRequest = async (payload: ResetPasswordPayload) => {
  const { data } = await axiosClient.post<{ message: string }>("/auth/reset-password", payload);
  return data;
};

