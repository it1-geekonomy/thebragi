import { apiClient } from "@/shared/lib/api-client";

export async function sendOtp(email: string) {
  return apiClient<{ message: string }>("/auth/otp/send", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyOtp(email: string, otp: string) {
  return apiClient<{ accessToken: string; user: any; profile: any }>("/auth/otp/verify", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
}
