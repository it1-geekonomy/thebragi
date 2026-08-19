import { apiClient } from "@/shared/lib/api-client";

export interface BillingPayload {
  legalName: string;
  gstin: string;
  pan: string;
  address: string;
  stateCode: string;
  stateName: string;
  postalCode: string;
  country: string;
}

export interface PendingSignupFields {
  name: string;
  superAdminEmail: string;
  superAdminName: string;
  industry?: string;
  adminPassword: string;
  phone?: string;
  city?: string;
}

export interface TrialAuthRequest extends Partial<PendingSignupFields> {
  organizationId?: string;
  planId: string;
  seats: number;
  billingCycle: "monthly" | "annual";
  billing: BillingPayload;
}

export interface TrialAuthResponse {
  id: string;
  orderId?: string;
  amount: number;
  amountPaise?: number;
  currency?: string;
  keyId?: string;
  pendingTrialId?: string;
}

export interface TrialVerificationRequest {
  organizationId?: string;
  pendingTrialId?: string;
  planId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  billing?: BillingPayload;
}

export type AutoPaySubscriptionRequest = TrialAuthRequest;
export type BuyNowOrderRequest = TrialAuthRequest;

export interface CheckoutQuote {
  baseUsers: number;
  seatCount: number;
  additionalSeats: number;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export interface AutoPaySubscriptionResponse {
  subscription_id?: string;
  subscriptionId?: string;
  amount?: number;
  amountPaise?: number;
  currency?: string;
  keyId?: string;
  quote?: CheckoutQuote;
}

export interface BuyNowOrderResponse {
  id: string;
  orderId: string;
  amount: number;
  amountPaise: number;
  currency: string;
  keyId: string;
  seats?: number;
  quote?: CheckoutQuote;
  pendingTrialId?: string;
}

export interface SubscriptionVerificationRequest {
  organizationId: string;
  planId: string;
  seats?: number;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  razorpay_subscription_id?: string;
}

export interface BuyNowVerificationRequest {
  organizationId?: string;
  pendingTrialId?: string;
  planId: string;
  seats?: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  billing?: BillingPayload;
}

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
}

export const subscriptionApi = {
  getPlans: () => apiClient<Plan[]>("/subscription/plans"),

  getSubscriptionStatus: (organizationId: string) =>
    apiClient<SubscriptionStatus>(`/subscription/status/${organizationId}`),

  cancelAutoPay: () => apiClient("/subscription/cancel-auto-pay", { method: "POST" }),
};

export interface OrganizationProfileUpdate {
  registeredLegalName: string;
  gstin: string;
  panNumber: string;
  streetAddress: string;
  state: string;
  postalCode: string;
  country: string;
}

export const razorpayApi = {
  createTrialAuth: (data: TrialAuthRequest) =>
    apiClient<TrialAuthResponse>("/razorpay/create-trial-auth", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyTrialAuth: (data: TrialVerificationRequest) =>
    apiClient("/razorpay/verify-trial-auth", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createBuyNowOrder: (data: BuyNowOrderRequest) =>
    apiClient<BuyNowOrderResponse>("/razorpay/create-buy-now-order", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyBuyNowPayment: (data: BuyNowVerificationRequest) =>
    apiClient<{ organizationId?: string }>("/razorpay/verify-buy-now", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** Kept for account billing auto-pay management — not used for Buy Now checkout. */
  createAutoPaySubscription: (data: AutoPaySubscriptionRequest) =>
    apiClient<AutoPaySubscriptionResponse>("/razorpay/create-auto-pay-subscription", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifySubscriptionPayment: (data: SubscriptionVerificationRequest) =>
    apiClient("/razorpay/verify-subscription", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateOrganizationProfile: (organizationId: string, data: OrganizationProfileUpdate) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, value);
    });
    formData.append("organizationId", organizationId);
    return apiClient("/organization-profiles", { method: "POST", body: formData });
  },
};
