import {
  buildCheckoutPath,
  type BillingCycle,
  type CheckoutParams,
  type PurchaseMode,
} from "@/features/checkout/lib/checkout-params";

export type { BillingCycle, CheckoutParams, PurchaseMode };

export const ROUTES = {
  home: "/",
  pricing: "/pricing",
  enterprise: "/enterprise",
  contact: "/contact",
  checkout: (plan: string, opts?: { users?: number; cycle?: BillingCycle; mode?: PurchaseMode }) =>
    buildCheckoutPath({ plan, users: opts?.users, cycle: opts?.cycle, mode: opts?.mode }),
  /** Canonical auth page — sign-in and sign-up share `/sign-in`. */
  signIn: "/sign-in",
  signUp: (plan?: string, opts?: { cycle?: BillingCycle; mode?: PurchaseMode }) => {
    const mode = opts?.mode ?? "trial";
    const query = new URLSearchParams({ mode: "signup", purchaseMode: mode });
    if (plan) {
      query.set("plan", plan);
      query.set(
        "returnTo",
        buildCheckoutPath({ plan, cycle: opts?.cycle ?? "annual", mode }),
      );
    }
    if (opts?.cycle) query.set("cycle", opts.cycle);
    return `/sign-in?${query.toString()}`;
  },
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  dashboard: "/dashboard",
  billingConfirmation: "/billing-confirmation",
  appWorkspace: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  selectOrganization: "/select-organization",
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
