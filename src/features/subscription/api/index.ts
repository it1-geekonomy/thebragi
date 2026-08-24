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
