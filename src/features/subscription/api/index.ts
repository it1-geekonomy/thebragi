import { apiClient } from "@/shared/lib/api-client";
import { type BillingCycle } from "@/features/checkout/lib/checkout-params";

export interface Plan {
  id: string;
  name: string;
  slug: string;
  priceIdMonthly?: string;
  priceIdYearly?: string;
  priceMonthly?: number;
  priceYearly?: number;
  setupCost?: number;
  maxUsers?: number;
  annualDiscountPercentage?: number;
  prices?: {
    id: string;
    billingCycle: string;
    price: number;
  }[];
}

export interface SubscriptionStatus {
  status: "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELLED" | "INACTIVE" | "no_active_subscription";
  plan?: string;
  startDate?: string;
  endDate?: string;
  daysRemaining?: number;
  autoPayEnabled?: boolean;
  razorpaySubscriptionId?: string;
  message?: string;
}

export const subscriptionApi = {
  getPlans: () => apiClient<Plan[]>("/subscription/plans"),
  
  getSubscriptionStatus: (organizationId: string) =>
    apiClient<SubscriptionStatus>(`/subscription/status/${organizationId}`),
    
  cancelAutoPay: () =>
    apiClient("/subscription/cancel-auto-pay", { method: "POST" }),
};

export const razorpayApi = {
  createTrialAuth: (data: any) =>
    apiClient<{ id: string; amount: number }>("/razorpay/create-trial-auth", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyTrialAuth: (data: any) =>
    apiClient("/razorpay/verify-trial-auth", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createAutoPaySubscription: (data: any) =>
    apiClient<{ subscription_id: string }>("/razorpay/create-auto-pay-subscription", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifySubscriptionPayment: (data: any) =>
    apiClient("/razorpay/verify-subscription", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
