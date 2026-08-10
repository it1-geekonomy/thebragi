import { apiClient } from "@/shared/lib/api-client";

export const paymentApi = {
  createTrialAuth: async (data: {
    name: string;
    superAdminEmail: string;
    superAdminName: string;
    industry?: string;
    adminPassword: string;
    planId: string;
  }) => {
    return apiClient<any>("/razorpay/create-trial-auth", {
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
    return apiClient<any>("/razorpay/verify-trial-auth", {
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
    }
  ) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value);
      }
    });
    
    // Pass organizationId in body/form data
    formData.append("organizationId", organizationId);

    // Because backend uses FileInterceptor('logo'), it requires multipart/form-data
    return apiClient<any>(`/organization-profiles`, {
      method: "POST", // Or PATCH based on backend; POST is safe if it creates
      body: formData,
    });
  }
};
