import { apiClient } from "@/shared/lib/api-client";

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
  includedUsers?: number;
  minimumSeats?: number;
  pricingModel?: "included_overage" | "per_seat";
  annualDiscountPercentage?: number;
  prices?: {
    id: string;
    billingCycle: string;
    price: number;
    perUserCost?: number;
  }[];
}

export interface SubscriptionStatus {
  status: string;
  plan?: string;
  startDate?: string;
  endDate?: string;
  daysRemaining?: number;
  autoPayEnabled?: boolean;
  razorpaySubscriptionId?: string;
  message?: string;
  priceAtActivation?: number;
  billingCycle?: string;
  maxUsers?: number;
  perUserCost?: number;
}

export const subscriptionApi = {
  getPlans: () => apiClient<Plan[]>("/subscription/plans"),

  getSubscriptionStatus: (organizationId: string) =>
    apiClient<SubscriptionStatus>(`/subscription/status/${organizationId}`),

  cancelAutoPay: () => apiClient("/subscription/cancel-auto-pay", { method: "POST" }),
};
