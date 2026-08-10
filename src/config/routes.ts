import {
  buildCheckoutPath,
  type BillingCycle,
  type CheckoutParams,
} from "@/features/checkout/lib/checkout-params";

export type { BillingCycle, CheckoutParams };

export const ROUTES = {
  home: "/",
  pricing: "/pricing",
  contact: "/contact",
  checkout: (plan: string, opts?: { seats?: number; cycle?: BillingCycle }) =>
    buildCheckoutPath({ plan, seats: opts?.seats, cycle: opts?.cycle }),
  /** Canonical auth page — sign-in and sign-up share `/sign-in`. */
  signIn: "/sign-in",
  signUp: (plan?: string) => (plan ? `/sign-in?mode=signup&plan=${plan}` : "/sign-in?mode=signup"),
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  dashboard: "/dashboard",
  onboarding: "/app/onboarding",
  billingConfirmation: "/billing-confirmation",
  appWorkspace: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  subscriptionExpired: "/subscription-expired",
  account: {
    profile: "/account/profile",
    billing: "/account/billing",
  },
  legal: {
    privacy: "/legal/privacy",
    terms: "/legal/terms",
  },
};
