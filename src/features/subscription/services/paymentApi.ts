import { apiClient } from "@/shared/lib/api-client";

export const paymentApi = {
  getPendingSignup: (email: string) =>
    apiClient<{
      name: string | null;
      email: string;
      company: string;
      industry: string | null;
      planId: string;
      planName: string | null;
      status: string;
    }>(`/razorpay/pending-signup?email=${encodeURIComponent(email)}`),

  captureSignup: async (data: {
    name: string;
    superAdminEmail: string;
    superAdminName: string;
    industry?: string;
    adminPassword: string;
    planId: string;
    phone: string;
    billingCycle?: "monthly" | "annual";
  }) => {
    return apiClient<{
      pendingTrialId: string;
      code?: string;
      planId?: string;
      planName?: string;
    }>("/razorpay/capture-signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  createTrialAuth: async (data: {
    organizationId?: string;
    name?: string;
    superAdminEmail?: string;
    superAdminName?: string;
    industry?: string;
    adminPassword?: string;
    planId: string;
    seats?: number;
    billingCycle?: "monthly" | "annual";
    billing?: {
      legalName: string;
      gstin: string;
      pan: string;
      address: string;
      stateCode: string;
      stateName: string;
      postalCode: string;
      country: string;
    };
  }) => {
    return apiClient<{
      orderId?: string;
      id?: string;
      keyId?: string;
      amountPaise?: number;
      amount?: number;
      currency?: string;
      planName?: string;
      pendingTrialId: string;
    }>("/razorpay/create-trial-auth", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  resumeTrialAuth: async (data: { email: string; password: string }) => {
    return apiClient<{
      orderId?: string;
      id?: string;
      keyId?: string;
      amountPaise?: number;
      amount?: number;
      currency?: string;
      pendingTrialId: string;
      code?: string;
    }>("/razorpay/resume-trial-auth", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  verifyTrialAuth: async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    pendingTrialId: string;
  }) => {
    return apiClient<{ organizationId?: string }>("/razorpay/verify-trial-auth", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateOrganizationProfile: async (
    organizationId: string,
    data: {
      registeredLegalName: string;
      gstin: string;
      panNumber: string;
      streetAddress: string;
      state: string;
      postalCode: string;
      country: string;
    },
  ) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, value);
    });
    formData.append("organizationId", organizationId);
    return apiClient("/organization-profiles", { method: "POST", body: formData });
  },
};
